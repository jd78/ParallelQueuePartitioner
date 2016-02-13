const jobService = require("../../Services/JobService")

describe("JobService Test", () => {
    var jobId = 1

    it("push new job", () => {
        return jobService.push(jobId, () => { }).then(() => { })
    })

    it("job done", () => {
        jobService.done(jobId)
    })
})