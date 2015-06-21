var _ = require("underscore");
var moment = require("moment");
var q = require("q");

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
    return lock.execRead(function(){
       return q.Promise(function(resolve, reject){
            try {
                var maybePartition = _.findWhere(partitions, {partitionId: partitionId});
                
                if(maybePartition == undefined)
                    return resolve(null);
                
                maybePartition.updatedAt = moment().utc();
                
                resolve(maybePartition);
                
            } catch(ex){
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

module.exports = new PartitionService();