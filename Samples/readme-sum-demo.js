"use strict"

const parallelQueuePartitioner = require("parallel-queue-partitioner")
const Partitioner = parallelQueuePartitioner.Partitioner
const cluster = require("cluster")

if (cluster.isWorker) {
    parallelQueuePartitioner.registerJob('sum', job => {
        return new Promise(resolve => {
            var sum = job.data.one + job.data.two
            console.log("partition: %d, pid: %d, sum: %d", job.partitionId, process.pid, sum)
            resolve()
        })
    })

    parallelQueuePartitioner.registerJob('delayedSum', job => {
        return new Promise(resolve => {
            setTimeout(() => {
                var sum = job.data.one + job.data.two
                console.log("partition: %d, pid: %d, sum: %d", job.partitionId, process.pid, sum)
                resolve()
            }, 1000)
        })
    })
}

let start = () => {
    var partitioner = new Partitioner({
        numberOfWorkers: 8 //number of process workers
    });

    setTimeout(() => {
        for (let i = 1; i < 50; i++) {
            partitioner.enqueueJob({
                id: i,
                partitionId: i % 8, //Spreading across the workers
                type: "sum", //job to run
                data: { one: i, two: i + 1 }
            }, err => { //Optional callback, will be executed once the job is completed, useful to send acks to a broker.
                console.log("sum job ended");
            });
        }

        for (let i = 1; i < 50; i++) {
            partitioner.enqueueJob({
                id: i,
                partitionId: 10, //Only one process will execute these 50 messages in sequence
                type: "delayedSum",
                data: { one: i, two: i * i }
            }, err => {
                console.log("sequential job ended");
            });
        }
    }, 2000); //Arbitrary delayer to wait all forks are completed
}

if (cluster.isMaster)
    start()