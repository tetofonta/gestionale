const fs = require('fs');
const util = require('util');
const log_stdout = process.stdout;
const log_stderr = process.stderr;

function logger_init(err, log, debug = false) {
    const log_file = fs.createWriteStream(log, {flags: 'a'});
    const err_file = fs.createWriteStream(err, {flags: 'a'});

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