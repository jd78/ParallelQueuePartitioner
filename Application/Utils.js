"use strict"

class Utils {
    constructor() {}
    
    coalesce(obj, other) {
        if(!(obj === null) && !(obj === undefined))
            return obj;
        return other;
    }
}

module.exports = new Utils();