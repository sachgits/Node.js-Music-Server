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
	
	if (this.GET['error']) {
		var e = parseInt(this.GET['error']);
		var errors = [
			'Your session has expired, please log in again.',
			'Blank file selected.',
			'Illegal file type.'
		];
		var feedback = '';
		var i = errors.length;
		while (e > 0) {
			i--;
			if (e - Math.pow(2, i) < 0) continue;
			e -= Math.pow(2, i);
			feedback += '<div class="content error"><p>' + errors[i] + '</p></div>'
		}
		
		tpl.replace('feedback', feedback);
	}
	
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
							if (doc.bid !== currentBID) {
								CONTAINER += '</div><div class="bucket">';
								currentBID = doc.bid;
							}
							if (!docs[k + 1] || docs[k + 1].bid !== currentBID) cls += ' last';
							if (this.GET['success'] && this.GET['success'] == doc.id) cls += ' fadein';
							CONTAINER += "<div class=\"" + cls + "\"><span class=\"uname\">" + doc.username.capitalize() + "</span><span class=\"fname\">" + doc.title + "</span>";
							if (this.SESSION['id'] && this.SESSION['id'] == doc.uid) CONTAINER += '<img src="/assets/images/delete.png" alt="delete" title="Delete this track" />';
							if (this.SESSION['id']) CONTAINER += '<img src="/assets/images/thumb_down.png" alt="dislike" title="Dislike this track" />';
							CONTAINER += '</div>';
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

if (this.GET['ajax']) var fn = displayChunk;
else var fn = displayWhole;
getQueue.pass(fn, this)();