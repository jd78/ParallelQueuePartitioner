var _ = require("underscore");
var q = require("q");

var jobs = [];

function Job(id, callback) {
    this.id = id;
    
    this.done = function() {
        if(callback !== undefined)
            callback();
        jobs.splice(_.findIndex(jobs, this), 1);
    };
    
    this.error = function(err){
        if(callback !== undefined)
            callback(err);
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

JobService.prototype.error = function(id, err) {
   _.findWhere(jobs, {id: id}).error(err);  
};


module.exports = new JobService();