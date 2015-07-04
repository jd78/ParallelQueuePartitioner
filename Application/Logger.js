var winston = require("winston");
var fs = require("fs");
var util = require("util");
var q = require("q");

var logger;

function newLogger(){
  return q.Promise(function(resolve){
    var binPath = "bin";
    var servicePath = "parallel-queue-partitioner";
    var fullpath = util.format("./%s/%s", binPath, servicePath);
  
    if (!fs.existsSync(util.format("./%s", binPath))) {
    	fs.mkdirSync(util.format("./%s", binPath));
    }
  
    if (!fs.existsSync(fullpath)) {
    	fs.mkdirSync(fullpath);
    }
    
    logger = new (winston.Logger)({
      transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ 
            filename: util.format("%s/pid-%s-partitioner.log", fullpath, process.pid),
            handleExceptions: true,
            exitOnError: false,
            level: 'error', //info, warning, error
            maxsize: 625000,
            zippedArchive: true
        })
      ]
    });
    resolve(logger);
  });
}

module.exports = {
  new: newLogger,
  instance: function(){ return logger; }
};