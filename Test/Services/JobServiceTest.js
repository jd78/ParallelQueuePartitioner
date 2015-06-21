var jobService = require("../../Services/JobService");

describe("JobService Test", function(){
   
   it("push new job", function(){
       jobService.push(1, function(){});
   })
});