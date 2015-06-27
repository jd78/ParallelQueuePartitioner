var parallelQueuePartitioner = require("parallel-queue-partitioner");
var Partitioner = parallelQueuePartitioner.Partitioner;
var cluster = require("cluster");
var registerJob = require("parallel-queue-partitioner").registerJob;
var q = require("q");

if(cluster.isWorker) {
    parallelQueuePartitioner.registerJob('sum', function(job){
        return q.Promise(function(resolve){
            var sum = job.data.one + job.data.two;
            console.log("partition: %d, pid: %d, sum: %d", job.partitionId, process.pid, sum);
            resolve();
        });
    });
    
    parallelQueuePartitioner.registerJob('delayedSum', function(job){
        return q.Promise(function(resolve){
            setTimeout(function(){
                var sum = job.data.one + job.data.two;
                console.log("partition: %d, pid: %d, sum: %d", job.partitionId, process.pid, sum);
                resolve();
            }, 1000);
    	});
    });
}

if(cluster.isMaster)
    Start();
    
function Start(){
    var partitioner = new Partitioner({
        numberOfWorkers: 8
    });
    
    setTimeout(function(){
		for(var i=1; i<50; i++) {
            partitioner.enqueueJob({
                id: i,
                partitionId: i%8, //Spreading across the workers
                type: "sum",
                data: { one: i, two: i+1 }
            }, function(){
				console.log("sum job ended");
			});
        }
		
		for(var i=1; i<50; i++) {
            partitioner.enqueueJob({
                id: i,
                partitionId: 10, //Only one process will execute these 50 messages in sequence
                type: "delayedSum",
                data: { one: i, two: i*i }
            }, function(){
				console.log("sequential job ended");
			});
        }
    }, 2000); //Atbitraty deleyer to wait all forks are completed
}