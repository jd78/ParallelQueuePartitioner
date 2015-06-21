var _ = require("underscore");
var q = require("q");

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
    return q.Promise(function(resolve, reject){
        try{
            jobs.push(new Job(id, callback));
            resolve();
        }catch(ex){
            reject(ex);
        }
    });
};

JobService.prototype.done = function(id) {
   _.findWhere(jobs, {id: id}).done();  
};

module.exports = new JobService();