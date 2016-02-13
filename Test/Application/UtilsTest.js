"use strict"

require("should");
const utils = require("../../Application/Utils")

describe("Utils Test", () => {
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
});