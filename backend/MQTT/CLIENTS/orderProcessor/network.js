const GET = async (path) => {
    const response = await fetch(path);
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
};

const GETSync = (path) => {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", path, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
};


let POST = async (path, form) => {
    const response = await fetch(path, {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
    });
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
};

module.exports.GETSync = GETSync;
module.exports.GET = GET;
module.exports.POST = POST;
