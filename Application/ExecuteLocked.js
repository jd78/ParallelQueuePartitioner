"use strict"

const ReadWriteLock = require("rwlock")
const Logger = require("./Logger")

class ExecuteLocked {
    constructor() {
        this.lock = new ReadWriteLock()
    }

    execRead(func) {
        return new Promise((resolve, reject) => {
            let logger = Logger.instance()
            this.lock.readLock(release => {
                func().then(obj => {
                    release()
                    resolve(obj)
                }).catch(err => {
                    logger.err(err)
                    reject(err)
                })
            })
        })
    }

    execWrite(func) {
        return new Promise((resolve, reject) => {
            let logger = Logger.instance()
            this.lock.writeLock(release => {
                func().then(obj => {
                    release()
                    resolve(obj)
                }).catch(err => {
                    logger.err(err)
                    reject(err)
                })
            })
        })
    }
}

module.exports = ExecuteLocked