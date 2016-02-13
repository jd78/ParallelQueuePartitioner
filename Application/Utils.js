"use strict"

const _ = require("underscore")

class Utils {
    constructor() {}
    
    coalesce(obj, other) {
        if(!(obj === null) && !(obj === undefined))
            return obj;
        return other;
    }
    
    isNull(val) {
        return val === null || val === undefined
    }
    
    areNotNull() {
        
        return _.find(_.values(arguments), val => {
            return this.isNull(val)
        }) === undefined
    }
}

module.exports = new Utils();