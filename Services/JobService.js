var _ = require("underscore");

var jobs = [];

function Job(id, callback) {
    this.id = id;
    this.done = function(){
        callback();
        jobs.splice(_.findIndex(jobs, this), 1);
    };
}

function JobService(){ }

JobService.prototype.push = function(id, callback) {
    jobs.push(new Job(id, callback));  
};

module.exports = new JobService();