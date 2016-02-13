"use strict"

const stubs = require("../Common/stubs")
stubs.stubLogs()

const cluster = require("cluster")
const Worker = require("../../Application/Worker")
const sinon = require("sinon")
const should = require("should")
const EventEmitter = require('events')
const util = require('util')
const Message = require("../../Entities/Message")
const jobService = require("../../Services/JobService")

process.setMaxListeners(0);

describe('Worker test', () => {
    
    let forkStub;

    beforeEach(function () {
        let workerObj = {
            on: function () { }
        };
        forkStub = sinon.stub(cluster, "fork").returns(workerObj)
    });

    afterEach(function () {
        forkStub.restore();
    });
    
    it('worker error event', () => {
        
        let errorStub = sinon.stub(jobService, "error")
        let doneStub = sinon.stub(jobService, "done")
        
        function WorkerObj() {
            EventEmitter.call(this)
        }
        util.inherits(WorkerObj, EventEmitter)
        
        let workerObject = new WorkerObj()
        new Worker(workerObject)
        let message = new Message(1, "error")
        
        workerObject.emit('message', message)
        
        errorStub.calledWith(message.id, message.err).should.be.true()
        doneStub.called.should.be.false()
        
        errorStub.restore()
        doneStub.restore()
    })
    
    it('worker done', () => {
        
        let errorStub = sinon.stub(jobService, "error")
        let doneStub = sinon.stub(jobService, "done")
        
        function WorkerObj() {
            EventEmitter.call(this)
        }
        util.inherits(WorkerObj, EventEmitter)
        
        let workerObject = new WorkerObj()
        new Worker(workerObject)
        let message = new Message(1)
        
        workerObject.emit('message', message)
        
        errorStub.called.should.be.false()
        doneStub.calledWith(message.id).should.be.true()
        
        errorStub.restore()
        doneStub.restore()
    })
})