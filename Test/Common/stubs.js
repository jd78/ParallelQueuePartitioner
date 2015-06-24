var logger = require("../../Application/Logger");
var sinon = require("sinon");


function Stubs(){}

Stubs.prototype.stubLogs = function(){
    sinon.stub(logger, "error");
    sinon.stub(logger, "warn");
    sinon.stub(logger, "info");
    sinon.stub(logger, "debug");
};

module.exports = new Stubs();