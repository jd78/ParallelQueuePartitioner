"use strict"

var q = require("q");
var winston = require("winston");

var Logger = require("../../Application/Logger");
var sinon = require("sinon");

let _newStub;
let _instanceStub;

function Stubs(){ }

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
    
    _newStub = sinon.stub(Logger, "new", function(consoleEnabled, loggerLevel){
        return q.Promise(function(resolve){
            resolve(log);
        });
    });
    
    _instanceStub = sinon.stub(Logger, "instance", function(){
        return log;
    });
};

Stubs.prototype.restoreLogs = () => {
    _newStub.restore()
    _instanceStub.restore()
}

module.exports = new Stubs();