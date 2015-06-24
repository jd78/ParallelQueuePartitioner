var sinon = require("sinon");
var stubs = require("./Common/stubs");
stubs.stubLogs();
var should = require("should");


var cluster = require("cluster");

describe("Partitioner", function(){
    it("NumberOfWorkerConfiguration, if null 1 worker", function(){
        
        cluster.isWorker = false;
        
        var workerObj = {
            on: function(){}
        };
        
        var forkStub = sinon.stub(cluster, "fork").returns(workerObj);
        
        var Partitioner = require("../Partitioner").Partitioner;
        var partitioner = new Partitioner();
        
        forkStub.calledOnce.should.be.exactly(true);
        
    });
});