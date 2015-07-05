var cluster = require('cluster');
var jobService = require("./Services/JobService");
var PartitionService = require("./Services/PartitionService");
var jobs = require("./Application/Jobs");
var Lock = require("./Application/ExecuteLocked");
var lock = new Lock();
var Worker = require("./Application/Worker");
var validator = require("validator");
var utils = require("./Application/Utils");
var variables = require("./Application/CommonVariables");

var workers = [];
var workerPartitionIndex = 0;
var numberOfWorkers;
var logger;

var defaultConfiguration = {
  numberOfWorkers: 1,
  cleanIdlePartitionsAfterMinutes: 15,
  loggerLevel: "error",
  consoleLogger: true,
  fileLogger: true,
  fileLoggerPath: "./logger"
};

function Partitioner(configuration) {
    if(cluster.isWorker)
        throw new Error("a worker is trying to instantiate a partitioner");
    
    if(configuration !== undefined)
        validate(configuration);
    
    var config = configuration !== undefined ? configuration : defaultConfiguration;
    numberOfWorkers = utils.coalesce(config.numberOfWorkers, defaultConfiguration.numberOfWorkers);
    this.partitionService = new PartitionService(utils.coalesce(config.cleanIdlePartitionsAfterMinutes, defaultConfiguration.cleanIdlePartitionsAfterMinutes));
    
    var processEnv = {};
    
    var Logger = require("./Application/Logger");
    var consoleLogger = utils.coalesce(config.consoleLogger, defaultConfiguration.consoleLogger);
    var fileLogger = utils.coalesce(config.fileLogger, defaultConfiguration.fileLogger);
    var fileLoggerPath = utils.coalesce(config.fileLoggerPath, defaultConfiguration.fileLoggerPath);
    var loggerLevel = utils.coalesce(config.loggerLevel, defaultConfiguration.loggerLevel);
    Logger.new(consoleLogger, loggerLevel, fileLogger, fileLoggerPath).then(function(log){
            logger = log;    
            processEnv[variables.loggerLevel] = loggerLevel;
            processEnv[variables.consoleLogger] = consoleLogger;
            processEnv[variables.fileLogger] = fileLogger;
            processEnv[variables.fileLoggerPath] = fileLoggerPath;
        
            for(var i=0; i < numberOfWorkers; i++){
                workers.push(new Worker(cluster.fork(processEnv)));
            }
        }
    );
}

Partitioner.prototype.enqueueJob = function(job, callback){
    var self = this;
    if(job === null
        || job === undefined
        || job.id === null
        || job.id === undefined
        || job.partitionId === null
        || job.partitionId === undefined
        || job.type === null
        || job.type === undefined)
        throw new Error("Job null or invalid, should contain id, partitionId, type, data: {}");
    
    lock.execWrite(function(){
        return self.partitionService.get(job.partitionId)
            .then(function(partition){
                if(partition == null) {
                    var index = ++workerPartitionIndex % numberOfWorkers;
                    return self.partitionService.push(job.partitionId, workers[index].worker);
                }else{
                    return partition;
                }
            });
    }).then(function(partition){
        jobService.push(job.id, callback).then(function(){
            logger.debug("jobId: %d, partitionId: %d, type: %s, pushed", job.id, job.partitionId, job.type);
            partition.worker.send(job);   
        });      
    });
};

function validate(configuration){
    if(configuration.numberOfWorkers !== undefined && !validator.isInt(configuration.numberOfWorkers, {min:1} ))
        throw new Error("numberOfWorkers should be an integer >= 1");
    if(configuration.cleanIdlePartitionsAfterMinutes !== undefined && !validator.isInt(configuration.cleanIdlePartitionsAfterMinutes, {min:1} ))
        throw new Error("cleanIdlePartitionsAfterMinutes should be an integer >= 1");
    if(configuration.loggerLevel !== undefined && !(
        validator.equals(configuration.loggerLevel, 'debug') 
        || validator.equals(configuration.loggerLevel, 'info')
        || validator.equals(configuration.loggerLevel, 'warn')
        || validator.equals(configuration.loggerLevel, 'error'))
    )
        throw new Error("loggerLevel should be debug, info, warn or error");
    if(configuration.consoleLogger !== undefined && !(
        validator.equals(configuration.consoleLogger, true) 
        || validator.equals(configuration.consoleLogger, false))
    )
        throw new Error("consoleLogger should be true or false");
    if(configuration.fileLogger !== undefined && !(
        validator.equals(configuration.fileLogger, true) 
        || validator.equals(configuration.fileLogger, false))
    )
        throw new Error("fileLogger should be true or false");
    if(configuration.fileLoggerPath !== undefined && typeof(configuration.fileLoggerPath) !== typeof(defaultConfiguration.fileLoggerPath))
        throw new Error("fileLoggerPath should be a string");
}

module.exports = {
    Partitioner: Partitioner,
    registerJob: function(title, func) {
        jobs[title] = func;
    }
};