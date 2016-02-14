"use strict"

const Partitioner = require("../Partitioner").Partitioner
const cluster = require("cluster")
const registerJob = require("../Partitioner").registerJob

if(cluster.isWorker) {
    registerJob('test', job => {
        return new Promise(resolve => {
            console.log("the job has been executed by " + process.pid)
            resolve()
        })
    })
    registerJob('sum', job => {
        return new Promise(resolve => {
            var sum = job.data.one + job.data.two
            console.log("partition: %d, pid: %d, sum: %d", job.partitionId, process.pid, sum)
            resolve()
        })
    })
    registerJob('slow', job => {
        return new Promise(resolve => {
            console.log("slow job started. Id: %d, Partition: %d, pid: %d", job.id, job.partitionId, process.pid)
            for(var i=0; i<999999999; i++){
            
            }
            console.log("slow job completed. Id: %d, Partition: %d, pid: %d", job.id, job.partitionId, process.pid)
            resolve()
        })
    })
}

let start = () => {
    var partitioner = new Partitioner({
        numberOfWorkers: 4
    })
    
    setTimeout(function(){
        for(var i=1; i<20; i++) {
            if(i%2 == 0){
            
                partitioner.enqueueJob({
                    id: i,
                    partitionId: i%3,
                    type: "testt", //undefined job exception!!
                    data: { }
                }, function(err){
                    if(err !== undefined)
                        console.log(err)
                        
                })
            }else{
                partitioner.enqueueJob({
                    id: i,
                    partitionId: i%3,
                    type: "slow",
                    data: { }
                })
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
                console.log("CALLBACK CALLED")
            })
        }
        
    }, 2000)
}

if(cluster.isMaster)
    start()