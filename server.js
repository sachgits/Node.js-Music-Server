var sys = require('sys');
var http = require('http');
var fs = require('fs');
var mongo = require('./mongodb');
var db_port = mongo.Connection.DEFAULT_PORT;

if (process.argv.length < 3) var port = 80;
else var port = parseInt(process.argv[2]);

eval(fs.readFileSync('assets/js/mootools.js'));
eval(fs.readFileSync('assets/js/extensions.js'));
eval(fs.readFileSync('.htaccess.js'));

var Server = new Class({
	successCode: 200,
	headers: {
		'Content-Type': 'text/html'
	},
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
	
	initialize: function(req, res) {
		this.req = req;
		this.res = res;
		
		var path = req.url.substring(1, req.url.length);
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
			else if (stats.isDirectory()) file = this.concatPath(path, 'index.js');
			else this.notFound();
		}
		
		if (!file) return;
		
		var extension = file.split('.').getLast();
		if (file.indexOf('.') < 0) extension = 'txt';
		var mime = ExtensionMap[extension];
		var encoding = 'utf8';
		
		if (mime.split('/')[0] === 'image') encoding = 'binary';
		
		if (mime === 'text/javascript') eval(fs.readFileSync(file));
		else this.chunkedOutput(file, mime, encoding);
	},
	
	notFound: function() {
		this.successCode = 404;
		this.writeResponse(true);
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