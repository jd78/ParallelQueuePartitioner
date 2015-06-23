var logger = require("../../Application/Logger");
var jobs = require("../../Application/Jobs");
var sinon = require("sinon");
var should = require("should");
var q = require("q");


describe("Jobs Test", function(){

    sinon.stub(logger, "error");
    sinon.stub(logger, "warn");
    sinon.stub(logger, "info");
    sinon.stub(logger, "debug");

    var job = {
        id: 1,
        partitionId: 1,
        type: 'test'
    };
    
    it("unregistered job", function() {
        var catchCalled = false;
        jobs.executeJob(job).then(function(){}).catch(function(){
            catchCalled = true;
        });
        
        catchCalled.should.be.true;
    });
    
    it("execute job", function() {
        var execCalled = false;
        var catchCalled = false;
        
        jobs['test'] = function(job){
            return q.Promise(function(resolve){
                execCalled = true;
                resolve();
            });
        };
        
        jobs.executeJob(job).then(function(){}).catch(function(){
            catchCalled = true;
        });
        
        catchCalled.should.be.false;
        execCalled.should.be.true;
    });
});