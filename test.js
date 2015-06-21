var Partitioner = require("./Partitioner");
var cluster = require("cluster");
var jobs = require("./Application/Jobs");

if(cluster.isWorker){
    jobs.test = function(){
       console.log("the job has been executed by " + process.pid); 
    };
    jobs.sum = function(job){
        var sum = job.data.one + job.data.two;
        console.log("partition: %d, pid: %d, sum: %d", job.partitionId, process.pid, sum);
    };
}

if(cluster.isMaster)
    Start();
    
function Start(){
    var partitioner = new Partitioner({
        numberOfWorkers: 4
    });
    
    setTimeout(function(){
        for(var i=1; i<20; i++){
            partitioner.enqueueJob({
                id: i,
                partitionId: i%3,
                type: "test",
                data: { }
            });
        }
        
        for(var i=20; i<40; i++){
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
        
    }, 5000);
}