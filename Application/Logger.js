var winston = require("winston");

var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ 
          filename: 'partitioner.log',
          handleExceptions: true,
          exitOnError: false,
          level: 'debug' //info, warning, error
      })
    ]
});

module.exports = logger;