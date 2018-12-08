const assert = require('assert');
const rewire = require('rewire');

const fs = require("fs");

const loggerModule = rewire("../../backend/logger.js");

describe('Logger', function() {

    const checkPath = loggerModule.__get__('checkPath');
    const correctPath = loggerModule.__get__('correctPath');
    const createStream = loggerModule.__get__('createStream');
    const logger_init = loggerModule.__get__('logger_init');

    describe('checkPath', function() {
        it('should return false on undefined', function() {
            assert.equal(checkPath(undefined), false);
        });
        it('should return false on inexistent path', function() {
            assert.equal(checkPath("/a/file/that/not/exists.js"), false);
        });
        it('should return true on real path', function() {
            assert.equal(checkPath(__dirname + "/file.js"), true);
        });
        it('should return true on local dir', function() {
            assert.equal(checkPath("./log.log"), true);
        });
        it('should return true on parent dir', function() {
            assert.equal(checkPath("../log.log"), true);
        });
    });

    describe('correctPath', function() {
        it('should return false on undefined', function() {
            assert.equal(correctPath(undefined), false);
        });
        it('should return true and has to create the directory', function() {
            assert.equal(correctPath(__dirname + "/testDir/ciao.log"), true);
            assert.equal(fs.existsSync(__dirname + "/testDir/"), true);
        });
        it('should return false on no permissions path', function() {
            assert.equal(correctPath("/testDir/ciao.log"), false);
        });
    });

    describe('createStream', function() {
        it('should return undefined on undefined', function() {
            assert.equal(createStream(undefined), undefined);
        });
        it('should return true and has to create the file', function() {
            assert.equal(typeof(createStream(__dirname + "/testDir/ciao.log")), "object");
            assert.equal(fs.existsSync(__dirname + "/testDir/ciao.log"), true);
        });
        it('should return true and has to create the file and the directory', function() {
            assert.equal(typeof(createStream(__dirname + "/testDir/another/test/ciao.log")), "object");
            assert.equal(fs.existsSync(__dirname + "/testDir/another/test/ciao.log"), true);
        });
        it('should return false on no permissions path', function() {
            assert.equal(correctPath("/testDir/ciao.log"), false);
        });
    });

    describe('logger_init', function() {
        it('should create default files', function(done) {
            logger_init("ciao.log");
            assert.equal(fs.existsSync("./err.log"), true);
            assert.equal(fs.existsSync("./log.log"), true);
            setImmediate(done)
        });
    });
});