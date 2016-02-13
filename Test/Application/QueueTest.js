"use strict"

const sinon = require("sinon")
require("should")

const queue = require("../../Application/Queue")

describe("Queue test", () => {
    
    it("process messages", done => {
        let fn = () => { return new Promise(resolve => { resolve() }) }
        
        let spy = sinon.spy(fn)
        
        queue.processQueue()
        queue.push(spy)
        queue.push(spy)
        
        setTimeout(() => {
             spy.calledTwice.should.be.true()
             done()    
        }, 20);
    })
})