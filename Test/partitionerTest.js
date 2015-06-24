var sinon = require("sinon");
var stubs = require("./Common/stubs");
stubs.stubLogs();
var should = require("should");
var cluster = require("cluster");

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
            
            var Partitioner = require("../Partitioner").Partitioner;
            var partitioner = new Partitioner();
            
            forkStub.calledOnce.should.be.exactly(true);
        });
        
        it("if numberOfWorkers is undefined, then instantiate 1 worker", function(){
            
            cluster.isWorker = false;
            
            var Partitioner = require("../Partitioner").Partitioner;
            var partitioner = new Partitioner({});
            
            forkStub.calledOnce.should.be.exactly(true);
        });
        
        it("if numberOfWorkers is 0, then application error", function(){
            
            cluster.isWorker = false;
            
            var Partitioner = require("../Partitioner").Partitioner;
            
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
    });
});