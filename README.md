ParallelQueuePartitioner
========================

Round-Robin parallel task dispatcher that executes tasks in sequence if related. 
The relationship is defined through the "partitionId".
The partitioner works on top of any queue/broker.

## Installation
    $ npm install parallel-queue-partitioner --no-bin-links
    
# Usage

For the demo we will use Q. 

    $ npm install q

In a new js file, first reference the partitioner:

```js
var parallelQueuePartitioner = require('parallel-queue-partitioner');
var Partitioner = parallelQueuePartitioner.Partitioner;
```

then reference q and cluster

```js
var q = require('q');
var cluster = require('cluster');
```

We need to register the jobs in each cluster. **Each job must contain a parameter and return a promise!** 

```js
if(cluster.isWorker) {
    registerJob('sum', function(job){
        return q.Promise(function(resolve){
            var sum = job.data.one + job.data.two;
            console.log("partition: %d, pid: %d, sum: %d", job.partitionId, process.pid, sum);
            resolve();
        });
    });
    
    registerJob('delayedSum', function(job){
        return q.Promise(function(resolve){
            setTimeout(function(){
                var sum = job.data.one + job.data.two;
                console.log("partition: %d, pid: %d, sum: %d", job.partitionId, process.pid, sum);
                resolve();
            }, 1000);
    	});
    });
}
```

We have to produce the messages only from the master.
A job message must contain:
- An id that identifies the job
- A partitionId, jobs with the same partitionId will be executed by one process in sequence; jobs with different partitionId will be executed in parallel
- A type that defines the job to run, in our case 'sum' or 'delayedSum'
- Optional data

```js
if(cluster.isMaster)
    Start();
    
function Start(){
    var partitioner = new Partitioner({
        numberOfWorkers: 8 //number of process workers
    });
    
    setTimeout(function(){
		for(var i=1; i<50; i++) {
            partitioner.enqueueJob({
                id: i, 
                partitionId: i%8, //Spreading across the workers
                type: "sum", //job to run
                data: { one: i, two: i+1 }
            }, function(err){ //Optional callback, will be executed once the job is completed, useful to send acks to a broker.
				console.log("sum job ended");
			});
        }
		
		for(var i=1; i<50; i++) {
            partitioner.enqueueJob({
                id: i,
                partitionId: 10, //Only one process will execute these 50 messages in sequence
                type: "delayedSum",
                data: { one: i, two: i*i }
            }, function(err){
				console.log("sequential job ended");
			});
        }
    }, 2000); //Atbitraty delayer to wait all forks are completed
}
```

## Configuration

The partitioner cab be configured as follow:

- numberOfWorkers, is the number of processes we want to run (default 1)
- cleanIdlePartitionsAfterMinutes, after the given minutes, a job will clean the partition that are not in use for that given time (default 15 minutes)
- loggerLevel, 'debug', 'info', 'warn', or 'error' (default 'error')
- consoleLogger, true or false, enable or disable the console logger (default: true);
- fileLogger, true or false, enable or disable the file logger (default: true);

```js
var partitioner = new Partitioner({
    numberOfWorkers: 4,
    cleanIdlePartitionsAfterMinutes: 30,
    loggerLevel: 'info',
    consoleLogger: false,
    fileLogger: false
});
```

## Logger

A logger will be created in the folder ./bin/parallel-queue-partitioner.
Each worker will create its own log. 

## Exemple how to use the partitioner with redis

```js

var parallelQueuePartitioner = require('parallel-queue-partitioner');
var Partitioner = parallelQueuePartitioner.Partitioner;
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
    parallelQueuePartitioner.registerJob('test', function(job){
        return q.Promise(function(resolve){
            console.log("the job has been executed by %d", process.pid);
            resolve();
        });
    });
    
    parallelQueuePartitioner.registerJob('sequential', function(job) {
        return q.Promise(function(resolve) {
            console.log("delayed in-sequence job started. Id: %d, Partition: %d, pid: %d, sequence: %d", job.id, job.partitionId, process.pid, job.data.sequence);
            setTimeout(function(){
                console.log("delayed in-sequence job completed. Id: %d, Partition: %d, pid: %d, sequence: %d", job.id, job.partitionId, process.pid, job.data.sequence);
                resolve();    
            }, 1000);
        });
    });
}

if(cluster.isMaster) {
    console.log('pushing messages');
    for (var i = 0; i < 50; i++) {
        queue.create('jobs', {
            partitionId: 0,
            type: "sequential",
            sequence: i
        }).save(function(err) {
            if (err) console.log(err);
        });
    }
    
    for (var i = 0; i < 50; i++) {
        queue.create('jobs', {
            partitionId: 1,
            type: "sequential",
            sequence: i
        }).save(function(err) {
            if (err) console.log(err);
        });
    }
    
    for (var i = 0; i < 150; i++) {
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
        numberOfWorkers: 4,
        loggerLevel: 'info'
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
                        console.log("test job %d done", job.id);
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
                        console.log("sequential job %d done", job.id);
                        done();
                    }else{
                        console.log(err);
                    }
                });
            }
        });
    }, 2000);
}
```