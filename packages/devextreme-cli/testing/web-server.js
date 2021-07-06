const http = require('http');
const fs = require('fs');
const path = require('path');

module.exports = class WebServer {
    httpServer;
    getMimeType(filePath) {
        const mimeTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.woff': 'application/font-woff',
            '.ttf': 'application/font-ttf',
            '.eot': 'application/vnd.ms-fontobject'
        };
        const extName = path.extname(filePath).toLowerCase();
        return mimeTypes[extName] || 'application/octet-stream';
    }

    async start(deployPath) {
        fs.mkdirSync(deployPath, { recursive: true });

        return new Promise((resolve, reject) => {
            this.httpServer = http.createServer((request, response) => {
                const filePath = path.join(deployPath, request.url === '/' ? 'index.html' : request.url);
                const contentType = this.getMimeType(filePath);

                fs.readFile(filePath, (error, content) => {
                    const setResponse = (content, contentType, status) => {
                        response.writeHead(status, { 'Content-Type': contentType });
                        response.end(content, 'utf-8');
                    };

                    if(error) {
                        if(error.code == 'ENOENT') {
                            setResponse('404', 'text/html', 404);
                        } else {
                            setResponse(`500: ${error.code}`, 'text/html', 500);
                        }
                    } else {
                        setResponse(content, contentType, 200);
                    }
                });
            }).listen(8080, () => {
                resolve();
            });
        });
    }

    async stop() {
        return new Promise(async(resolve, reject) => {
            if(this.httpServer) {
                this.httpServer.close(resolve);
            } else {
                resolve();
            }
        });
    }
};