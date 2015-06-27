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
        
        logger.debug("complete notify received for id %d", message.id);
        jobService.done(message.id);
    });
}

if(cluster.isWorker) {
    logger.transports.file.level = process.env["loggerLevel"];
    logger.transports.console.level = process.env["loggerLevel"];
    
    logger.info("worker %d registered", process.pid);
    process.on('message', function(job) { 
        logger.debug("job %d received", job.id);
        jobs.executeJob(job).then(function(){
        });
    });
}

module.exports = Worker;