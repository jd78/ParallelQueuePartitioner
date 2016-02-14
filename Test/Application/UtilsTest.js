"use strict"

require("should");
const utils = require("../../Application/Utils")

describe("Utils Test", () => {
    
    describe("Coalesce", () => {
        it("If first is null, get the second", () => {
            let first = null;
            let second = 1;
            utils.coalesce(first, second).should.equal(second);
        })

        it("If first is undefined, get the second", () => {
            let first;
            let second = 1;
            utils.coalesce(first, second).should.equal(second);
        })

        it("If first is false, get first", () => {
            let first = false;
            let second = 1;
            utils.coalesce(first, second).should.equal(first);
        })

        it("If first is not null, get first", () => {
            let first = 1;
            let second = 2;
            utils.coalesce(first, second).should.equal(first);
        })  
    })
    
    describe("IsNull", () => {
        it("If is null, return true", () => {
            utils.isNull(null).should.be.true()
        })
        
        it("If is undefined, return true", () => {
            utils.isNull(undefined).should.be.true()
        })
        
        it("If is not null or undefined, return false", () => {
            utils.isNull(false).should.be.false()
        })  
    })
    
    describe("AreNotNull", () => {
        it("If one is null, return false", () => {
            utils.areNotNull(1, null).should.be.false()
        })
        
        it("If one is undefined, return false", () => {
            utils.areNotNull(undefined, 1).should.be.true()
        })
        
        it("If is not null or undefined, return true", () => {
            utils.areNotNull(1, 2, 3).should.be.true()
        })  
    })
});