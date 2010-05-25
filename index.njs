if (this.POST['upload']) {
	var tpl = new Template(this, 'assets/xhtml/blank.html');
	tpl.addScript('/assets/js/index-aux.js');
	
	if (this.POST['upload']['filename'] !== '') {
		var fname = this.POST['upload']['filename'];
		if (fname.substring(fname.length - 4, fname.length) === '.njs') {
			tpl.replace('body', 'ERR_1');
			tpl.output();
		} else {
			Utilities.checkLogin(this);
			var uniqueFname = this.SESSION['username'] + '.' + new Date().getTime() + '.' + fname;
			var fd = fs.openSync('uploads/' + uniqueFname, 'w', 0600);
			fs.writeSync(fd, this.POST['upload']['data'], 0, 'binary');
			fs.closeSync(fd);
			this.openDB();
			this.DB.open(function(err, db) {
				db.collection('rotor', function(err, collection) {
					collection.find(function(err, cursor) {
						cursor.toArray(function(err, docs) {
							var bid = -1;
							// Find earliest bucket
							docs.forEach(function(doc) {
								if (doc === null) return;
								if (doc.bid < bid || bid < 0) bid = doc.bid;
							});
							if (bid < 0) bid = 0;
							
							var foundUser = false;
							docs.forEach(function(doc) {
								if (doc === null) return;
								if (doc.uid === this.SESSION['id']) {
									foundUser = true;
									if (doc.bid > bid) bid = doc.bid;
								}
							});
							
							if (foundUser) bid++;
							
							collection.insert({
								'username': this.SESSION['username'],
								'uid': this.SESSION['uid'],
								'file': uniqueFname,
								'title': fname,
								'bid': bid,
								'time': new Date().getTime()
							});
						});
					});
				}.bind(this));
			}.bind(this));
			tpl.replace('body', 'SUCCESS');
		}
	}
} else {
	var tpl = new Template(this, 'assets/xhtml/default.html');
	Utilities.navbar(this, tpl);
	tpl.replace('title', 'Music Server: Home');
	if (this.SESSION['id']) {
		tpl.load('assets/xhtml/uploaders.html', 'message');
		tpl.addScript('/assets/js/mootools-dom.js');
		tpl.addScript('/assets/js/index.js');
		tpl.output();
	} else tpl.output();
}