var mkdirp = function(path, callback){
    callback();
};
var proxyquire = require("proxyquire");
proxyquire("../Application/Logger", {'mkdirp': mkdirp});

var sinon = require("sinon");
var should = require("should");
var cluster = require("cluster");
var Partitioner = require("../Partitioner").Partitioner;
var util = require("util");

process.setMaxListeners(0);

describe("Partitioner", function() {
    
    var forkStub;
    
    beforeEach(function() {
        var workerObj = {
            on: function(){}
        };
        forkStub = sinon.stub(cluster, "fork").returns(workerObj);    
    });
    
    afterEach(function() {
       forkStub.restore(); 
    });
    
    describe("Configuration", function(){
        
        it("if configuration is undefined, then instantiate 1 worker", function(done){
        
            cluster.isWorker = false;
            
            var partitioner = new Partitioner();
            
            setTimeout(function(){
                forkStub.calledOnce.should.be.exactly(true);
                done();
            }, 100)
            
        });
        
        it("if numberOfWorkers is undefined, then instantiate 1 worker", function(done){
            
            cluster.isWorker = false;
            
            var partitioner = new Partitioner({});
            
            setTimeout(function(){
                forkStub.calledOnce.should.be.exactly(true);
                done();
            });
        });
        
        it("if numberOfWorkers is 0, then application error", function(){
            
            cluster.isWorker = false;
            
            var hasExceptionBeenThrown = false;
            
            try{
                var partitioner = new Partitioner({
                    numberOfWorkers: 0
                });
            } catch(ex) {
                hasExceptionBeenThrown = true
            }
            
            hasExceptionBeenThrown.should.be.exactly(true);
        });
        
        it("if numberOfWorkers is 3, then instantiate 3 worker", function(done){
        
            cluster.isWorker = false;
            
            var partitioner = new Partitioner({
                numberOfWorkers: 3
            });
            
            setTimeout(function(){
                forkStub.calledThrice.should.be.exactly(true);
                done();
            }, 100);
            
        });
        
        it("if configuration is undefined, then loggerLevel is set to error", function(done){
            cluster.isWorker = false;
            var partitioner = new Partitioner();
            
            setTimeout(function(){
                var logger = require("../Application/Logger").instance();
                logger.transports.file.level.should.be.exactly('error');
                done();
            }, 100);
            
            
        });
        
        it("if loggerLevel is undefined, then loggerLevel is set to error", function(done){
        
            cluster.isWorker = false;
            var logger = require("../Application/Logger").instance();
            
            var partitioner = new Partitioner({});
            
            setTimeout(function(){
                logger.transports.file.level.should.be.exactly('error');
                done();
            }, 100);
            
        });
        
        it("if loggerLevel is not debug, info, warn or error, then application error", function(){
        
            cluster.isWorker = false;
            var logger = require("../Application/Logger").instance();
            
            var hasExceptionBeenThrown = false;
            try{
                var partitioner = new Partitioner({
                    loggerLevel: 'test'
                });
            } catch(ex) {
                hasExceptionBeenThrown = true;
            }
            
            hasExceptionBeenThrown.should.be.exactly(true);
        });
        
        var loggerLevels = ['debug', 'info', 'warn', 'error'];
        
        loggerLevels.forEach(function(test){
            it(util.format("if loggerLevel is %s, then loggerLevel is set to %s", test, test), function(done){
        
                cluster.isWorker = false;
                var partitioner = new Partitioner({
                    loggerLevel: test
                });
                
                setTimeout(function() {
                    var logger = require("../Application/Logger").instance();
                    logger.transports.file.level.should.be.exactly(test);
                    done();
                }, 100);
            });    
        });
        
        it("if configuration is undefined then console logger is enabled", function(done){
            cluster.isWorker = false;
            var partitioner = new Partitioner();
            
            setTimeout(function() {
                var logger = require("../Application/Logger").instance();
                should.exists(logger.transports.console);
                done();
            }, 100);
        });
        
        it("if consoleLogger is undefined then console logger is enabled", function(done){
            cluster.isWorker = false;
            var partitioner = new Partitioner({});
            
            setTimeout(function() {
                var logger = require("../Application/Logger").instance();
                should.exists(logger.transports.console);
                done();
            }, 100);
        });
        
        it("if consoleLogger is true then console logger is enabled", function(done){
            cluster.isWorker = false;
            var partitioner = new Partitioner({
                consoleLogger: true
            });
            
            setTimeout(function() {
                var logger = require("../Application/Logger").instance();
                should.exists(logger.transports.console);
                done();
            }, 200);
        });
        
        it("if consoleLogger is false then console logger is disabled", function(done){
            cluster.isWorker = false;
            var partitioner = new Partitioner({
                consoleLogger: false
            });
            
            setTimeout(function() {
                var logger = require("../Application/Logger").instance();
                should.not.exists(logger.transports.console);
                done();
            }, 300);
        });
        
        it("if consoleLogger is not true or false, then throw exception", function(){
            cluster.isWorker = false;
            
            var hasExceptionBeenThrown = false;
            try{
                 var partitioner = new Partitioner({
                     consoleLogger: 'test'
                 });
             } catch(ex) {
                 hasExceptionBeenThrown = true;
             }
            
             hasExceptionBeenThrown.should.be.exactly(true);
        });
        
        it("if configuration is undefined then file logger is enabled", function(done){
            cluster.isWorker = false;
            var partitioner = new Partitioner();
            
            setTimeout(function() {
                var logger = require("../Application/Logger").instance();
                should.exists(logger.transports.file);
                done();
            }, 100);
        });
        
        it("if fileLogger is undefined then file logger is enabled", function(done){
            cluster.isWorker = false;
            var partitioner = new Partitioner({});
            
            setTimeout(function() {
                var logger = require("../Application/Logger").instance();
                should.exists(logger.transports.file);
                done();
            }, 100);
        });
        
        it("if fileLogger is true then file logger is enabled", function(done){
            cluster.isWorker = false;
            var partitioner = new Partitioner({
                fileLogger: true
            });
            
            setTimeout(function() {
                var logger = require("../Application/Logger").instance();
                should.exists(logger.transports.file);
                done();
            }, 200);
        });
        
        it("if fileLogger is false then file logger is disabled", function(done){
            cluster.isWorker = false;
            var partitioner = new Partitioner({
                fileLogger: false
            });
            
            setTimeout(function() {
                var logger = require("../Application/Logger").instance();
                should.not.exists(logger.transports.file);
                done();
            }, 300);
        });
        
        it("if fileLogger is not true or false, then throw exception", function(){
            cluster.isWorker = false;
            
            var hasExceptionBeenThrown = false;
            try{
                 var partitioner = new Partitioner({
                     fileLogger: 'test'
                 });
             } catch(ex) {
                 hasExceptionBeenThrown = true;
             }
            
             hasExceptionBeenThrown.should.be.exactly(true);
        });
        
        
        
        it("if configuration is undefined then file logger path is ./logger", function(done){
            cluster.isWorker = false;
            var partitioner = new Partitioner();
            
            setTimeout(function() {
                var logger = require("../Application/Logger").instance();
                logger.transports.file.dirname.should.be.exactly("./logger");
                done();
            }, 100);
        });
        
        it("if fileLoggerPath is undefined then file logger path is ./logger", function(done){
            cluster.isWorker = false;
            var partitioner = new Partitioner({});
            
            setTimeout(function() {
                var logger = require("../Application/Logger").instance();
                logger.transports.file.dirname.should.be.exactly("./logger");
                done();
            }, 100);
        });
        
        it("if fileLoggerPath is ./bin/logger then file logger path is ./bin/logger", function(done){
            cluster.isWorker = false;
            var partitioner = new Partitioner({
                fileLoggerPath: "./bin/logger"
            });
            
            setTimeout(function() {
                var logger = require("../Application/Logger").instance();
                logger.transports.file.dirname.should.be.exactly("./bin/logger");
                done();
            }, 200);
        });
        
        it("if fileLoggerPath is not a string, then throw exception", function(){
            cluster.isWorker = false;
            
            var hasExceptionBeenThrown = false;
            try{
                 var partitioner = new Partitioner({
                     fileLoggerPath: 1
                 });
             } catch(ex) {
                 hasExceptionBeenThrown = true;
             }
            
             hasExceptionBeenThrown.should.be.exactly(true);
        });
    });
});