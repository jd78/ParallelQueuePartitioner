var ReadWriteLock  = require("rwlock");
var q = require("q");
var logger = require("./Logger");

function ExecuteLocked(){
    this.lock = new ReadWriteLock();
}

ExecuteLocked.prototype.execRead = function(func){
    var deferred = q.defer();
    this.lock.readLock(function(release){
       func().then(function(obj){
            release();
            deferred.resolve(obj);
       }).catch(function(err){
           logger.err(err);
           deferred.reject(err);
       });
    });
    return deferred.promise;
};

ExecuteLocked.prototype.execWrite = function(func){
    var deferred = q.defer();
    this.lock.writeLock(function(release){
       func().then(function(obj){
            release();
            deferred.resolve(obj);
       }).catch(function(err){
           logger.err(err);
           deferred.reject(err);
       });
    });    
    return deferred.promise;
};

module.exports = ExecuteLocked;