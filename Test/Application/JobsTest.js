"use strict"

const stubs = require("../Common/stubs")
const jobs = require("../../Application/Jobs")
const sinon = require("sinon")
const should = require("should")

describe("Jobs Test", () => {

    process.send = () => { }
    let processSpy = sinon.spy(process, "send")

    beforeEach(() => {
        stubs.stubLogs()
    })

    afterEach(() => {
        processSpy.reset()
        stubs.restoreLogs()
    })

    it("unregistered job", done => {
        
         let job = {
            id: 1,
            partitionId: 1,
            type: 'test'
        }
        
        jobs.executeJob(job).then(() => {
            throw new Error("Exception not thrown")
        }).catch(() => {
            processSpy.calledOnce.should.be.exactly(true)
            done()
        })
    })

    it("execute job", done => {
        let execCalled = false
        
        let job = {
            id: 1,
            partitionId: 1,
            type: 'test'
        }
        
        jobs.registerJob(job.type, job => {
            return new Promise(resolve => {
                execCalled = true
                resolve()
            })
        })

        jobs.executeJob(job).then(() => {
            execCalled.should.be.exactly(true)
            processSpy.calledOnce.should.be.exactly(true)
            done()
        }).catch(() => {
            throw new Error("Exception not supposed to be trown")
        })
    })

    it("execute job throws exception", done => {
        let execCalled = false
        
        let job = {
            id: 1,
            partitionId: 1,
            type: 'test2'
        }
        
        jobs.registerJob(job.type, job => {
            return new Promise(resolve => {
                execCalled = true
                throw new Error("exception")
            })
        })

        jobs.executeJob(job).then(() => {

        }).catch(() => {
            execCalled.should.be.exactly(true)
            processSpy.calledOnce.should.be.exactly(true)
            done()
        })
    })
    
    it("throw exception if job already registered", () => {
        let exceptionCalled = false
        
        let job = {
            id: 1,
            partitionId: 1,
            type: 'test3'
        }
        
        jobs.registerJob(job.type, () => {})
        try {
            jobs.registerJob(job.type, () => {})
        } catch(ex) {
            exceptionCalled = true
        }
        
        exceptionCalled.should.be.true()
    })
})