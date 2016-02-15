"use strict"

const Logger = require("./Logger")
const Message = require("../Entities/Message")
const util = require("util")

let _jobs = new Map();

class Jobs {
    constructor() { }

    executeJob(job) {
        let logger = Logger.instance()
        return new Promise((resolve, reject) => {
            logger.debug("executing job id: %d, partitionId: %d, type: %s, pid: %d", job.id, job.partitionId, job.type, process.pid)
            if (!_jobs.has(job.type)) {
                let err = util.format("the job type %s is not defined", job.type)
                logger.error(err)
                process.send(new Message(job.id, err))
                return reject(err)
            }

            _jobs.get(job.type)(job).then(() => {
                logger.debug("completed job id: %d, partitionId: %d, type: %s, pid: %d", job.id, job.partitionId, job.type, process.pid)
                process.send(new Message(job.id))
                logger.debug("completed notification sent to master for job id: %d, partitionId: %d, type: %s, pid: %d", job.id, job.partitionId, job.type, process.pid)
                process.nextTick(() => { resolve() })
            }).catch(err => {
                logger.error(err)
                process.send(new Message(job.id, err))
                reject(err)
            })
        })
    }
    
    registerJob(type, fn){
        if(_jobs.has(type))
            throw new Error("A job with the same type (name) was already registered")
        
        _jobs.set(type, fn)
    }
}

module.exports = new Jobs()