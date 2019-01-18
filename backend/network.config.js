const fs = require('fs');
const path = require('path');

let configs = fs.readFileSync(process.cwd() + "/network.config.json", {encoding: 'utf8'});
configs = JSON.parse(configs);

module.exports = configs;