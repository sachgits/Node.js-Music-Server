var tpl = new Template(this, 'assets/xhtml/default.html');
Utilities.navbar(this, tpl);
tpl.replace('title', 'Music Server: Login');
tpl.load('assets/xhtml/loginForm.html', 'container');

if (this.GET['registered']) tpl.replace('message', '<div class="content success"><p>Registration successful, please log in.</p></div>');

if (this.POST['username']) {
	var username = this.POST['username'].toLowerCase();
	this.openDB();
	this.DB.open(function(err, db) {
		db.collection('users', function(err, collection) {
			collection.findOne({
				'username': username,
				'password': SHA1(this.POST['password'])
			}, function(err, cursor) {
				if (cursor) {
					var key = Utilities.generateKey();
					this.startSession();
					this.setSessionVar('id', cursor.id);
					this.setSessionVar('username', cursor.username);
					this.setSessionVar('verify', key);
					collection.update({'id': cursor.id}, {
						'id': cursor.id,
						'username': cursor.username,
						'password': cursor.password,
						'verify': key
					});
					db.close();
					Utilities.redirect(this, '/');
				} else {
					tpl.replace('message', '<div class="content error"><p>Username/password mismatch.</p></div>');
					db.close();
					tpl.output();
				}
			}.bind(this));
		}.bind(this));
	}.bind(this));
} else tpl.output();