var partitionService = require("../../Services/PartitionService");
var should = require("should");


describe("PartitionService tests", function(){
    
    var partitionId = 1;
    var worker = { workerId: 1 }
   
   it("push", function(){
       partitionService.push(partitionId, worker);
   });
   
   it("get", function(){
       var partition = partitionService.get(partitionId);
       should(partition).not.be.null;
   });
   
   it("get - null", function(){
       var partition = partitionService.get(2);
       should(partition).be.null;
   });
});