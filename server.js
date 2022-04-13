var https = require('https');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

//取得指令參數，開啟對應的PORT
var args = process.argv.slice(2); //去除前兩個參數
var PORT = 3000;

function send404(response) {
	console.log('send404 is called.');
	response.writeHead(404, { 'Content-Type': 'text/plain' });
	response.write('Error 404: resource not found.');
	response.end();
}

function sendFile(response, filePath, fileContents) {
	// console.log('sendFile is called. filePath=' +filePath);
	response.writeHead(200, {
		'Content-Type': mime.getType(path.basename(filePath)),
		'Set-Cookie': 'server=' + PORT
	});
	response.end(fileContents);
}

function serveStatic(response, cache, absPath) {
	// console.log('serveStatic is called. absPath=' +absPath);
	if (cache[absPath]) {
		sendFile(response, absPath, cache[absPath]);
	} else {
		fs.exists(absPath, function (exists) {
			if (exists) {
				fs.readFile(absPath, function (err, data) {
					if (err) {
						send404(response);
					} else {
						cache[absPath] = data;
						sendFile(response, absPath, data);
					}
				});
			} else {
				send404(response);
			}
		});
	}
}

const options = {
	key: fs.readFileSync('./key.pem'),
	cert: fs.readFileSync('./cert.pem'),
	passphrase: 'meltyourheart'
};

var server = https.createServer(options, function (request, response) {
	var filePath = false;
	if (request.url == '/voice') {  
		filePath = './public/googleapi.html';  
	}
	else if (request.url == '/') {
		filePath = 'public/login.html';
	} else {
		filePath = 'public' + request.url;
	}
	var absPath = './' + filePath;
	serveStatic(response, cache, absPath);
});

server.listen(PORT, function () {
	console.log("Server listening on port " + PORT + ".");
});
var server = https.createServer(options, function (request, response) {
	var filePath = false;

	if (request.url == '/') {
		filePath = 'public/index.html';
	} else {
		filePath = 'public' + request.url;
	}
	var absPath = './' + filePath;
	serveStatic(response, cache, absPath);
});


