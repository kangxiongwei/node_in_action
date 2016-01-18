/**
 *
 * Created by kangxiongwei on 2016/1/18.
 */
var http = require("http");
var fs = require("fs");
var path = require("path");
var mime = require("mime");
var cache = {};

/**
 * 请求的资源未找到帮助函数
 * @param response
 */
function send404(response) {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('Error 404: Resource not found.');
    response.end();
}

/**
 * 文件路径帮助函数
 * @param response
 * @param filePath
 * @param fileContents
 */
function sendFile(response, filePath, fileContents) {
    response.writeHead(200, {'Content-Type': mime.lookup(path.basename(filePath))});
    response.end(fileContents);
}

/**
 * 缓存文件帮助函数
 * @param response
 * @param cache 缓存
 * @param absPath 文件路径
 */
function serveStatic(response, cache, absPath) {
    if (cache[absPath]) {
        sendFile(response, absPath, cache[absPath]);
    }
    else {
        fs.exists(absPath, function (exists) {
            if (exists) {
                fs.readFile(absPath, function (err, data) {
                    if (err) {
                        send404(response);
                    }
                    else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                });
            }
            else {
                send404(response);
            }
        })
    }
}

var server = http.createServer(function (request, response) {
    var filePath = false;
    if (request.url == '/') {
        filePath = "public/index.html";
    }
    else {
        filePath = 'public' + request.url;
    }
    var absPath = './' + filePath;
    serveStatic(response, cache, absPath);
});

/**
 * 服务器监听3000端口
 */
server.listen(3000, function () {
    console.log("Server listening on port 3000.");
});

var chatServer = require('./lib/chat_server');
chatServer.listen(server);