var Template = new Class({
	html: '',
	scripts: [],
	
	addScript: function(path) {
		var stock = '<script type="text/javascript" src="{sub1}"></script>';
		this.scripts.push(stock.substitute({'sub1': path}));
	},
	
	initialize: function(svr, base) {
		this.html = fs.readFileSync(base);
		this.svr = svr;
	},
	
	load: function(path, token) {
		this.replace(token, fs.readFileSync(path));
	},

	output: function() {
		if (this.scripts.length > 0) {
			this.replace('scripts', this.scripts.join("\n"));
		}
		
		this.svr.body = this.html;
		this.svr.writeResponse(true);
	},
	
	replace: function(token, str) {
		this.html = this.html.replace('<!--%' + token.toUpperCase() + '%-->', str);
	}
});