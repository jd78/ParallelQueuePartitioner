var q = require("q");
var winston = require("winston");

var Logger = require("../../Application/Logger");
var sinon = require("sinon");

function Stubs(){}

Stubs.prototype.stubLogs = function(){
    var log = {
        transports: {
            file: {
                level: ''     
            }
        },
        debug: function(){},
        info: function(){},
        warn: function(){},
        error: function(){}
    };
    
    sinon.stub(Logger, "new", function(){
        return q.Promise(function(resolve){
            resolve(log);
        });
    });
    sinon.stub(Logger, "instance", function(){
        return log;
    });
    
    //var logger = Logger.instance();
    //sinon.stub(logger, "error");
    //sinon.stub(logger, "warn");
    //sinon.stub(logger, "info");
    //sinon.stub(logger, "debug");
};

module.exports = new Stubs();