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
    
    sinon.stub(Logger, "new", function(consoleEnabled, loggerLevel){
        return q.Promise(function(resolve){
            resolve(log);
        });
    });
    sinon.stub(Logger, "instance", function(){
        return log;
    });
};

module.exports = new Stubs();