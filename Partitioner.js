"use strict"

const cluster = require('cluster');
const jobService = require("./Services/JobService");
const PartitionService = require("./Services/PartitionService");
const jobs = require("./Application/Jobs");
const Lock = require("./Application/ExecuteLocked");
const lock = new Lock();
const Worker = require("./Application/Worker");
const validator = require("validator");
const utils = require("./Application/Utils");
const variables = require("./Application/CommonVariables");

let _workers = [];
let _workerPartitionIndex = 0;
let _numberOfWorkers;
let _logger;

const defaultConfiguration = {
    numberOfWorkers: 1,
    cleanIdlePartitionsAfterMinutes: 15,
    loggerLevel: "error",
    consoleLogger: true,
    fileLogger: true,
    fileLoggerPath: "./logger"
};

class Partitioner {
    constructor(configuration) {
        if (cluster.isWorker)
            throw new Error("a worker is trying to instantiate a partitioner")

        if (configuration)
            validate(configuration)

        const config = configuration ? configuration : defaultConfiguration
        _numberOfWorkers = utils.coalesce(config.numberOfWorkers, defaultConfiguration.numberOfWorkers)

        this.partitionService = new PartitionService(utils.coalesce(config.cleanIdlePartitionsAfterMinutes, defaultConfiguration.cleanIdlePartitionsAfterMinutes))

        let processEnv = {}
        const Logger = require("./Application/Logger")
        const consoleLogger = utils.coalesce(config.consoleLogger, defaultConfiguration.consoleLogger)
        const fileLogger = utils.coalesce(config.fileLogger, defaultConfiguration.fileLogger)
        const fileLoggerPath = utils.coalesce(config.fileLoggerPath, defaultConfiguration.fileLoggerPath)
        const loggerLevel = utils.coalesce(config.loggerLevel, defaultConfiguration.loggerLevel)
        Logger.new(consoleLogger, loggerLevel, fileLogger, fileLoggerPath).then(log => {
            _logger = log
            processEnv[variables.loggerLevel] = loggerLevel
            processEnv[variables.consoleLogger] = consoleLogger
            processEnv[variables.fileLogger] = fileLogger
            processEnv[variables.fileLoggerPath] = fileLoggerPath

            for (var i = 0; i < _numberOfWorkers; i++) {
                _workers.push(new Worker(cluster.fork(processEnv)));
            }
        })
    }

    enqueueJob(job, callback) {
        if (!utils.areNotNull(job, job.id, job.partitionId, job.type))
            throw new Error("Job null or invalid, should contain id, partitionId, type, data: {}")

        lock.execWrite(() => {
            return this.partitionService.get(job.partitionId)
                .then(partition => {
                    if (utils.isNull(partition)) {
                        const index = ++_workerPartitionIndex % _numberOfWorkers
                        return this.partitionService.push(job.partitionId, _workers[index].worker)
                    } else {
                        return partition
                    }
                })
        }).then(partition => {
            jobService.push(job.id, callback).then(() => {
                _logger.debug("jobId: %d, partitionId: %d, type: %s, pushed", job.id, job.partitionId, job.type)
                partition.worker.send(job)
            })
        })
    }
}

function validate(configuration) {
    if (configuration.numberOfWorkers !== undefined && !validator.isInt(configuration.numberOfWorkers, { min: 1 }))
        throw new Error("numberOfWorkers should be an integer >= 1");
    if (configuration.cleanIdlePartitionsAfterMinutes !== undefined && !validator.isInt(configuration.cleanIdlePartitionsAfterMinutes, { min: 1 }))
        throw new Error("cleanIdlePartitionsAfterMinutes should be an integer >= 1");
    if (configuration.loggerLevel !== undefined && !(
        validator.equals(configuration.loggerLevel, 'debug')
        || validator.equals(configuration.loggerLevel, 'info')
        || validator.equals(configuration.loggerLevel, 'warn')
        || validator.equals(configuration.loggerLevel, 'error'))
        )
        throw new Error("loggerLevel should be debug, info, warn or error");
    if (configuration.consoleLogger !== undefined && !(
        validator.equals(configuration.consoleLogger, true)
        || validator.equals(configuration.consoleLogger, false))
        )
        throw new Error("consoleLogger should be true or false");
    if (configuration.fileLogger !== undefined && !(
        validator.equals(configuration.fileLogger, true)
        || validator.equals(configuration.fileLogger, false))
        )
        throw new Error("fileLogger should be true or false");
    if (configuration.fileLoggerPath !== undefined && typeof (configuration.fileLoggerPath) !== typeof (defaultConfiguration.fileLoggerPath))
        throw new Error("fileLoggerPath should be a string");
}

module.exports = {
    Partitioner: Partitioner,
    registerJob: function (title, func) {
        jobs[title] = func;
    }
};