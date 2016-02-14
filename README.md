ParallelQueuePartitioner
========================

Round-Robin parallel task dispatcher that executes tasks in sequence if related. 
The relationship is defined through the "partitionId".
The partitioner works on top of any queue/broker.

Be aware that the version 2 works only with Node.js v4+

## Installation
    $ npm install parallel-queue-partitioner
    
    For node 0.X (no longer supported)
    $ npm install parallel-queue-partitioner@1.0.1
    
# Usage

In a new js file, first reference the partitioner:

```js
var parallelQueuePartitioner = require('parallel-queue-partitioner');
var Partitioner = parallelQueuePartitioner.Partitioner;
```

then reference cluster

```js
var cluster = require('cluster');
```

We need to register the jobs in each cluster. **Each job must contain a parameter and return a promise!** 

```js
if(cluster.isWorker) {
    parallelQueuePartitioner.registerJob('sum', job => {
        return new Promise(resolve => {
            var sum = job.data.one + job.data.two
            logger.debug("partition: %d, pid: %d, sum: %d", job.partitionId, process.pid, sum)
            resolve()
        })
    })
    
    parallelQueuePartitioner.registerJob('delayedSum', job => {
        return new Promise(resolve => {
            setTimeout(() => {
                var sum = job.data.one + job.data.two
                logger.debug("partition: %d, pid: %d, sum: %d", job.partitionId, process.pid, sum)
                resolve()
            }, 1000)
    	})
    })
}
```

We have to produce the messages only from the master.
A job message must contain:
- An id that identifies the job
- A partitionId, jobs with the same partitionId will be executed by one process in sequence; jobs with different partitionId will be executed in parallel
- A type that defines the job to run, in our case 'sum' or 'delayedSum'
- Optional data

```js
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

if(cluster.isMaster)
    start();
```

## Configuration

The partitioner cab be configured as follow:

- numberOfWorkers, is the number of processes we want to run (default 1)
- cleanIdlePartitionsAfterMinutes, after the given minutes, a job will clean the partition that were not used during that interval (default 15 minutes)
- loggerLevel, 'debug', 'info', 'warn', or 'error' (default 'error')
- consoleLogger, true or false, enable or disable the console logger (default: true)
- fileLogger, true or false, enable or disable the file logger (default: true)
- fileLoggerPath, the path where the logs will be saved (default: "./logger")

```js
const partitioner = new Partitioner({
    numberOfWorkers: 4,
    cleanIdlePartitionsAfterMinutes: 30,
    loggerLevel: 'info',
    consoleLogger: false,
    fileLogger: false,
    fileLoggerPath: "./bin/partitionerLogger"
});
```

## Logger

If enabled, the logger will create the file in the folder specified by the user or, if not specified, in "./logger".
The master and each worker will create its own log.
The filenames are:
- master-pid-{PIDID}-partitioner.log
- worker-pid-{PIDID}-partitioner.log

## Exemple how to use the partitioner with redis

```js

"use strict"

const parallelQueuePartitioner = require('parallel-queue-partitioner');
const cluster = require("cluster")
const process = require('process')

const kue = require('kue')
const queue = kue.createQueue({
  prefix: 'queue',
  redis: {
    host: process.env.IP
  }
})

if(cluster.isWorker) {
    parallelQueuePartitioner.registerJob('test', job => {
        return new Promise(resolve => {
            console.log("the job has been executed by %d", process.pid)
            resolve()
        })
    })
    
    parallelQueuePartitioner.registerJob('sequential', job => {
        return new Promise(resolve => {
            console.log("delayed in-sequence job started. Id: %d, Partition: %d, pid: %d, sequence: %d", job.id, job.partitionId, process.pid, job.data.sequence)
            setTimeout(() => {
                console.log("delayed in-sequence job completed. Id: %d, Partition: %d, pid: %d, sequence: %d", job.id, job.partitionId, process.pid, job.data.sequence)
                resolve()    
            }, 1000)
        })
    })
}

let start = () => {
    var partitioner = new Partitioner({
        numberOfWorkers: 4,
        loggerLevel: 'debug',
        consoleLogger: true,
        fileLogger: true,
        fileLoggerPath: "./bin/logger"
    })
    
    setTimeout(() => {
        
        queue.process('jobs', 256, (job, done) => {
            
            if(job.data.type == "test"){
                partitioner.enqueueJob({
                    id: job.id,
                    partitionId: job.data.partitionId,
                    type: job.data.type,
                    data: { }
                }, err => {
                    if(err) console.log(err)
                    else {   
                        console.log("test job %d done", job.id)
                        done()
                    }
                })
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
                        console.log("sequential job %d done", job.id)
                        done()
                    }else{
                        console.log(err)
                    }
                })
            }
        })
    }, 2000)
}

let id = 0

if(cluster.isMaster) {
    console.log('pushing messages')
    for (let i = 0; i < 50; i++) {
        queue.create('jobs', {
            partitionId: 0,
            type: "sequential",
            sequence: i
        }).save(err => {
            if (err) console.log(err)
        })
    }
    
    for (let i = 0; i < 50; i++) {
        queue.create('jobs', {
            partitionId: 1,
            type: "sequential",
            sequence: i
        }).save(err => {
            if (err) console.log(err)
        })
    }
    
    for (let i = 0; i < 150; i++) {
        queue.create('jobs', {
            partitionId: i % 5,
            type: "test"
        }).save(err => {
            if (err) console.log(err)
        })
    }
    
    start()
}
```