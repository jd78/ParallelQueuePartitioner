var jobService = require("../Services/JobService");
var cluster = require("cluster");
var jobs = require("./Jobs");
var logger = require("./Logger");

function Worker(worker){
    this.worker = worker;
    
    worker.on('message', function(message) {
        if(message.err != undefined){
            jobService.error(message.id, message.err);
            return;
        }
        
        logger.log("complete notify received for id " + message.id);
        jobService.done(message.id);
    });
}

if(cluster.isWorker) {
    logger.info("worker %d registered", process.pid);
    process.on('message', function(job) { 
        logger.log("job " + job.id + " received");
        jobs.executeJob(job).then(function(){});
    });
}

module.exports = Worker;