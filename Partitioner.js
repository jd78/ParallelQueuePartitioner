var cluster = require('cluster');
var jobService = require("./Services/JobService");
var PartitionService = require("./Services/PartitionService");
var jobs = require("./Application/Jobs");
var Lock = require("./Application/ExecuteLocked");
var lock = new Lock();
var Worker = require("./Application/Worker");
var logger = require("./Application/Logger");
var util = require("util");


var workers = [];
var workerPartitionIndex = 0;
var numberOfWorkers;

function Partitioner(configuration){
    numberOfWorkers = configuration.numberOfWorkers || 1;
    this.partitionService = new PartitionService(configuration.cleanIdlePartitionsAfterMinutes || 15);
    if(configuration.loggerLevel !== undefined){
        logger.transports.file.level = configuration.loggerLevel;
    }
    
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
            logger.debug(util.format("job %d, partitionId %d, type %s, pushed", job.id, job.partitionId, job.type));
            partition.worker.send(job);   
        });      
    });
};

module.exports = {
    Partitioner: Partitioner,
    Jobs: jobs
};