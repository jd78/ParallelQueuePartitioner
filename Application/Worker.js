var jobService = require("../Services/JobService");
var cluster = require("cluster");
var jobs = require("./Jobs");
var logger = require("./Logger");
var ReadWriteLock  = require("rwlock");
var queueLock = new ReadWriteLock();
var progressLock = new ReadWriteLock();

function Worker(worker){
    this.worker = worker;
    
    worker.on('message', function(message) {
        if(message.err != undefined){
            jobService.error(message.id, message.err);
            return;
        }
        
        logger.debug("master received completed notify for jobId %d", message.id);
        jobService.done(message.id);
    });
}

var queue = [];
var inProgress = false;

if(cluster.isWorker) {
    logger.transports.file.level = process.env["loggerLevel"];
    logger.transports.console.level = process.env["loggerLevel"];
    
    logger.info("worker %d registered", process.pid);

    process.on('message', function(job) { 
        logger.debug("job %d received", job.id);
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