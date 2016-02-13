"use strict"

const mkdirp = (path, callback) => {
    callback()
}
const proxyquire = require("proxyquire")
proxyquire("../Application/Logger", { 'mkdirp': mkdirp })

const sinon = require("sinon")
const should = require("should")
const cluster = require("cluster")
const Partitioner = require("../Partitioner").Partitioner
const util = require("util")

process.setMaxListeners(0)

describe("Partitioner", () => {

    let forkStub

    beforeEach(() => {
        let workerObj = {
            on: () => { }
        }
        forkStub = sinon.stub(cluster, "fork").returns(workerObj)
    })

    afterEach(() => {
        forkStub.restore()
    })

    describe("Configuration", () => {
        
        it("if configuration is undefined, then instantiate 1 worker", done => {
        
            cluster.isWorker = false
            
            let partitioner = new Partitioner()
            
            setTimeout(() => {
                forkStub.calledOnce.should.be.exactly(true)
                done()
            }, 100)
            
        })
        
        it("if numberOfWorkers is undefined, then instantiate 1 worker", done => {
            
            cluster.isWorker = false
            
            let partitioner = new Partitioner({})
            
            setTimeout(() => {
                forkStub.calledOnce.should.be.exactly(true)
                done()
            })
        })
        
        it("if numberOfWorkers is 0, then application error", () => {
            
            cluster.isWorker = false
            
            let hasExceptionBeenThrown = false
            
            try{
                let partitioner = new Partitioner({
                    numberOfWorkers: 0
                })
            } catch(ex) {
                hasExceptionBeenThrown = true
            }
            
            hasExceptionBeenThrown.should.be.exactly(true)
        })
        
        it("if numberOfWorkers is 3, then instantiate 3 worker", done => {
        
            cluster.isWorker = false
            
            let partitioner = new Partitioner({
                numberOfWorkers: 3
            })
            
            setTimeout(() => {
                forkStub.calledThrice.should.be.exactly(true)
                done()
            }, 100)
            
        })
        
        it("if configuration is undefined, then loggerLevel is set to error", done => {
            cluster.isWorker = false
            let partitioner = new Partitioner()
            
            setTimeout(() => {
                let logger = require("../Application/Logger").instance()
                logger.transports.file.level.should.be.exactly('error')
                done()
            }, 100)
            
            
        })
        
        it("if loggerLevel is undefined, then loggerLevel is set to error", done => {
        
            cluster.isWorker = false
            let logger = require("../Application/Logger").instance()
            
            let partitioner = new Partitioner({})
            
            setTimeout(() => {
                logger.transports.file.level.should.be.exactly('error')
                done()
            }, 100)
            
        })
        
        it("if loggerLevel is not debug, info, warn or error, then application error", () => {
        
            cluster.isWorker = false
            let logger = require("../Application/Logger").instance()
            
            let hasExceptionBeenThrown = false
            try{
                let partitioner = new Partitioner({
                    loggerLevel: 'test'
                })
            } catch(ex) {
                hasExceptionBeenThrown = true
            }
            
            hasExceptionBeenThrown.should.be.exactly(true)
        })
        
        let loggerLevels = ['debug', 'info', 'warn', 'error']
        
        loggerLevels.forEach(test => {
            it(util.format("if loggerLevel is %s, then loggerLevel is set to %s", test, test), done => {
        
                cluster.isWorker = false
                let partitioner = new Partitioner({
                    loggerLevel: test
                })
                
                setTimeout(() =>  {
                    let logger = require("../Application/Logger").instance()
                    logger.transports.file.level.should.be.exactly(test)
                    done()
                }, 100)
            })    
        })
        
        it("if configuration is undefined then console logger is enabled", done => {
            cluster.isWorker = false
            let partitioner = new Partitioner()
            
            setTimeout(() =>  {
                let logger = require("../Application/Logger").instance()
                should.exists(logger.transports.console)
                done()
            }, 100)
        })
        
        it("if consoleLogger is undefined then console logger is enabled", done => {
            cluster.isWorker = false
            let partitioner = new Partitioner({})
            
            setTimeout(() =>  {
                let logger = require("../Application/Logger").instance()
                should.exists(logger.transports.console)
                done()
            }, 100)
        })
        
        it("if consoleLogger is true then console logger is enabled", done => {
            cluster.isWorker = false
            let partitioner = new Partitioner({
                consoleLogger: true
            })
            
            setTimeout(() =>  {
                let logger = require("../Application/Logger").instance()
                should.exists(logger.transports.console)
                done()
            }, 200)
        })
        
        it("if consoleLogger is false then console logger is disabled", done => {
            cluster.isWorker = false
            let partitioner = new Partitioner({
                consoleLogger: false
            })
            
            setTimeout(() => {
                let logger = require("../Application/Logger").instance()
                should.not.exists(logger.transports.console)
                done()
            }, 300)
        })
        
        it("if consoleLogger is not true or false, then throw exception", () => {
            cluster.isWorker = false
            
            let hasExceptionBeenThrown = false
            try{
                 let partitioner = new Partitioner({
                     consoleLogger: 'test'
                 })
             } catch(ex) {
                 hasExceptionBeenThrown = true
             }
            
             hasExceptionBeenThrown.should.be.exactly(true)
        })
        
        it("if configuration is undefined then file logger is enabled", done => {
            cluster.isWorker = false
            let partitioner = new Partitioner()
            
               setTimeout(() =>  {
                let logger = require("../Application/Logger").instance()
                should.exists(logger.transports.file)
                done()
            }, 100)
        })
        
        it("if fileLogger is undefined then file logger is enabled", done => {
            cluster.isWorker = false
            let partitioner = new Partitioner({})
            
            setTimeout(() =>  {
                let logger = require("../Application/Logger").instance()
                should.exists(logger.transports.file)
                done()
            }, 100)
        })
        
        it("if fileLogger is true then file logger is enabled", done => {
            cluster.isWorker = false
            let partitioner = new Partitioner({
                fileLogger: true
            })
            
            setTimeout(() =>  {
                let logger = require("../Application/Logger").instance()
                should.exists(logger.transports.file)
                done()
            }, 200)
        })
        
        it("if fileLogger is false then file logger is disabled", done => {
            cluster.isWorker = false
            let partitioner = new Partitioner({
                fileLogger: false
            })
            
            setTimeout(() =>  {
                let logger = require("../Application/Logger").instance()
                should.not.exists(logger.transports.file)
                done()
            }, 300)
        })
        
        it("if fileLogger is not true or false, then throw exception", () => {
            cluster.isWorker = false
            
            let hasExceptionBeenThrown = false
            try{
                 let partitioner = new Partitioner({
                     fileLogger: 'test'
                 })
             } catch(ex) {
                 hasExceptionBeenThrown = true
             }
            
             hasExceptionBeenThrown.should.be.exactly(true)
        })
        
        
        
        it("if configuration is undefined then file logger path is ./logger", done => {
            cluster.isWorker = false
            let partitioner = new Partitioner()
            
            setTimeout(() =>  {
                let logger = require("../Application/Logger").instance()
                logger.transports.file.dirname.should.be.exactly("./logger")
                done()
            }, 100)
        })
        
        it("if fileLoggerPath is undefined then file logger path is ./logger", done => {
            cluster.isWorker = false
            let partitioner = new Partitioner({})
            
            setTimeout(() =>  {
                let logger = require("../Application/Logger").instance()
                logger.transports.file.dirname.should.be.exactly("./logger")
                done()
            }, 100)
        })
        
        it("if fileLoggerPath is ./bin/logger then file logger path is ./bin/logger", done => {
            cluster.isWorker = false
            let partitioner = new Partitioner({
                fileLoggerPath: "./bin/logger"
            })
            
            setTimeout(() =>  {
                let logger = require("../Application/Logger").instance()
                logger.transports.file.dirname.should.be.exactly("./bin/logger")
                done()
            }, 200)
        })
        
        it("if fileLoggerPath is not a string, then throw exception", () => {
            cluster.isWorker = false
            
            let hasExceptionBeenThrown = false
            try{
                 let partitioner = new Partitioner({
                     fileLoggerPath: 1
                 })
             } catch(ex) {
                 hasExceptionBeenThrown = true
             }
            
             hasExceptionBeenThrown.should.be.exactly(true)
        })
    })
})