var ReadWriteLock  = require("rwlock");
var q = require("q");


function ExecuteLocked(){
    this.lock = new ReadWriteLock();
}

ExecuteLocked.prototype.execRead = function(func){
    return q.Promise(function(resolve, reject){
        this.lock.readLock(function(release){
           func().then(function(obj){
                release();
                resolve(obj);
           }).catch(function(err){
               reject(err);
           });
        });    
    });
};

ExecuteLocked.prototype.execWrite = function(func){
    var deferred = q.defer();
        this.lock.writeLock(function(release){
           func().then(function(obj){
                release();
                deferred.resolve(obj);
           }).catch(function(err){
               deferred.reject(err);
           });
        });    
    return deferred.promise;
};

module.exports = ExecuteLocked;