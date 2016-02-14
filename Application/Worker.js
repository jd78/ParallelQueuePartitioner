"use strict"

const jobService = require("../Services/JobService")
const cluster = require("cluster")
const jobs = require("./Jobs")
const Logger = require("./Logger")
const variables = require("./CommonVariables")
const queue = require("./Queue")

class Worker {
    constructor(worker) {
        this.worker = worker

        worker.on('message', message => {
            if (message.err) {
                jobService.error(message.id, message.err)
                return
            }

            Logger.instance().debug("master received completed notify for jobId %d", message.id)
            jobService.done(message.id)
        })
    }
}

if (cluster.isWorker) {
    Logger.new(process.env[variables.consoleLogger] === "true", process.env[variables.loggerLevel],
        process.env[variables.fileLogger] === "true", process.env[variables.fileLoggerPath]).then(log => {
            log.info("worker %d registered", process.pid)
        })
         
    process.on('message', job => {
        Logger.instance().debug("job %d received", job.id)
        queue.push(() => { return jobs.executeJob(job) })
    })
    
    queue.processQueue()
}

module.exports = Worker