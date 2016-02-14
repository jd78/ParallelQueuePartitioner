"use strict"

const winston = require("winston");

const Logger = require("../../Application/Logger");
const sinon = require("sinon");

class Stubs {
    constructor() {
        this.newStub
        this.instanceStub
    }

    stubLogs() {
        let log = {
            transports: {
                file: {
                    level: ''
                }
            },
            debug: () => { },
            info: () => { },
            warn: () => { },
            error: () => { }
        };

        this.newStub = sinon.stub(Logger, "new", (consoleEnabled, loggerLevel) => {
            return q.Promise(resolve => {
                resolve(log);
            });
        });

        this.instanceStub = sinon.stub(Logger, "instance", () => {
            return log;
        });
    };

    restoreLogs() {
        this.newStub.restore()
        this.instanceStub.restore()
    }
}

module.exports = new Stubs();