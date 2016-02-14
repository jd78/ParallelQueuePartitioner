"use strict"

const winston = require("winston")
const util = require("util")
const mkdirp = require("mkdirp")
const cluster = require("cluster")

let logger

let newLogger = (enableConsoleLogging, loggerLevel, enableFileLogger, fileLoggerPath) => {
    return new Promise(resolve => {

        logger = new (winston.Logger)({
            transports: []
        })

        if (enableConsoleLogging)
            logger.add(winston.transports.Console, { level: loggerLevel })

        if (enableFileLogger) {
            mkdirp(fileLoggerPath, err => {
                if (err) throw new Error(err)
                logger.add(winston.transports.File, {
                    filename: util.format("%s/%s-pid-%s-partitioner.log", fileLoggerPath, cluster.isMaster ? "master" : "worker", process.pid),
                    handleExceptions: true,
                    exitOnError: false,
                    level: loggerLevel, //'error', info, warning, error
                    maxsize: 625000,
                    zippedArchive: true
                })
            })
        }

        resolve(logger)
    })
}

module.exports = {
    new: newLogger,
    instance: function () { return logger }
}