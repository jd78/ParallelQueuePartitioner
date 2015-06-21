var partitionService = require("../../Services/PartitionService");
var should = require("should");


describe("PartitionService tests", function(){
    
    var partitionId = 1;
    var worker = { workerId: 1 }
   
   it("push", function(){
       return partitionService.push(partitionId, worker);
   });
   
   it("get", function(){
       partitionService.get(partitionId).then(function(partition){
        should(partition).not.be.null;    
       });
   });
   
   it("get - null", function(){
       partitionService.get(2).then(function(partition){
           should(partition).be.null;
       });
   });
});