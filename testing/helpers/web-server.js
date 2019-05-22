const httpServer = require('http-server');

exports.create = async(path, port) => {
    return new Promise((resolve, reject) => {
        const server = httpServer.createServer({
            root: path
        });
        server.listen(port, '0.0.0.0', (err) => {
            if(err) {
                reject(err);
            } else {
                resolve(server);
            }
        });
    });
};
