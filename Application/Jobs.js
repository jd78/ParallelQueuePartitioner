"use strict"

const Logger = require("./Logger")
const Message = require("../Entities/Message")
const util = require("util")

class Jobs {
    constructor() { }

    executeJob(job) {
        let logger = Logger.instance()
        return new Promise((resolve, reject) => {
            logger.debug("executing job id: %d, partitionId: %d, type: %s, pid: %d", job.id, job.partitionId, job.type, process.pid)
            if (!this[job.type]) {
                let err = util.format("the job type %s is not defined", job.type)
                logger.error(err)
                process.send(new Message(job.id, err))
                return reject(err)
            }

            this[job.type](job).then(() => {
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
}

module.exports = new Jobs()