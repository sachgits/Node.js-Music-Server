var sys = require('sys');
var http = require('http');
var fs = require('fs');
var url = require('url');
var querystring = require('querystring');
var mongo = require('./mongodb');
var db_port = mongo.Connection.DEFAULT_PORT;

if (process.argv.length < 3) var port = 80;
else var port = parseInt(process.argv[2]);

eval(fs.readFileSync('assets/js/mootools.njs'));
eval(fs.readFileSync('assets/js/sha1.njs'));
eval(fs.readFileSync('assets/js/template.njs'));
eval(fs.readFileSync('assets/js/extensions.njs'));
eval(fs.readFileSync('assets/js/utilities.njs'));
eval(fs.readFileSync('.htaccess.njs'));

var Server = new Class({
	DB: {},
	GET: {},
	POST: {},
	successCode: 200,
	headers: {'Content-Type': 'text/html'},
	body: '',
	
	chunkedOutput: function(file, mime, encoding) {
		this.res.writeHead(this.successCode, {'Content-Type': mime});
		var stream = fs.createReadStream(file, {'encoding': encoding});
		
		stream.addListener('data', function(data) {
			if (encoding === 'binary') data = data.toString(encoding, 0, data.length);
			this.res.write(data, encoding);
		}.bind(this));
		
		stream.addListener('end', function() {
			this.res.end();
		}.bind(this));
	},
	
	concatPath: function(path, concat) {
		if (path.substring(path.length - 1, 1) === '/') return path + concat;
		else return path + '/' + concat;
	},
	
	handleRequest: function() {
		var path = (this.req.url.charAt(0) === '/') ? this.req.url.substring(1, this.req.url.length) : this.req.url;
		if (path.indexOf('?') > -1) path = url.parse(path).pathname;
		if (path === '') path = '.';
		var stats = false;
		
		try {
			stats = fs.statSync(path);
		} catch (e) {}
		
		var file = false;
		
		if (!stats) {
			if (Redirect[path]) {
				var redir = false;
				try {
					redir = fs.statSync(Redirect[path]);
				} catch (e) {}
				if (!redir) this.notFound();
				else file = Redirect[path];
			} else this.notFound();
		} else {
			if (stats.isFile()) file = path;
			else if (stats.isDirectory()) {
				file = this.concatPath(path, 'index.njs');
				var idx = false;
				try {
					idx = fs.statSync(file);
				} catch (e) {}
				if (!idx) this.notFound();
			}
			else this.notFound();
		}
		
		if (!file) {
			this.notFound();
			return;
		}
		
		var extension = file.split('.').getLast();
		if (file.indexOf('.') < 0) extension = 'txt';
		var mime = ExtensionMap[extension];
		var encoding = 'utf8';
		
		if (mime.split('/')[0] === 'image') encoding = 'binary';
		if (mime === 'text/nodejs') eval(fs.readFileSync(file));
		else this.chunkedOutput(file, mime, encoding);
	},
	
	initialize: function(req, res) {
		this.req = req;
		this.res = res;
		
		this.GET = (req.url.indexOf('?') > -1) ? url.parse(req.url, true).query : {};
		if (req.method === 'POST') {
			this.req.setBodyEncoding('utf8');
			var postData = '';
			this.req.addListener('data', function(chunk) {
				postData += chunk;
			});
			this.req.addListener('end', function() {
				this.POST = querystring.parse(postData);
				this.handleRequest();
			}.bind(this));
		} else this.handleRequest();
	},
	
	notFound: function() {
		this.successCode = 404;
		this.writeResponse(true);
	},
	
	openDB: function() {
		this.DB = new mongo.Db('music-server', new mongo.Server('localhost', db_port, {}), {});
	},
	
	sendHeaders: function() {
		// Prematurely send headers
		this.res.writeHead(this.successCode, this.headers);
		this.res.end();
	},
	
	writeResponse: function(wholeChunk) {
		this.headers = $merge(this.headers, {
			'Content-Length': this.body.length
		});
		this.res.writeHead(this.successCode, this.headers);
		if (wholeChunk) this.res.write(this.body);
		this.res.end();
	}
});

http.createServer(function(req, res) {
	new Server(req, res);
}).listen(port);

sys.puts('Server listening on port ' + port);