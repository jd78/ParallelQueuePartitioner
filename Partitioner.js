var cluster = require('cluster');
var jobService = require("./Services/JobService");
var PartitionService = require("./Services/PartitionService");
var q = require("q");
var jobs = require("./Application/Jobs");
var Lock = require("./Infrastructure/ExecuteLocked");
var lock = new Lock();
var util = require("util");


var workers = [];
var workerPartitionIndex = 0;
var numberOfWorkers;

function Worker(worker){
    this.worker = worker;
    
    worker.on('message', function(message) {
        if(message.err != undefined){
            jobService.error(message.id, message.err);
            return;
        }
        
        console.log("complete notify received for id " + message.id);
        jobService.done(message.id);
    });
}

function Message(id, err){
    this.id = id;
    this.err = err;
}

if(cluster.isWorker) {
    console.log("worker %d registered", process.pid);
    process.on('message', function(job) { 
        console.log("job " + job.id + " received");
        executeJob(job).then(function(){});
    });
}

function Partitioner(configuration){
    numberOfWorkers = configuration.numberOfWorkers || 1;
    this.partitionService = new PartitionService(configuration.cleanIdlePartitionsAfterMinutes || 15);
    
    if(cluster.isWorker)
        throw new Error("a worker is trying to instantiate a partitioner");
    
    for(var i=0; i < numberOfWorkers; i++){
        workers.push(new Worker(cluster.fork()));
    }
}

Partitioner.prototype.enqueueJob = function(job, callback){
    var self = this;
    if(job === null
        || job === undefined
        || job.id === null
        || job.id === undefined
        || job.partitionId === null
        || job.partitionId === undefined
        || job.type === null
        || job.type === undefined)
        throw new Error("Job null or invalid, should contain id, partitionId, type, data: {}");
    
    lock.execWrite(function(){
        return self.partitionService.get(job.partitionId)
            .then(function(partition){
                if(partition == null) {
                    var index = ++workerPartitionIndex % numberOfWorkers;
                    return self.partitionService.push(job.partitionId, workers[index].worker);
                }else{
                    return partition;
                }
            });
    }).then(function(partition){
        jobService.push(job.id, callback).then(function(){
            partition.worker.send(job);   
        });      
    });
};

function executeJob(job){
    return q.Promise(function(resolve, reject){
        if(jobs[job.type] === undefined) {
            var err = util.format("the job type %s is not defined", job.type);
            process.send(new Message(job.id, err));
            return reject(err);
        }
        
        jobs[job.type](job).then(function(){
            process.send(new Message(job.id));
            resolve();
        }).catch(function(err) {
            process.send(new Message(job.id, err));
            reject(err);
        });
    });
}

module.exports = {
    Partitioner: Partitioner,
    Jobs: jobs
};