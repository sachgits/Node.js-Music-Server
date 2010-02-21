#!/usr/local/bin/node
Array.prototype.last = function () {
	return this[this.length - 1];
}

function fileExists(path) {
	var exists = true;
	fs.stat(path).addErrback(function () {
		exists = false;
	});
	
	return exists;
}

var mainFunc;
var includes = {};
function include(path, obj) {
	// Each javascript file that can be included will contain a variable 'mainFunc' with a string of its unique
	// main function call. That function is then called to produce an object that must contain a render method
	// which will return a HTML string.
	
	fs.readFile(path).addCallback(function (content) {
		eval(content);
		eval('includes["' + path + '"] = new ' + mainFunc + '(obj);');
	});
}

var sys = require('sys');
var http = require('http');
var fs = require('fs');
var events = require('events');

require.paths.unshift('./');
var mongo = require('mongodb/db');
process.mixin(mongo, require('mongodb/connection'));

var port = 80;
var db_port = 9001;
var host = 'fyorl';

// Could probably get this from looking at the HTTP header 'Accept'
// field but too lazy right now
var mimeLookup = {
	'css': 'text/css',
	'html': 'text/html',
	'jpg': 'image/jpeg',
	'png': 'image/png',
	'gif': 'image/gif'
};

// Sessions using mongoDB
var db = new mongo.Db('music-server', new mongo.Server(host, db_port, {}), {});
var userData = {};

http.createServer(function (req, res) {
	var url = req.url.split('/');
	var file = url.last();
	var path = url.slice(0, url.length - 1).join('/');
	var contentType = 'text/html';
	var statusCode = 200;
	var dump = false;
	var waiting = false;
	
	this.writeOutput = function () {
		for (var path in includes) {
			res.write(includes[path].render());
		}
		
		includes = {};
		mainFunc = '';
		waiting = false;
		
		if (!dump) {
			res.close();
		} else {
			var encoding = 'ascii';
			if (contentType.split('/')[0] === 'image') {
				encoding = 'binary';
			}
			
			fs.readFile(dump, encoding).addCallback(function (content) {
				res.write(content, encoding);
				dump = false;
				res.close();
			});
		}
	};
	
	this.processUrl = function () {
		if (file === '') {
			var filepath = '.' + path + '/index.js';
			if (fileExists(filepath)) {
				waiting = true;
				include(filepath, self);
			} else {
				statusCode = 404;
			}
		} else {
			var args = file.split('?');
			file = args[0];
			args = args[1];
			var filepath = '.' + path + '/' + file;
			if (fileExists(filepath)) {
				var extension = file.split('.').last();
				if (mimeLookup[extension]) {
					contentType = mimeLookup[extension];
					dump = filepath;
				} else if (extension === 'js') {
					waiting = true;
					include(filepath, self);
				} else  {
					contentType = 'text/plain';
				}
			} else {
				statusCode = 404;
			}
		}

		res.sendHeader(statusCode, {'Content-Type': contentType});
		if (!waiting) {
			self.writeOutput();
		}
	}
	
	var self = this;
	
	if(req.headers.cookie) {
		var found_sessid = false;
		req.headers.cookie.split('; ').forEach(function (cookie) {
			var keyVal = cookie.split('=');
			if (keyVal[0] === 'SESSID') {
				db.sessions(function (tbl) {
					tbl.find(function (rows) {
						found_sessid = true;
						var username = '';
						rows.each(function (row) {
							username = row['username'];
						});
						if (username !== '') {
							userData = {
								'sessid': keyVal[1],
								'username': username
							};
						}
						self.processUrl();
					}, {'sessid': keyVal[1]});
				}, 'sessid');
			}
		});
		
		if (!found_sessid) {
			self.processUrl();
		}
	} else {	
		self.processUrl();
	}
}).listen(port, host);
sys.puts('Server running at http://' + host + ':' + port + '/');