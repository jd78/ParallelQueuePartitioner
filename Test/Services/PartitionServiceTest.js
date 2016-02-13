const PartitionService = require("../../Services/PartitionService")
const partitionService = new PartitionService(10)
const should = require("should")

describe("PartitionService tests", () => {

    var partitionId = 1
    var worker = { workerId: 1 }

    it("push", () => {
        return partitionService.push(partitionId, worker)
    })

    it("get", () => {
        return partitionService.get(partitionId).then(partition => {
            (partition !== null).should.be.exactly(true)
        })
    })

    it("get - null", () => {
        return partitionService.get(2).then(partition => {
            (partition === null).should.be.exactly(true)
        })
    })

    it("required partitionService parameters", () => {
        var exceptionThrown = false

        try {
            new PartitionService()
        } catch (err) {
            exceptionThrown = true
        }

        exceptionThrown.should.be.exactly(true)
    })

    it("PartitionService parameters must be an integer", () => {
        var exceptionThrown = false

        try {
            new PartitionService('a')
        } catch (err) {
            exceptionThrown = true
        }

        exceptionThrown.should.be.exactly(true)
    })

    it("PartitionService parameter must be greater than 0", () => {
        var exceptionThrown = false

        try {
            new PartitionService(0)
        } catch (err) {
            exceptionThrown = true
        }

        exceptionThrown.should.be.exactly(true)
    })
})