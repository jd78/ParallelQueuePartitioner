// "use strict"
// 
// const stubs = require("../Common/stubs")
// stubs.stubLogs()
// 
// const cluster = require("cluster")
// //cluster.isWorker = true
// const Worker = require("../../Application/Worker")
// const sinon = require("sinon")
// const should = require("should")
// 
// process.setMaxListeners(0);
// 
// describe('Worker test', () => {
//     
// //     let forkStub;
// // 
// //     beforeEach(function () {
// //         let workerObj = {
// //             on: function () { }
// //         };
// //         forkStub = sinon.stub(cluster, "fork").returns(workerObj);
// //     });
// // 
// //     afterEach(function () {
// //         forkStub.restore();
// //     });
//     
//     it('consume the queue synchronously', () => {
//         let jobSpy = sinon.spy()
//         
//         process.send(jobSpy);
//     })
// })