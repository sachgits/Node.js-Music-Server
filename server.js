var sys = require('sys');
var http = require('http');
var fs = require('fs');
var mongo = require('./mongodb');
var db_port = mongo.Connection.DEFAULT_PORT;

if (process.argv.length < 3) var port = 80;
else var port = parseInt(process.argv[2]);

eval(fs.readFileSync('assets/js/mootools.js'));
eval(fs.readFileSync('.htaccess.js'));

var Server = {
	successCode: 200,
	headers: {
		'Content-Type': 'text/html'
	},
	body: '',
	
	concatPath: function(path, concat) {
		if (path.substring(path.length - 1, 1) === '/') return path + concat;
		else return path + '/' + concat;
	}
	
	handleRequest: function(req, res) {
		this.req = req;
		this.res = res;
		
		var path = req.url.substring(1, req.url.length - 1);
		var stats = fs.statSync(path);
		var file;
		if (!stats.isFile()) {
			if (!stats.isDirectory()) {
				if (Redirect[path]) {
					if (!fs.statSync(Redirect[path])) this.notFound();
					else file = Redirect[path];
				} else this.notFound();
			} else file = this.concatPath(path, 'index.js');
		} else file = path;
		
		
	},
	
	notFound: function() {
		this.successCode = 404;
		this.writeResponse(true);
	}
	
	writeResponse: function(wholeChunk) {
		this.headers = $merge(this.headers, {
			'Content-Length': this.body.length
		});
		this.res.writeHead(this.successCode, this.headers);
		if (wholeChunk) this.res.write(this.body);
		this.res.end();
	}
};

http.createServer(Server.handleRequest.bind(Server)).listen(port);