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
	
	// In hindsight, this was a really silly way to implement this.
}

function pwHash (pw) {
	return SHA1(pw + 'salty');
}

var sys = require('sys');
var http = require('http');
var fs = require('fs');
var events = require('events');
var multipart = require('multipart');
var querystring = require('querystring');

process.mixin(GLOBAL, require('./assets/js/sha1'));

require.paths.unshift('./');
var mongo = require('mongodb/db');
process.mixin(mongo, require('mongodb/connection'));

var port = 80;
var db_port = 27017;
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
	var self = this;

	var url = req.url.split('/');
	var file = url.last();
	var path = url.slice(0, url.length - 1).join('/');
	var contentType = 'text/html';
	var statusCode = 200;
	var dump = false;
	var waiting = false;
	
	this.req = req;
	this.res = res;
	this.data = '';
	this.redirect = false;
	
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
		if (file === '' || !file.match(/\./)) {
			var filepath = './' + path + file + '/index.js';
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
		
		if(self.redirect !== false) {
			res.sendHeader(307, {'Location': self.redirect});
			res.close();
		}

		res.sendHeader(statusCode, {'Content-Type': contentType});
		if (!waiting) {
			self.writeOutput();
		}
	}
	
	this.parseCookies = function () {
		if(req.headers.cookie) {
			var found_uid = false;
			req.headers.cookie.split('; ').forEach(function (cookie) {
				var keyVal = cookie.split('=');
				if (keyVal[0] === 'UserID') {
					db.users(function (tbl) {
						tbl.find(function (rows) {
							found_uid = true;
							var username = '';
							rows.each(function (row) {
								if (row !== null) username = row['username'];
							});
							if (username !== '') {
								userData = {
									'UserID': keyVal[1],
									'username': username
								};
							}
							self.processUrl();
						}, {'UserID': keyVal[1]});
					}, 'UserID');
				}
			});
			
			if (!found_uid) {
				self.processUrl();
			}
		} else {	
			self.processUrl();
		}
	}
	
	if(req.method === 'POST') {
		req.addListener('data', function (chunk) {
			self.data += chunk;
		});
		
		req.addListener('end', function () {
			self.parseCookies();
		});
	} else {
		this.parseCookies();
	}
}).listen(port, host);
sys.puts('Server running at http://' + host + ':' + port + '/');