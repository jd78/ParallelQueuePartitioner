var logger = require("./Logger");
var Message = require("../Entities/Message");
var util = require("util");
var q = require("q");

function Jobs(){}

Jobs.prototype.executeJob = function(job) {
    var self = this;
    return q.Promise(function(resolve, reject){
        logger.debug("executing job id: %d, partitionId: %d, type: %s, pid: %d", job.id, job.partitionId, job.type, process.pid);
        if(self[job.type] === undefined) {
            var err = util.format("the job type %s is not defined", job.type);
            logger.error(err);
            process.send(new Message(job.id, err));
            return reject(err);
        }
        
        self[job.type](job).then(function(){
            logger.debug("completed job id: %d, partitionId: %d, type: %s, pid: %d", job.id, job.partitionId, job.type, process.pid);
            process.send(new Message(job.id));
            logger.debug("completed notification sent to master for job id: %d, partitionId: %d, type: %s, pid: %d", job.id, job.partitionId, job.type, process.pid);
            process.nextTick(function(){ resolve(); });
        }).catch(function(err) {
            logger.error(err);
            process.send(new Message(job.id, err));
            reject(err);
        });
    });
};

module.exports = new Jobs();