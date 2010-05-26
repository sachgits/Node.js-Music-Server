var Multipart = new Class({
	obj: {},

	initialize: function(data, boundary) {
		var boundaries = data.split(boundary);
		boundaries.forEach(function(chunk) {
			if (!chunk.contains('; ')) return;
			var headers = chunk.match(/\r\n([^\r]*)\r\n/)[1].split('; ');
			if (chunk.contains('filename')) {
				var nm = '';
				var file = '';
				headers.forEach(function(header) {
					if (header.test(/^name/)) {
						nm = header.split("=\"")[1];
						nm = nm.substring(0, nm.length - 1);
					} else if (header.contains('filename')) {
						file = header.match(/filename="([^"]*)"/)[1];
					}
				});
				
				dat = chunk.split("\"\r\n");
				if (dat[1].substring(0, 1) !== "\r") {
					dat = dat[1].split("\r\n\r\n");
					dat.splice(0, 1);
					if (dat.length > 1) dat = dat.join("\r\n\r\n");
					else dat = dat.join('');
					var len = 4;
					if (dat.test(/\n\r\n--$/)) len = 5;
					dat = dat.substring(0, dat.length - len);
				} else dat = '';
				
				this.obj[nm] = {
					'filename': file,
					'data': dat
				}
			} else {
				var chunks = chunk.split('; ');
				chunks.forEach(function(str) {
					if (!str.contains('name')) return;
					var nm = str.split("=\"")[1];
					nm = nm.substring(0, nm.indexOf("\""));
					this.obj[nm] = str.split("\r\n")[2].trim();
				}.bind(this));
			}
		}.bind(this));
	},
	
	parse: function() {
		return this.obj;
	}
});