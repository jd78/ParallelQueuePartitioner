var stubs = require("../Common/stubs");
stubs.stubLogs();

var jobs = require("../../Application/Jobs");
var sinon = require("sinon");
var should = require("should");
var q = require("q");


describe("Jobs Test", function(){

    process.send = function(){};
    var processSpy = sinon.spy(process, "send");
    
    afterEach(function(){
        processSpy.reset();
    });
    
    var job = {
        id: 1,
        partitionId: 1,
        type: 'test'
    };
    
    it("unregistered job", function(done) {
        jobs.executeJob(job).then(function(){
            throw new Error("Exception not thrown");
        }).catch(function(){
            processSpy.calledOnce.should.be.exactly(true);
            done();
        });
    });
    
    it("execute job", function(done) {
        var execCalled = false;
        
        jobs['test'] = function(job){
            return q.Promise(function(resolve){
                execCalled = true;
                resolve();
            });
        };
        
        jobs.executeJob(job).then(function(){
            execCalled.should.be.exactly(true);
            processSpy.calledOnce.should.be.exactly(true);
            done();
        }).catch(function(){
            throw new Error("Exception not supposed to be trown");
        });
    });
    
    it("execute job throws exception", function(done) {
        var execCalled = false;
        
        jobs['test'] = function(job){
            return q.Promise(function(resolve){
                execCalled = true;
                throw new Error("exception");
            });
        };
        
        jobs.executeJob(job).then(function(){
            
        }).catch(function(){
            execCalled.should.be.exactly(true);
            processSpy.calledOnce.should.be.exactly(true);
            done();
        });
    });
});