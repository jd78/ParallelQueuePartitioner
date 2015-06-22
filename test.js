var Partitioner = require("./Application/Partitioner").Partitioner;
var cluster = require("cluster");
var jobs = require("./Application/Partitioner").Jobs;
var q = require("q");

if(cluster.isWorker) {
    jobs.test = function() {
        return q.Promise(function(resolve){
            console.log("the job has been executed by " + process.pid);
            resolve();
        });
    };
    jobs.sum = function(job){
        return q.Promise(function(resolve){
            var sum = job.data.one + job.data.two;
            console.log("partition: %d, pid: %d, sum: %d", job.partitionId, process.pid, sum);
            resolve();
        });
    };
    jobs.slow = function(job){
        return q.Promise(function(resolve) {
            console.log("slow job started. Id: %d, Partition: %d, pid: %d", job.id, job.partitionId, process.pid);
            for(var i=0; i<999999999; i++){
            
            }
            console.log("slow job completed. Id: %d, Partition: %d, pid: %d", job.id, job.partitionId, process.pid);
            resolve();
        });
    };
}

if(cluster.isMaster)
    Start();
    
function Start(){
    var partitioner = new Partitioner({
        numberOfWorkers: 4
    });
    
    setTimeout(function(){
        for(var i=1; i<20; i++) {
            if(i%2 == 0){
            
                partitioner.enqueueJob({
                    id: i,
                    partitionId: i%3,
                    type: "testt",
                    data: { }
                }, function(err){
                    if(err !== undefined)
                        console.log(err);
                        
                });
            }else{
                partitioner.enqueueJob({
                    id: i,
                    partitionId: i%3,
                    type: "slow",
                    data: { }
                });
            }
        }
        
        for(var i=20; i<40; i++) {
            partitioner.enqueueJob({
                id: i,
                partitionId: i%3,
                type: "sum",
                data: {
                    one: i,
                    two: i+1
                }
            }, function(){
                console.log("CALLBACK CALLED");
            });
        }
        
    }, 2000);
}