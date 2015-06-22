var partitionService = require("../../Services/PartitionService");
var should = require("should");

describe("PartitionService tests", function(){
    
    var partitionId = 1;
    var worker = { workerId: 1 }
    
    it("push", function(){
       return partitionService.push(partitionId, worker);
    });
   
    it("get", function(){
        return partitionService.get(partitionId).then(function(partition){
            (partition!==null).should.be.true;    
        });
    });
   
    it("get - null", function(){
        return partitionService.get(2).then(function(partition){
            (partition === null).should.be.true;
        });
   });
});