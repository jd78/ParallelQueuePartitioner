//sudo service redis-server start

var Partitioner = require("../Partitioner").Partitioner;
var registerJob = require("../Partitioner").registerJob;
var cluster = require("cluster");
var q = require("q");
var process = require('process');

var kue = require('kue');
var queue = kue.createQueue({
  prefix: 'queue',
  redis: {
    host: process.env.IP
  }
});

if(cluster.isWorker) {
    registerJob('test', function(job){
        return q.Promise(function(resolve){
            console.log("the job has been executed by %d", process.pid);
            resolve();
        });
    });
    
    registerJob('sequential', function(job) {
        return q.Promise(function(resolve) {
            console.log("slow in-sequence job started. Id: %d, Partition: %d, pid: %d, sequence: %d", job.id, job.partitionId, process.pid, job.data.sequence);
            for(var i=0; i<999999999; i++){
            
            }
            console.log("slow in-sequence job completed. Id: %d, Partition: %d, pid: %d, sequence: %d", job.id, job.partitionId, process.pid, job.data.sequence);
            resolve();
        });
    });
}

var id=0;

if(cluster.isMaster) {
    console.log('pushing messages');
    for (var i = 0; i < 20; i++) {
        queue.create('jobs', {
            partitionId: 0,
            type: "sequential",
            sequence: i
        }).save(function(err) {
            if (err) console.log(err);
        });
    }
    
    for (var i = 0; i < 20; i++) {
        queue.create('jobs', {
            partitionId: i % 5,
            type: "test"
        }).save(function(err) {
            if (err) console.log(err);
        });
    }
    
    start();
}
    
function start(){
    var partitioner = new Partitioner({
        numberOfWorkers: 4
    });
    
    setTimeout(function(){
        
        queue.process('jobs', 256, function(job, done) {
            
            if(job.data.type == "test"){
                partitioner.enqueueJob({
                    id: job.id,
                    partitionId: job.data.partitionId,
                    type: job.data.type,
                    data: { }
                }, function(err){
                    if(err === undefined){
                        console.log("test job %d done", id);
                        done();
                    }else{
                        console.log(err);
                    }
                });
            }
            
            if(job.data.type == "sequential"){
                partitioner.enqueueJob({
                    id: job.id,
                    partitionId: job.data.partitionId,
                    type: job.data.type,
                    data: {
                        sequence: job.data.sequence
                    }
                }, function(err){
                    if(err === undefined){
                        console.log("sequential job %d done", id);
                        done();
                    }else{
                        console.log(err);
                    }
                });
            }
        });
    }, 2000);
}