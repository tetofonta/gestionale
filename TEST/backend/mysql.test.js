const assert = require('assert');
const rewire = require('rewire');

const loggerModule = rewire("../../backend/mysql.js");

describe('Mysql', function () {

    const connect = loggerModule.__get__('connect');
    const secure = loggerModule.__get__('secure');
    const getConnection = loggerModule.__get__('getConnection');

    describe('Singleton - getConnection', function () {
        it('should keep retuirning the same connection', function () {
            assert.equal(getConnection(), getConnection());
        });
    });
});