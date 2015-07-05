var winston = require("winston");
var util = require("util");
var q = require("q");
var mkdirp = require("mkdirp");
var cluster = require("cluster");

var logger;

function newLogger(enableConsoleLogging, loggerLevel, enableFileLogger, fileLoggerPath){
  return q.Promise(function(resolve){
    
    logger = new (winston.Logger)({
      transports: []
    });
    
    if(enableConsoleLogging)
      logger.add(winston.transports.Console, { level: loggerLevel });
    
    if(enableFileLogger){
      mkdirp(fileLoggerPath, function(err){
        if(err) throw new Error(err);  
        logger.add(winston.transports.File, {
          filename: util.format("%s/%s-pid-%s-partitioner.log", fileLoggerPath, cluster.isMaster ? "master" : "worker", process.pid),
          handleExceptions: true,
          exitOnError: false,
          level: loggerLevel, //'error', info, warning, error
          maxsize: 625000,
          zippedArchive: true
        });
      });
    }
      
    resolve(logger);
  });
}

module.exports = {
  new: newLogger,
  instance: function(){ return logger; }
};