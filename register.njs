var tpl = new Template(this, 'assets/xhtml/default.html');
Utilities.navbar(this, tpl);
tpl.replace('title', 'Music Server: Register');
tpl.addScript('/assets/js/mootools-dom.js');
tpl.addScript('/assets/js/register.js');
tpl.load('assets/xhtml/registerForm.html', 'container');

if (this.POST['username'] && this.POST['username'] !== '') {
	var username = this.POST['username'].toLowerCase();
	this.openDB();
	this.DB.open(function(err, db) {
		db.collection('users', function(err, collection) {
			collection.findOne({'username': username}, function(err, cursor) {
				if (cursor) {
					tpl.replace('message', '<div class="content error"><p>Username already taken.</p></div>');
					db.close();
					tpl.output();
				} else {
					if (this.POST['password'] !== this.POST['password2'] || this.POST['password'] === '') {
						tpl.replace('message', '<div class="content error"><p>Password mismatch.</p></div>');
						db.close();
						tpl.output();
					} else if (this.POST['password'].length > 127 || this.POST['username'].length > 127) {
						tpl.replace('message', '<div class="content error"><p>Username or password too long.</p></div>');
						db.close();
						tpl.output();
					} else {
						var legal = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_'.split('');
						var valid = true;
						this.POST['username'].split('').forEach(function(letter) {
							if (!legal.contains(letter)) valid = false;
						});
						
						if (!valid) {
							tpl.replace('message', '<div class="content error"><p>Illegal username characters.</p></div>');
							db.close();
							tpl.output();
						} else {
							collection.find(function(err, cursor) {
								cursor.toArray(function(err, docs) {
									var id = -1;
									docs.forEach(function(item) {
										if (item === null) return;
										if (item.id > id) id = item.id;
									});
									id++;
									collection.insert({'username': username, 'password': SHA1(this.POST['password']), 'id': id, 'verify': ''});
									db.close();
									Utilities.redirect(this, '/login?registered=true');
								}.bind(this));
							}.bind(this));
						}
					}
				}
			}.bind(this));
		}.bind(this));
	}.bind(this));
} else tpl.output();