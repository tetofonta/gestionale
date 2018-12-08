const assert = require('assert');
const rewire = require('rewire');
const cfg = require('../../backend/network.config');
const {makePOST} = require('../express.tester');

const authModule = rewire("../../backend/auth.js");

describe('AUTH Backend', function () {

    const auth = authModule.__get__('auth');
    const onUserAuthenticated = authModule.__get__('onUserAuthenticated');
    const auth_refresh = authModule.__get__('auth_refresh');

    describe('auth', function () {
        it('should return state: false on no data', function (done) {
            makePOST(cfg.network.opNetwork.ip.join("."), {}, auth, (obj) => {
                assert.ok(!obj.state);
                assert.equal(obj.err, "Insufficent data");
                setImmediate(done)
            })
        });
        it('should return state: false on inexistent user', function (done) {
            makePOST(cfg.network.opNetwork.ip.join("."), {user: "maria", psw: "apassword"}, auth, (obj) => {
                assert.ok(!obj.state);
                assert.equal(obj.err, "Access denied.")
                setImmediate(done);
            })
        });
        it('should return state: false on sql injection try', function (done) {
            makePOST(cfg.network.opNetwork.ip.join("."), {user: "' OR 1; --", psw: " "}, auth, (obj) => {
                assert.ok(!obj.state);
                assert.equal(obj.err, "Access denied.")
                setImmediate(done);
            })
        });
        it('should return state: false on guest network', function (done) {
            makePOST("10.16.25.4", {user: "matteo", psw: "qwerty"}, auth, (obj) => {
                assert.ok(!obj.state);
                assert.equal(obj.err, "Access denied from guest network.")
                setImmediate(done);
            })
        });
        it('should return state: true on real user and get his infos', function (done) {
            makePOST(cfg.network.opNetwork.ip.join("."), {user: "matteo", psw: "qwerty"}, auth, (obj) => {
                assert.ok(obj.state);
                assert.equal(typeof(obj.token), "string");
                assert.equal(typeof(obj.username), "string");
                assert.equal(typeof(obj.name), "string");
                assert.equal(typeof(obj.secure), "number");
                assert.equal(typeof(obj.isAdmin), "number");
                setImmediate(done);
            });
        });
    });
    describe('auth_refresh', function () {
        it('should return state: false on no data', function (done) {
            makePOST(cfg.network.opNetwork.ip.join("."), {}, auth_refresh, (obj) => {
                assert.ok(!obj.state);
                assert.equal(obj.err, "User was not logged in.");
                setImmediate(done);
            })
        });
        it('should return state: false on inexistent user', function (done) {
            makePOST(cfg.network.opNetwork.ip.join("."), {user: "maria", token: " "}, auth_refresh, (obj) => {
                assert.ok(!obj.state);
                assert.equal(obj.err, "User was not logged in.")
                setImmediate(done);
            })
        });
        it('should return state: false on guest network', function (done) {
            makePOST("10.16.25.4", {user: "matteo", psw: "qwerty"}, auth_refresh, (obj) => {
                assert.ok(!obj.state);
                assert.equal(obj.err, "Access denied from guest network.")
                setImmediate(done);
            })
        });
        it('should return state: true on real user and get his infos', function (done) {
            makePOST(cfg.network.opNetwork.ip.join("."), {user: "matteo", psw: "qwerty"}, auth, (obj) => {
                assert.ok(obj.state);
                assert.equal(typeof(obj.token), "string");
                assert.equal(typeof(obj.username), "string");
                assert.equal(typeof(obj.name), "string");
                assert.equal(typeof(obj.secure), "number");
                assert.equal(typeof(obj.isAdmin), "number");
                makePOST(cfg.network.opNetwork.ip.join("."), {username: obj.username, token: obj.token}, auth_refresh, (obj) => {
                    assert.ok(obj.state);
                    assert.equal(typeof(obj.token), "string");
                    setImmediate(done);
                });
            });
        });
    });

    describe('onUserAuthenticated', function () {
        it('should return state: false on no data', function (done) {
            makePOST(cfg.network.opNetwork.ip.join("."), {}, (r, e) => onUserAuthenticated(r, e, () => e.send({state: true})), (obj) => {
                assert.ok(!obj.state);
                assert.equal(obj.err, "Insufficent data");
                setImmediate(done);
            })
        });
        it('should return state: false on user not logged', function (done) {
            makePOST(cfg.network.opNetwork.ip.join("."), {user: "maria", token: " "}, (r, e) => onUserAuthenticated(r, e, () => e.send({state: true})), (obj) => {
                assert.ok(!obj.state);
                assert.equal(obj.err, "Access denied.");
                setImmediate(done);
            })
        });
        it('should return state: false on guest network without flag', function (done) {
            makePOST("10.16.25.14", {user: "maria", token: " "}, (r, e) => onUserAuthenticated(r, e, () => e.send({state: true})), (obj) => {
                assert.ok(!obj.state);
                assert.equal(obj.err, "Access denied from guest network.");
                makePOST("10.16.25.14", {user: "maria", token: " "}, (r, e) => onUserAuthenticated(r, e, () => e.send({state: true}), undefined, true), (obj) => {
                    assert.ok(!obj.state);
                    assert.notEqual(obj.err, "Access denied from guest network.");
                    setImmediate(done)
                })
            })
        });
        it('should return state: true on user correctly logged', function (done) {
            makePOST(cfg.network.opNetwork.ip.join("."), {user: "matteo", psw: "qwerty"}, auth, (obj) => {
                assert.ok(obj.state);
                assert.equal(typeof(obj.token), "string");
                assert.equal(typeof(obj.username), "string");
                assert.equal(typeof(obj.name), "string");
                assert.equal(typeof(obj.secure), "number");
                assert.equal(typeof(obj.isAdmin), "number");
                makePOST(cfg.network.opNetwork.ip.join("."), {user: obj.username, token: obj.token}, (r, e) => onUserAuthenticated(r, e, () => e.send({state: true})), (obj) => {
                    assert.ok(obj.state);
                    setImmediate(done);
                })
            });
        });
        it('should return state: true on user correctly logged and right privs', function (done) {
            makePOST(cfg.network.opNetwork.ip.join("."), {user: "matteo", psw: "qwerty"}, auth, (obj) => {
                assert.ok(obj.state);
                assert.equal(typeof(obj.token), "string");
                assert.equal(typeof(obj.username), "string");
                assert.equal(typeof(obj.name), "string");
                assert.equal(typeof(obj.secure), "number");
                assert.equal(typeof(obj.isAdmin), "number");
                makePOST(cfg.network.opNetwork.ip.join("."), {user: obj.username, token: obj.token}, (r, e) => onUserAuthenticated(r, e, () => e.send({state: true}), ["CASSA"]), (obj) => {
                    assert.ok(obj.state);
                    setImmediate(done);
                })
            });
        });
        it('should return state: true on user correctly logged', function (done) {
            makePOST(cfg.network.opNetwork.ip.join("."), {user: "matteo", psw: "qwerty"}, auth, (obj) => {
                assert.ok(obj.state);
                assert.equal(typeof(obj.token), "string");
                assert.equal(typeof(obj.username), "string");
                assert.equal(typeof(obj.name), "string");
                assert.equal(typeof(obj.secure), "number");
                assert.equal(typeof(obj.isAdmin), "number");
                makePOST(cfg.network.opNetwork.ip.join("."), {user: obj.username, token: obj.token}, (r, e) => onUserAuthenticated(r, e, () => e.send({state: true}), ["CASSA", "CUCINA"]), (obj) => {
                    assert.ok(!obj.state);
                    assert.equal(obj.err, "Not enough permissions");
                    setImmediate(done);
                })
            });
        });
    });


});