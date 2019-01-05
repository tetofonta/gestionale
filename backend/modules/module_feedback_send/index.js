module.exports.format = [
    {
        field: "answers",
        type: "array",
        required: true,
        inner: [
            {
                field: "answer",
                type: "string",
                required: true
            },
            {
                field: "details",
                type: "string",
                required: false
            },
            {
                field: "id",
                type: "number",
                required: true,
                strict: false
            }
        ]
    }
]

module.exports.callback = function (proxy) {
    let data = proxy.recv;
    if (!data.answers || !Array.isArray(data.answers)) proxy.send({state: false});
    data.answers.forEach(e => {
        proxy.getConnection().query(`insert into answers(answer, details, question) values ('${proxy.secure(e.answer)}', '${proxy.secure(e.details)}', ${proxy.secure(e.id)})`, (e) => {
            if (e) console.error(e)
        });
    });
    proxy.send({state: true});
};
