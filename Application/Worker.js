var jobService = require("../Services/JobService");
var cluster = require("cluster");
var jobs = require("./Jobs");
var q = require("q");
var util = require("util");
var Message = require("./Message");


function Worker(worker){
    this.worker = worker;
    
    worker.on('message', function(message) {
        if(message.err != undefined){
            jobService.error(message.id, message.err);
            return;
        }
        
        console.log("complete notify received for id " + message.id);
        jobService.done(message.id);
    });
}

if(cluster.isWorker) {
    console.log("worker %d registered", process.pid);
    process.on('message', function(job) { 
        console.log("job " + job.id + " received");
        executeJob(job).then(function(){});
    });
}

function executeJob(job){
    return q.Promise(function(resolve, reject){
        if(jobs[job.type] === undefined) {
            var err = util.format("the job type %s is not defined", job.type);
            process.send(new Message(job.id, err));
            return reject(err);
        }
        
        jobs[job.type](job).then(function(){
            process.send(new Message(job.id));
            resolve();
        }).catch(function(err) {
            process.send(new Message(job.id, err));
            reject(err);
        });
    });
}

module.exports = Worker;