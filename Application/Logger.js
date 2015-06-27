var winston = require("winston");
var fs = require("fs");
var util = require("util");

var binPath = "bin";
var servicePath = "parallel-queue-partitioner";
var fullpath = util.format("./%s/%s", binPath, servicePath);

if (!fs.existsSync(util.format("./%s", binPath))) {
	fs.mkdirSync(util.format("./%s", binPath));
}

if (!fs.existsSync(fullpath)) {
	fs.mkdirSync(fullpath);
}

var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ 
          filename: util.format("%s/pid-%s-partitioner.log", fullpath, process.pid),
          handleExceptions: true,
          exitOnError: false,
          level: 'error', //info, warning, error
          maxsize: 625000,
          zippedArchive: true
      })
    ]
});

module.exports = logger;