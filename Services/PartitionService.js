var _ = require("underscore");
var moment = require("moment");
var q = require("q");
var logger = require("../Application/Logger");
var util = require("util");

var Lock = require("../Application/ExecuteLocked");
var lock = new Lock();

var partitions = [];
var cleanIdlePartitionsAfterMinutes;

function Partition(partitionId, worker) {
    var self = this;
    this.partitionId = partitionId;
    this.worker = worker;
    this.updatedAt = moment().utc().format();
    
    setInterval(function() {
        logger.info(util.format("Partition cleanup fired for %d", partitionId));
        if(self.updatedAt < moment().utc().subtract(cleanIdlePartitionsAfterMinutes, 'minutes').format())
            lock.execWrite(function(){ 
                return q.Promise(function(resolve){
                  partitions.splice(_.findIndex(partitions, self), 1);
                  logger.info(util.format("Partition %d cleaned", partitionId));
                  resolve();
                });
            });
        logger.info(util.format("Partition cleanup completed for %d", partitionId));
    }, cleanIdlePartitionsAfterMinutes * 60 * 1000);
}

function PartitionService(cleanIdlePartitions){
    if(cleanIdlePartitions === null || cleanIdlePartitions === undefined || isNaN(parseInt(cleanIdlePartitions)) || cleanIdlePartitions <= 0)
        throw new Error("cleanIdlePartitionsAfterMinutes required integer greater than 0");
    
    cleanIdlePartitionsAfterMinutes = cleanIdlePartitions;
}

PartitionService.prototype.get = function(partitionId) {
    return lock.execRead(function(){
       return q.Promise(function(resolve, reject){
            try {
                var maybePartition = _.findWhere(partitions, {partitionId: partitionId});
                
                if(maybePartition == undefined)
                    return resolve(null);
                
                maybePartition.updatedAt = moment().utc().format();
                
                resolve(maybePartition);
                
            } catch(ex){
                logger.error(ex);
                reject(ex);
            }
        }); 
    });
};

PartitionService.prototype.push = function(partitionId, worker) {
    return lock.execWrite(function() {
        return q.Promise(function(resolve){
            var partition = new Partition(partitionId, worker);
            partitions.push(partition);
            resolve(partition);
        });
    });
};

module.exports = PartitionService;