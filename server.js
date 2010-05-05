#!/usr/local/bin/node

/**
 * Disclaimer: Now that I know how to use Node.js better, I shall rewrite this all to be
 * less paedophilic at some point in the future.
 * ~Fyorl
 */

Array.prototype.last = function () {
	return this[this.length - 1];
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

var port = 27018;
var db_port = 27017;
var host = 'localhost';

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

http.createServer(function (req, res) {
	var self = {};

	var url = req.url.split('/');
	var file = url.last();
	var path = url.slice(0, url.length - 1).join('/');
	
	self.dump = false;
	self.contentType = 'text/html';
	self.waiting = false;
	self.statusCode = 200;
	self.req = req;
	self.res = res;
	self.data = '';
	self.redirect = false;
	self.userData = {};
	
	self.writeOutput = function () {
		for (var path in includes) {
			res.write(includes[path].render());
		}
		
		includes = {};
		mainFunc = '';
		self.waiting = false;
		
		if (!self.dump) {
			res.close();
		} else {
			var encoding = 'ascii';
			if (self.contentType.split('/')[0] === 'image') {
				encoding = 'binary';
			}
			
			fs.readFile(self.dump, encoding).addCallback(function (content) {
				res.write(content, encoding);
				self.dump = false;
				res.close();
			});
		}
	};
	
	self.redirectHandle = function () {
		if(self.redirect !== false) {
			res.sendHeader(307, {'Location': self.redirect});
			res.close();
		}
		
		res.sendHeader(self.statusCode, {'Content-Type': self.contentType});
		if (!self.waiting) {
			self.writeOutput();
		}
	};
	
	self.processUrl = function () {
		if (file === '' || !file.match(/\./)) {
			var filepath = './' + path + file + '/index.js';
			var fd = fs.stat(filepath);
			sys.puts(sys.inspect(fs.stat));
			
			fd.addCallback(function (stats) {
				self.waiting = true;
				include(filepath, self);
				self.redirectHandle();
			});
			
			fd.addErrback(function () {
				self.statusCode = 404;
				self.redirectHandle();
			});
		} else {
			var args = file.split('?');
			file = args[0];
			args = args[1];
			var filepath = '.' + path + '/' + file;
			var fd = fs.stat(filepath);
			
			fd.addCallback(function (stats) {
				var extension = file.split('.').last();
				if (mimeLookup[extension]) {
					this.contentType = mimeLookup[extension];
					this.dump = filepath;
				} else if (extension === 'js') {
					this.waiting = true;
					include(filepath, self);
				} else  {
					this.contentType = 'text/plain';
				}
				
				this.redirectHandle();
			}.call(self));
			
			fd.addErrback(function () {
				self.statusCode = 404;
				self.redirectHandle();
			});
		}
	};
	
	self.parseCookies = function () {
		if(req.headers.cookie) {
			var found_uid = false;
			req.headers.cookie.split('; ').forEach(function (cookie) {
				var keyVal = cookie.split('=');
				if (keyVal[0] === 'UserID') {
					db.collection(function (tbl) {
						tbl.findOne(function (row) {
							found_uid = (row === undefined || row === null) ? false : true;
							if (!found_uid) return;
							
							self.userData = {
								'UserID': keyVal[1],
								'username': row['username']
							};
							self.processUrl();
						}, {'UserID': keyVal[1]});
					}, 'users');
				}
			});
			
			if (!found_uid) {
				self.processUrl();
			}
		} else {	
			self.processUrl();
		}
	};
	
	if(req.method === 'POST') {
		req.addListener('data', function (chunk) {
			self.data += chunk;
		});
		
		req.addListener('end', function () {
			self.parseCookies();
		});
	} else {
		self.parseCookies();
	}
}).listen(port, host);
sys.puts('Server running at http://' + host + ':' + port + '/');
