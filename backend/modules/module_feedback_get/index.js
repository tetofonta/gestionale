
module.exports.callback = function (proxy) {
    proxy.getConnection().query(`SELECT id, testo, answerType, details, title FROM questions`, (e, r) => {
        if (!r || e) proxy.send({state: false, err: e});
        else proxy.send({state: true, result: r});
    })
};
