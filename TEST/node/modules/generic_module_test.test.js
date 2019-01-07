const path = require("path");
const fs = require("fs");
const {execFileSync, spawn} = require("child_process");
const modulesPath = path.resolve(__dirname, "../../../backend/modules");
const serversPath = path.resolve(__dirname, "../../../backend");

const {getConnection, secure} = require("../../../backend/mysql");
const request = require("request");
const srequest = require("sync-request");
const cfg = require("../../../network.config");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

let processes = [
    {
        cmd: "node",
        args: ["init.js"],
        cwd: serversPath,
        name: "webserver"
    },
    {
        cmd: "node",
        args: ["manager.js"],
        cwd: serversPath + "/dataManager",
        name: "manager"
    },
    {
        cmd: "node",
        args: ["captive.js"],
        cwd: serversPath + "/CAPTIVE",
        name: "captive"
    }
];

let user = {
    zGCUMaGmze: "",
    hZqv1ejqxp: "",
    bwC0R1Xzhs: "",
    jZEd8rSlzz: "",
    crbofQFG90: "",
    tF4zBelNuu: "",
    vhl7gGF4GY: "",
    Jphx9LMutr: ""
};

let passwords = ["GlAJ7ZHzFT", "YgtOmpiQPO", "vzEFUm5hen", "mhKIoZ7VRn", "Ln13m9rQzp", "1jNHAkg2ZS", "mCykuYdwUr", "0u6DbIO8eq"];

function spawn_process(obj, command, args, log, cwd = __dirname, out = false, err = true) {
    let foo = spawn(command, args, {cwd: cwd});
    let running = true;
    if (out)
        foo.stdout.on("data", (e) => console.log(`${log}: ${e}`));

    if (err)
        foo.stderr.on("data", (e) => console.log(`${log}: ${e}`));

    foo.on('close', (code) => {
        console.log(`${log} exited with code ${code}`);
        running = false;
    });

    obj.app = foo;
    obj.running = running
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}

afterAll(() => {
    processes.forEach(e => {
        if (e.running) {
            e.app.kill('SIGINT');
            setTimeout(() => {
                if (e.running) {
                    e.app.kill('SIGKILL');
                    console.log(`killed ${e.name}`)
                }
            }, 900);
        }
    });
});

beforeEach(() => {
    processes.forEach(e => {
        if (!e.running){
            spawn_process(e, e.cmd, e.args, `${e.name}: `, `${e.cwd}`);
            sleep(10000);
        }
    });
});

const isNotDirectory = (e) => !fs.lstatSync(e).isDirectory();
const endsWith = (sw) => (e) => path.basename(e).endsWith(sw);

processes.forEach(e => spawn_process(e, e.cmd, e.args, `${e.name}: `, `${e.cwd}`));
sleep(5000);
Object.keys(user).forEach((e, i) => {
    let ret = srequest("POST", `${cfg.network.manager_use_ssl ? "https://" : "http://" }${cfg.managerIP}:${cfg.managerPort}/api/auth`, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        json: {user: e, psw: passwords[i]}
    });
    user[e] = JSON.parse(ret.getBody().toString()).token;
});

fs.readdirSync(__dirname).map(name => path.resolve(__dirname, `./${name}`)).filter(isNotDirectory).filter(endsWith("test.part.js")).forEach(modulePath =>
    require(modulePath).run(getConnection(), secure, (to, cb) => request(to, cb), (to, data, headers, cb) => request.post({
        method: "POST",
        headers: headers,
        url: to,
        body: data
    }, cb), cfg, user)
);

