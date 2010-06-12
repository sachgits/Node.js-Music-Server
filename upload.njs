if (this.POST['upload']) {
	if (!this.SESSION['id']) Utilities.redirect(this, '/?error=1');
	else if (this.POST['upload']['filename'] !== '') {
		var fname = this.POST['upload']['filename'];
		if (fname.substring(fname.length - 4, fname.length) === '.njs') {
			Utilities.redirect(this, '/?error=4');
		} else {
			var uniqueFname = this.SESSION['username'] + '.' + new Date().getTime() + '.' + fname;
			fs.renameSync(this.POST['upload']['path'], 'uploads/' + uniqueFname);
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
							
							db.close();
							Utilities.redirect(this, '/?success=' + id);
						}.bind(this));
					}.bind(this));
				}.bind(this));
			}.bind(this));
			
		}
	} else Utilities.redirect(this, '/?error=2');
} else Utilities.redirect(this, '/');