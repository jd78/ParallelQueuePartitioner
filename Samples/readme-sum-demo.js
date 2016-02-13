var parallelQueuePartitioner = require("parallel-queue-partitioner");
var Partitioner = parallelQueuePartitioner.Partitioner;
var cluster = require("cluster");
var q = require("q");
var logger = require("./Application/Logger");
logger.transports.file.level = 'debug';

if(cluster.isWorker) {
    parallelQueuePartitioner.registerJob('sum', function(job){
        return q.Promise(function(resolve){
            var sum = job.data.one + job.data.two;
            logger.debug("partition: %d, pid: %d, sum: %d", job.partitionId, process.pid, sum);
            resolve();
        });
    });
    
    parallelQueuePartitioner.registerJob('delayedSum', function(job){
        return q.Promise(function(resolve){
            setTimeout(function(){
                var sum = job.data.one + job.data.two;
                logger.debug("partition: %d, pid: %d, sum: %d", job.partitionId, process.pid, sum);
                resolve();
            }, 1000);
    	});
    });
}

if(cluster.isMaster)
    Start();
    
function Start(){
    var partitioner = new Partitioner({
        numberOfWorkers: 4,
        loggerLevel: 'debug'
    });
    
    setTimeout(function(){
		for(var i=1; i<5000; i++) {
            partitioner.enqueueJob({
                id: i,
                partitionId: i%8, //Spreading across the workers
                type: "sum",
                data: { one: i, two: i+1 }
            }, function(){
				logger.debug("sum job %d ended", i);
			});
        }
		
    }, 2000); //Arbitraty deleyer to wait all forks are completed
}