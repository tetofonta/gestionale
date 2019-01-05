const fs = require("fs");
const path = require("path");
const {execFileSync} = require("child_process");
const webpack = require("webpack");
const nodeExternals = require('webpack-node-externals');

const isDirectory = (e) => fs.lstatSync(e).isDirectory();
const startsWith = (sw) => (e) => path.basename(e).startsWith(sw);

let apiFile = {
    getStats: {
        modulePath: "./essential_module_stats",
        url: "/api/getStats",
        action: "POST",
        enabled: true
    }
};

fs.readdirSync(".").map(name => `./${name}`).filter(isDirectory).filter(startsWith("module_")).forEach(modulePath => {
    let infos = require(`${modulePath}/package.json`);
    if(!infos.api_enable){
        console.log("excluded module " + modulePath);
        return;
    }

    apiFile[infos.api_name] = {
        modulePath: `./modules/built/${infos.name}.js`,
        url: infos.api_url,
        action: infos.api_action,
        enabled: true
    };

    console.log("working on" + modulePath);

    execFileSync("yarn", ["install"], {cwd: modulePath});

    webpack({
        target: "node",
        mode: "production",
        entry: `${modulePath}/${infos.index ? infos.index : "index.js"}`,
        output: {
            path: path.resolve(__dirname, "./built"),
            filename: `${infos.name}.js`,
            library: infos.name,
            libraryTarget: 'umd',
            umdNamedDefine: true
        },
        externals: [nodeExternals()],
    }, (err, stats) => {
        if (err || stats.hasErrors()) {
            if(err) console.error(err);
            else console.error(stats.compilation.errors);
        }else{
            if(stats.hasWarnings() && process.argv[2] === "-show-warns") console.log(stats.compilation.warnings);
            console.log(`${modulePath} ( ${stats.hasWarnings() ? stats.compilation.warnings.length : 0} warning(s) )`);
        }
    });
});

console.log('####################################################');
console.log("Use -show-warns to log warnings");
console.log('####################################################\n');

apiFile = {apicalls: apiFile};
fs.writeFileSync("./built/api.json", JSON.stringify(apiFile));
