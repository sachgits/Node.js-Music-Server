var CONTAINER = '';

function displayChunk() {
	var tpl = new Template(this, 'assets/xhtml/empty.html');
	tpl.replace('container', CONTAINER);
	tpl.output();
}

function displayWhole() {
	var tpl = new Template(this, 'assets/xhtml/default.html');
	Utilities.navbar(this, tpl);
	tpl.replace('title', 'Music Server: Home');
	tpl.replace('container', CONTAINER);
	if (this.SESSION['id']) {
		tpl.load('assets/xhtml/uploaders.html', 'message');
		tpl.addScript('/assets/js/mootools-dom.js');
		tpl.addScript('/assets/js/index.js');
		tpl.output();
	} else tpl.output();
}

function getQueue(fn) {
	this.openDB();
	this.DB.open(function(err, db) {
		db.collection('rotor', function(err, collection) {
			collection.find(function(err, cursor) {
				cursor.toArray(function(err, docs) {
					Utilities.bubbleSort(docs, 'bid', 'asc');
					if (docs.length > 0) {
						CONTAINER += '<div class="bucket">';
						var currentBID = docs[0].bid;
						docs.forEach(function(doc, k) {
							if (doc === null) return;
							var cls = 'song';
							if (CONTAINER === '<div class="bucket">') cls += ' first';
							if (!docs[k + 1] || docs[k + 1].bid !== currentBID) cls += ' last';
							if (doc.bid !== currentBID) {
								CONTAINER += '</div><div class="bucket">';
								currentBID = doc.bid;
							}
							CONTAINER += "<div class=\"" + cls + "\"><span class=\"uname\">" + doc.username.capitalize() + "</span><span class=\"fname\">" + doc.title + "</span>";
							if (this.SESSION['id'] && this.SESSION['id'] === doc.uid) CONTAINER += '<img src="/assets/images/delete.png" alt="delete" title="Delete this track" />';
							CONTAINER += '<img src="/assets/images/heart_delete.png" alt="dislike" title="Dislike this track" /></div>';
						}.bind(this));
						CONTAINER += '</div>';
					}
					fn.bind(this)();
					db.close();
				}.bind(this));
			}.bind(this));
		}.bind(this));
	}.bind(this));
}

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
							var id = -1;
							// Find earliest bucket
							docs.forEach(function(doc) {
								if (doc === null) return;
								if (doc.id > id) id = doc.id;
								if (doc.bid < bid || bid < 0) bid = doc.bid;
							});
							if (bid < 0) bid = 0;
							id++;
							
							var foundUser = false;
							docs.forEach(function(doc) {
								if (doc === null) return;
								if (doc.uid === this.SESSION['id']) {
									foundUser = true;
									if (doc.bid > bid) bid = doc.bid;
								}
							}.bind(this));
							
							if (foundUser) bid++;
							
							collection.insert({
								'id': id,
								'username': this.SESSION['username'],
								'uid': this.SESSION['id'],
								'file': uniqueFname,
								'title': fname,
								'bid': bid,
								'time': new Date().getTime().toString()
							});
							
							tpl.replace('body', 'SUCCESS');
							tpl.output();
							db.close();
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
		}
	} else {
		tpl.replace('body', 'ERR_2');
		tpl.output();
	}
} else {
	if (this.GET['ajax']) var fn = displayChunk;
	else var fn = displayWhole;
	getQueue.pass(fn, this)();
}