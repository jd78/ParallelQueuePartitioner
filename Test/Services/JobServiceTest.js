var jobService = require("../../Services/JobService");

describe("JobService Test", function(){
   var jobId = 1;
   
   it("push new job", function(){
       jobService.push(jobId, function(){});
   });
   
   it("job done", function(){
       jobService.done(jobId);
   });
});