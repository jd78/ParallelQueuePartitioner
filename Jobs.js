function Jobs(){}

Jobs.prototype.test = function(){
    console.log("test executed by " + process.pid);
};

module.exports = new Jobs();