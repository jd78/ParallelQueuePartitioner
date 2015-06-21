var _ = require("underscore");
var moment = require("moment");
var Lock = require("../Infrastructure/ExecuteLocked");
var lock = new Lock();

var partitions = [];

function Partition(partitionId, worker) {
    var self = this;
    this.partitionId = partitionId;
    this.worker = worker;
    this.updatedAt = moment().utc();
    
    setInterval(function() {
        if(self.updatedAt < moment().utc().subtract(15, 'minutes'))
        lock.execWrite(function(){ partitions.splice(_.findIndex(partitions, self), 1); });
    }, 20000);
}

function PartitionService(){}

PartitionService.prototype.get = function(partitionId) {
    var maybePartition = _.findWhere(partitions, {partitionId: partitionId});
    
    if(maybePartition == undefined)
        return null;
    
    maybePartition.updatedAt = moment().utc();
    
    return maybePartition;
};

PartitionService.prototype.push = function(partitionId, worker) {
    lock.execWrite(function(){ partitions.push(new Partition(partitionId, worker)); });
};

module.exports = new PartitionService();