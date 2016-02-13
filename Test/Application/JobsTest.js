const stubs = require("../Common/stubs")
const jobs = require("../../Application/Jobs")
const sinon = require("sinon")
const should = require("should")

describe("Jobs Test", () => {

    process.send = () => { }
    var processSpy = sinon.spy(process, "send")

    beforeEach(() => {
        stubs.stubLogs()
    })

    afterEach(() => {
        processSpy.reset()
        stubs.restoreLogs()
    })

    var job = {
        id: 1,
        partitionId: 1,
        type: 'test'
    }

    it("unregistered job", done => {
        jobs.executeJob(job).then(() => {
            throw new Error("Exception not thrown")
        }).catch(() => {
            processSpy.calledOnce.should.be.exactly(true)
            done()
        })
    })

    it("execute job", done => {
        var execCalled = false

        jobs['test'] = function (job) {
            return new Promise(resolve => {
                execCalled = true
                resolve()
            })
        }

        jobs.executeJob(job).then(() => {
            execCalled.should.be.exactly(true)
            processSpy.calledOnce.should.be.exactly(true)
            done()
        }).catch(() => {
            throw new Error("Exception not supposed to be trown")
        })
    })

    it("execute job throws exception", done => {
        var execCalled = false

        jobs['test'] = job => {
            return new Promise(resolve => {
                execCalled = true
                throw new Error("exception")
            })
        }

        jobs.executeJob(job).then(() => {

        }).catch(() => {
            execCalled.should.be.exactly(true)
            processSpy.calledOnce.should.be.exactly(true)
            done()
        })
    })
})