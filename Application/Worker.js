var jobService = require("../Services/JobService");
var cluster = require("cluster");
var jobs = require("./Jobs");
var ReadWriteLock  = require("rwlock");
var queueLock = new ReadWriteLock();
var progressLock = new ReadWriteLock();
var Logger = require("./Logger");
var variables = require("./CommonVariables");

function Worker(worker){
    this.worker = worker;
    
    worker.on('message', function(message) {
        if(message.err != undefined){
            jobService.error(message.id, message.err);
            return;
        }
        
        Logger.instance().debug("master received completed notify for jobId %d", message.id);
        jobService.done(message.id);
    });
}

var queue = [];
var inProgress = false;

if(cluster.isWorker) {
    Logger.new(process.env[variables.consoleLogger] === "true", process.env[variables.loggerLevel],
        process.env[variables.fileLogger] === "true", process.env[variables.fileLoggerPath]).then(function(log){
        log.info("worker %d registered", process.pid);
    });
    
    process.on('message', function(job) { 
        Logger.instance().debug("job %d received", job.id);
        queueLock.writeLock(function(release){
            queue.push(function() { return jobs.executeJob(job) });
            release();
        });
        tryProcessQueue(inProgress);
    });
}

function tryProcessQueue(isInProgress){
    var mustStop = false;
    progressLock.writeLock(function(release){
        if(isInProgress)
            mustStop = true;
        inProgress = true;
        release();
    });
    
    if(mustStop)
        return;
    
    var job;
    queueLock.writeLock(function(release){
        job = queue.shift();
        release();
    });
    job().then(function(){
        tryContinueProcess();
    }).catch(function(err){
        tryContinueProcess();
    });
}

function tryContinueProcess(){
    if(queue.length > 0)
        tryProcessQueue(false);
    else {
        progressLock.writeLock(function(release){
            inProgress = false;
            release();
        });
    }
}

module.exports = Worker;