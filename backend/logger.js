const fs = require('fs');
const path = require('path');
const util = require('util');
const log_stdout = process.stdout;
const log_stderr = process.stderr;

function checkPath(file){
    if(!file) return false;
    return fs.existsSync(path.dirname(file));
}

function correctPath(file){
    if(!file) return false;
    try{
        let res = fs.mkdirSync(path.dirname(file), {recursive: true});
        return true
    } catch(e) {
        return false
    }

}

function createStream(path){
    if(!checkPath(path))
        if(!correctPath(path)) return undefined;

    return fs.createWriteStream(path, {flags: 'a'})
}

function logger_init(err, log, debug = false) {

    const log_file = createStream(log);
    const err_file = createStream(err);

    if(!log_file || !err_file){
        // console.error("Cannot create logging files. reverting to defaults");
        logger_init("./err.log", "./log.log", false);
        return;
    }

    console.log = function (d) {
        log_file.write(util.format("[" + Date.now() + "]" + "\t\t" + JSON.stringify(d)) + '\n');
        if (debug) log_stdout.write(util.format(d) + '\n');
    };

    console.error = function (d) { //
        err_file.write(util.format("[" + Date.now() + "]" + "\t\t" + d) + '\n');
        if (debug) log_stderr.write(util.format(d) + '\n');
    };
}

module.exports.logger_init = logger_init;
