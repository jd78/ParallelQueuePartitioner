var sinon = require("sinon");
var stubs = require("./Common/stubs");
stubs.stubLogs();
var should = require("should");
var cluster = require("cluster");
var Partitioner = require("../Partitioner").Partitioner;
var util = require("util");


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
        
        it("if configuration is undefined, then instantiate 1 worker", function(){
        
            cluster.isWorker = false;
            
            var partitioner = new Partitioner();
            
            forkStub.calledOnce.should.be.exactly(true);
        });
        
        it("if numberOfWorkers is undefined, then instantiate 1 worker", function(){
            
            cluster.isWorker = false;
            
            var partitioner = new Partitioner({});
            
            forkStub.calledOnce.should.be.exactly(true);
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
        
        it("if numberOfWorkers is 3, then instantiate 3 worker", function(){
        
            cluster.isWorker = false;
            
            var partitioner = new Partitioner({
                numberOfWorkers: 3
            });
            
            forkStub.calledThrice.should.be.exactly(true);
        });
        
        it("if configuration is undefined, then loggerLevel is set to error", function(){
        
            cluster.isWorker = false;
            var logger = require("../Application/Logger");
            
            var partitioner = new Partitioner();
            
            logger.transports.file.level.should.be.exactly('error');
            
        });
        
        it("if loggerLevel is undefined, then loggerLevel is set to error", function(){
        
            cluster.isWorker = false;
            var logger = require("../Application/Logger");
            
            var partitioner = new Partitioner({});
            
            logger.transports.file.level.should.be.exactly('error');
            
        });
        
        it("if loggerLevel is not debug, info, warn or error, then application error", function(){
        
            cluster.isWorker = false;
            var logger = require("../Application/Logger");
            
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
            it(util.format("if loggerLevel is %s, then loggerLevel is set to %s", test, test), function(){
        
                cluster.isWorker = false;
                var logger = require("../Application/Logger");
                var partitioner = new Partitioner({
                    loggerLevel: test
                });
                
                logger.transports.file.level.should.be.exactly(test);
            });    
        });
    });
});