"use strict"

const Logger = require("../Application/Logger")

let _jobs = new Map()

class JobService {    
    constructor(){ }
    
    push(id, callback) {
        return new Promise((resolve, reject) => {
            try {
                _jobs.set(id, callback)
                resolve()
            } catch(ex) {
                Logger.instance().error(ex)
                reject(ex)
            }    
        })
    }
    
    done(id) {
        let job = _jobs.get(id)
        if(job)
            job()
        _jobs.delete(id)
    }
    
    error(id, err) {
        let job = _jobs.get(id)
        if(job)
            job(err, id)
        _jobs.delete(id)
    }
}

module.exports = new JobService();