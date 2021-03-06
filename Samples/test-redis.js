//sudo service redis-server start

"use strict"

const Partitioner = require("../Partitioner").Partitioner
const registerJob = require("../Partitioner").registerJob
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
    registerJob('test', job => {
        return new Promise(resolve => {
            console.log("the job has been executed by %d", process.pid)
            resolve()
        })
    })
    
    registerJob('sequential', job => {
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