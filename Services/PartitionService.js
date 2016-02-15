"use strict"

const _ = require("underscore")
const moment = require("moment")
const Logger = require("../Application/Logger")
const util = require("util")

const Lock = require("../Application/ExecuteLocked")
const lock = new Lock()

let _partitions = new Map()
let _cleanIdlePartitionsAfterMinutes

class Partition {
    constructor(partitionId, worker) {
        this.partitionId = partitionId
        this.worker = worker
        this.updatedAt = moment().utc().format()
        this.isAliveCheck = setInterval(() => {
            var logger = Logger.instance()
            logger.info(util.format("Partition cleanup fired for %d", partitionId))
            if (this.updatedAt <= moment().utc().subtract(_cleanIdlePartitionsAfterMinutes, 'minutes').format())
                lock.execWrite(() => {
                    return new Promise(resolve => {
                        _partitions.delete(this.partitionId)
                        resolve()
                        
                        logger.info(util.format("Partition %d cleaned", partitionId))
                        clearInterval(this.isAliveCheck)
                    })
                })
            logger.info(util.format("Partition cleanup completed for %d", partitionId))
        }, _cleanIdlePartitionsAfterMinutes * 60 * 1000)
    }
}

class PartitionService {
    constructor(cleanIdlePartitions) {
        if (!cleanIdlePartitions || isNaN(parseInt(cleanIdlePartitions)) || cleanIdlePartitions <= 0)
            throw new Error("cleanIdlePartitionsAfterMinutes required integer greater than 0")

        _cleanIdlePartitionsAfterMinutes = cleanIdlePartitions
    }

    get(partitionId) {
        return lock.execRead(() => {
            return new Promise((resolve, reject) => {
                try {
                    if (!_partitions.has(partitionId))
                        return resolve(null)

                    let partition = _partitions.get(partitionId)
                    partition.updatedAt = moment().utc().format()
                    resolve(partition)
                } catch (ex) {
                    Logger.instance().error(ex)
                    reject(ex)
                }
            })
        })
    }

    push(partitionId, worker) {
        return lock.execWrite(() => {
            return new Promise(resolve => {
                var partition = new Partition(partitionId, worker)
                _partitions.set(partitionId, partition)
                resolve(partition)
            })
        })
    }
}

module.exports = PartitionService