var cluster = require('cluster');
var jobService = require("./Services/JobService");
var partitionService = require("./Services/PartitionService");
var q = require("q");

var workers = [];
var workerPartitionIndex = 0;
var numberOfWorkers;

function Worker(worker){
    this.worker = worker;
    
    worker.on('message', function(id) {
      console.log("complete notify received for id " + id);
      jobService.done(id);
    });
}

function Jobs(){}

if(cluster.isWorker){
    process.on('message', function(job) { 
        console.log("job " + job.id + " received");
        executeJob(job).then(function(){});
    });
}

function Partitioner(configuration){
    numberOfWorkers = configuration.numberOfWorkers || 1;
    
    if(cluster.isWorker)
        throw new Error("a worker is trying to instantiate a partitioner");
    
    for(var i=0; i < numberOfWorkers; i++){
        workers.push(new Worker(cluster.fork()));
    }
}

Partitioner.prototype.registerJob = function(type, job){
    Jobs.prototype[type] = job;
};

Partitioner.prototype.enqueueJob = function(job, callback){
    if(job === null
        || job === undefined
        || job.id === null
        || job.id === undefined
        || job.partitionId === null
        || job.partitionId === undefined
        || job.type === null
        || job.type === undefined)
        throw new Error("Job null or invalid, should contain id, partitionId, type, data: {}");
    
    partitionService.get(job.partitionId)
    .then(function(partition){
        if(partition == null) {
            var index = ++workerPartitionIndex % numberOfWorkers;
            return partitionService.push(job.partitionId, workers[index].worker);
        }else{
            return partition;
        }
    })
    .then(function(partition){
        jobService.push(job.id, callback).then(function(){
            partition.worker.send(job);   
        });      
    });
};

function executeJob(job){
    console.log(this);
    return q.Promise(function(resolve, reject){
        this.parent[job.type]().then(function(){
            process.send(job.id);
            resolve();
        }).catch(function(err){
            reject(err);
        });
    });
}

module.exports = Partitioner;