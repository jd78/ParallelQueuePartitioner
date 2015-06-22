var _ = require("underscore");
var moment = require("moment");
var q = require("q");
var configuration = require("../Application/Configuration");


var Lock = require("../Infrastructure/ExecuteLocked");
var lock = new Lock();

var partitions = [];

function Partition(partitionId, worker) {
    var self = this;
    this.partitionId = partitionId;
    this.worker = worker;
    this.updatedAt = moment().utc().format();
    
    setInterval(function() {
        console.log(self.updatedAt)
        console.log(moment().utc().subtract(configuration.partitionTimeOut, 'minutes').format())
        console.log(partitions.length)
        if(self.updatedAt < moment().utc().subtract(configuration.partitionTimeOut, 'minutes').format())
            lock.execWrite(function(){ 
                return q.Promise(function(resolve){
                   partitions.splice(_.findIndex(partitions, self), 1); 
                   resolve();
                });
            });
    }, configuration.partitionTimeoutCheckerInternal);
}

function PartitionService(){}

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