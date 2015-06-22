var Partitioner = require("./Partitioner").Partitioner;
var cluster = require("cluster");
var jobs = require("./Partitioner").Jobs;

if(cluster.isWorker){
    jobs.test = function(){
       console.log("the job has been executed by " + process.pid); 
    };
    jobs.sum = function(job){
        var sum = job.data.one + job.data.two;
        console.log("partition: %d, pid: %d, sum: %d", job.partitionId, process.pid, sum);
    };
    jobs.slow = function(job){
        console.log("slow job started. Id: %d, Partition: %d, pid: %d", job.id, job.partitionId, process.pid);
        for(var i=0; i<999999999; i++){
            
        }
        console.log("slow job completed. Id: %d, Partition: %d, pid: %d", job.id, job.partitionId, process.pid);
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
                    type: "test",
                    data: { }
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
            });
        }
        
    }, 2000);
}