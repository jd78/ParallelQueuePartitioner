"use strict"

const _ = require("underscore");
const moment = require("moment");
const q = require("q");
const Logger = require("../Application/Logger");
const util = require("util");

const Lock = require("../Application/ExecuteLocked");
const lock = new Lock();

let _partitions = new Map();
let _cleanIdlePartitionsAfterMinutes;

function Partition(partitionId, worker) {
    var self = this;
    this.partitionId = partitionId;
    this.worker = worker;
    this.updatedAt = moment().utc().format();
    
    setInterval(function() {
        var logger = Logger.instance();
        logger.info(util.format("Partition cleanup fired for %d", partitionId));
        if(self.updatedAt <= moment().utc().subtract(_cleanIdlePartitionsAfterMinutes, 'minutes').format())
            lock.execWrite(function(){ 
                return q.Promise(function(resolve){
                  _partitions.delete(self.partitionId)
                  logger.info(util.format("Partition %d cleaned", partitionId));
                  resolve();
                });
            });
        logger.info(util.format("Partition cleanup completed for %d", partitionId));
    }, _cleanIdlePartitionsAfterMinutes * 60 * 1000);
}

function PartitionService(cleanIdlePartitions){
    if(cleanIdlePartitions === null || cleanIdlePartitions === undefined || isNaN(parseInt(cleanIdlePartitions)) || cleanIdlePartitions <= 0)
        throw new Error("cleanIdlePartitionsAfterMinutes required integer greater than 0");
    
    _cleanIdlePartitionsAfterMinutes = cleanIdlePartitions;
}

PartitionService.prototype.get = function(partitionId) {
    return lock.execRead(function(){
       return q.Promise(function(resolve, reject){
            try {
                if(!_partitions.has(partitionId))
                    return resolve(null)
                
                let partition = _partitions.get(partitionId)
                partition.updatedAt = moment().utc().format();
                resolve(partition);
            } catch(ex){
                Logger.instance().error(ex);
                reject(ex);
            }
        }); 
    });
};

PartitionService.prototype.push = function(partitionId, worker) {
    return lock.execWrite(function() {
        return q.Promise(function(resolve){
            var partition = new Partition(partitionId, worker);
            _partitions.set(partitionId, partition);
            resolve(partition);
        });
    });
};

module.exports = PartitionService;