"use strict"

let _queue = []

function* getFromQueue() {
    if (_queue.length === 0)
        return undefined
    while (_queue.length > 0)
        yield _queue.shift()
}

class Queue {
    constructor() {
        this.queue = getFromQueue()
    }
    
    push(fn){
        _queue.push(fn)
    }

    processQueue() {
        let reprocessDeleyed = () => {
            setTimeout(() => this.processQueue(), 1)
        }
        
        let reprocessImmediate = () => {
            this.processQueue()
        }

        let job = this.queue.next().value
        if (!job) {
            this.queue = getFromQueue();
            return reprocessDeleyed()
        }

        job().then(() => {
            reprocessImmediate()
        }).catch(() => {
            reprocessImmediate()
        })
    }
}

module.exports = new Queue()