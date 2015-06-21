var ReadWriteLock  = require("rwlock");

function ExecuteLocked(){
    this.lock = new ReadWriteLock();
}

ExecuteLocked.prototype.execRead = function(func){
    this.lock.readLock(function(release){
       func();
       release();
    });
};

ExecuteLocked.prototype.execWrite = function(func){
    this.lock.writeLock(function(release){
       func();
       release();
    });
};

module.exports = ExecuteLocked;