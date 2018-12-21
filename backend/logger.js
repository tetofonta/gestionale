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

function log_my_data(data, file, type, debug){
    let md = data;
    if(typeof data === "object"){
        try{
            md = JSOn.stringify(data)
        } catch (e){ md = data}
    }
    file.write(util.format(`[${new Date().toString()}][${type}][${process.pid}]\t\t${util.format(md)}`) + "\n");
    if (debug) log_stdout.write(util.format(`[${Date.toString()}][${type}][${process.pid}]\t\t${util.format(md)}`) + "\n");
}

function logger_init(err, log, debug = true) {

    const log_file = createStream(log);
    const err_file = createStream(err);

    if(!log_file || !err_file){
        // console.error("Cannot create logging files. reverting to defaults");
        logger_init("./err.log", "./log.log", debug);
        return;
    }

    console.log = (d) => log_my_data(d, log_file, "LOG", debug);
    console.warn = (d) => log_my_data(d, log_file, "WARNING", debug);
    console.error = (d) => log_my_data(d, err_file, "ERROR", debug);

}

module.exports.logger_init = logger_init;
