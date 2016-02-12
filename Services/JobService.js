"use strict"

const Logger = require("../Application/Logger")

let _jobs = new Map()

class Job {
    
    constructor(id, callback){
        this.id = id;
        this.callback = callback;
    }
    
    done() {
        if(this.callback)
            this.callback()
        _jobs.delete(this.id)
    }
    
    error(err) {
        if(this.callback)
            this.callback(err, this.id);
        _jobs.delete(this.id)
    }
}

class JobService {    
    constructor(){ }
    
    push(id, callback) {
        return new Promise((resolve, reject) => {
            try {
                _jobs.set(id, new Job(id, callback))
                resolve()
            } catch(ex) {
                Logger.instance().error(ex)
                reject(ex)
            }    
        })
    }
    
    done(id) {
        _jobs.get(id).done()
    }
    
    error(id, err) {
        _jobs.get(id).error(err)
    }
}

module.exports = new JobService();