var Partitioner = require("./Partitioner");
var cluster = require("cluster");

if(cluster.isMaster)
    Start();
    
function Start(){
    var partitioner = new Partitioner({
        numberOfWorkers: 4
    });
    
    partitioner.registerJob("test", function(){
       console.log("the job has been executed by " + process.id); 
    });
    
    partitioner.enqueueJob({
        id: 1,
        partitionId: 1,
        type: "test",
        data: { }
    });
}