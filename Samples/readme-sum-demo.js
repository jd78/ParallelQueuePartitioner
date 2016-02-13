"use strict"

const parallelQueuePartitioner = require("parallel-queue-partitioner")
const Partitioner = parallelQueuePartitioner.Partitioner
const cluster = require("cluster")
const q = require("q")
const logger = require("./Application/Logger")
logger.transports.file.level = 'debug'

if(cluster.isWorker) {
    parallelQueuePartitioner.registerJob('sum', job => {
        return q.Promise(resolve => {
            var sum = job.data.one + job.data.two
            logger.debug("partition: %d, pid: %d, sum: %d", job.partitionId, process.pid, sum)
            resolve()
        })
    })
    
    parallelQueuePartitioner.registerJob('delayedSum', job => {
        return q.Promise(resolve => {
            setTimeout(() => {
                var sum = job.data.one + job.data.two
                logger.debug("partition: %d, pid: %d, sum: %d", job.partitionId, process.pid, sum)
                resolve()
            }, 1000)
    	})
    })
}

let start = () => {
    var partitioner = new Partitioner({
        numberOfWorkers: 4,
        loggerLevel: 'debug'
    })
    
    setTimeout(() => {
		for(var i=1; i<5000; i++) {
            partitioner.enqueueJob({
                id: i,
                partitionId: i%8, //Spreading across the workers
                type: "sum",
                data: { one: i, two: i+1 }
            }, function(){
				logger.debug("sum job %d ended", i)
			})
        }
		
    }, 2000) //Arbitraty deleyer to wait all forks are completed
}

if(cluster.isMaster)
    start()