var PartitionService = require("../../Services/PartitionService");
var partitionService = new PartitionService(10);
var should = require("should");

describe("PartitionService tests", function(){
    
    var partitionId = 1;
    var worker = { workerId: 1 }
    
    it("push", function(){
       return partitionService.push(partitionId, worker);
    });
   
    it("get", function(){
        return partitionService.get(partitionId).then(function(partition){
            (partition!==null).should.be.exactly(true);    
        });
    });
   
    it("get - null", function(){
        return partitionService.get(2).then(function(partition){
            (partition === null).should.be.exactly(true);
        });
   });
   
   it("required partitionService parameters", function(){
      var exceptionThrown = false;
      
      try {
          new PartitionService();
      } catch(err){
          exceptionThrown = true;
      }
      
      exceptionThrown.should.be.exactly(true);
   });
   
   it("PartitionService parameters must be an integer", function(){
      var exceptionThrown = false;
      
      try {
          new PartitionService('a');
      } catch(err){
          exceptionThrown = true;
      }
      
      exceptionThrown.should.be.exactly(true);
   });
   
   it("PartitionService parameter must be greater than 0", function(){
      var exceptionThrown = false;
      
      try {
          new PartitionService(0);
      } catch(err){
          exceptionThrown = true;
      }
      
      exceptionThrown.should.be.exactly(true);
   });
});