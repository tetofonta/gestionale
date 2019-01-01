const {getConnection, secure} = require("./mysql");
const {onUserAuthenticated} = require("./auth");

module.exports.callback = (req, res) => {
    onUserAuthenticated(req, res, (data) => {
        console.log(data);
        data.edited.forEach(e => {
            getConnection().query(`INSERT INTO ads(\`desc\`, rank, visualized, image_src, total_visualization) VALUES ('${secure(e.desc)}', ${secure(e.rank)}, 0, '${secure(e.image_src)}', 0)  ON DUPLICATE KEY UPDATE rank = ${e.rank}, \`desc\` = '${secure(e.desc)}', image_src='${secure(e.image_src)}'`);
        });
    }, ["AMMINISTRAZIONE"])
};
