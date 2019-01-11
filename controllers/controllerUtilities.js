const sanitize = require('mongo-sanitize');
const xss = require('xss');


class ControllerUtility {
    constructor() {}

    setHeader(req, res) {
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Max-Age', '86400');
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
        return res;
    }

    parse(string) {
        return sanitize(xss(string.trim()));
    }

    error(message) {
        return {
            status: 'error',
            error: message
        };
    }
}

module.exports= new ControllerUtility();