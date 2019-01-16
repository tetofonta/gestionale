module.exports.auth_required = true;
module.exports.privs = ["AMMINISTRAZIONE"];

module.exports.format = [{
    field: "edited",
    required: true,
    type: "array",
    inner: [
        {
            field: "desc",
            required: true,
            type: "string"
        },
        {
            field: "rank",
            required: true,
            type: "number",
            strict: false
        },
        {
            field: "image_src",
            required: true,
            type: "string"
        }
    ]
}];

module.exports.callback = (proxy) => {
    proxy.recv.edited.forEach(e => {
        proxy.getConnection().query(`INSERT INTO ads(\`desc\`, rank, visualized, image_src, total_visualization) VALUES ('${proxy.secure(e.desc)}', ${proxy.secure(e.rank)}, 0, '${proxy.secure(e.image_src)}', 0)  ON DUPLICATE KEY UPDATE rank = ${proxy.secure(e.rank)}, \`desc\` = '${proxy.secure(e.desc)}', image_src='${proxy.secure(e.image_src)}'`);
    });
};
