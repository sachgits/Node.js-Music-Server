mainFunc = 'registerMainIndex';

function registerMainIndex (obj) {
	var self = this;
	var prefix = '../';
	var title = 'Music Server: Register'
	self.html = '';
	
	var buttons = '';
	self.generateOutput = function (err, success) {
		fs.readFile('header.js').addCallback(function (content) {
			eval(content);
			
			if (!err && !success) {
				main = '\
					<div class="content"> \
						<form method="post" action=".">\
							<h2>Register</h2>\
							<p><label for="username">Username</label><input type="text" name="username" class="biginput" /></p>\
							<p><label for="password">Password</label><input type="password" name="password" class="biginput" /></p>\
							<p><label for="password2">Confirm</label><input type="password" name="password2" class="biginput" /></p>\
							<p class="submit"><input type="submit" name="submit" value="Register" class="bigbutton" /></p>\
						</form>\
					</div>\
				';
			}
			
			if (err) {
				main = '\
					<div class="content error">\
						<p>' + err + '</p>\
					</div>\
				';
			}
			
			if (success) {
				main = '\
					<div class="content success">\
						<p>' + success + '</p>\
					</div>\
				';
			}
			
			self.html += '\
				<div id="submenu"> \
					<div id="submenu-wrapper"> \
						' + buttons + ' \
						<div class="clear"></div> \
					</div> \
				</div> \
				<div id="wrapper"> \
					<div class="container contained"> \
						' + main + '\
					</div> \
				</div> \
			</div> \
			';
			
			fs.readFile('footer.html').addCallback(function (content) {
				self.html += content;
				obj.writeOutput();
			});
		});
	};
	
	var params = querystring.parse(obj.data);
	if(params['submit']) {
		if (params['password'] !== params['password2']) {
			self.generateOutput('Password mismatch.');
		} else {
			var found = false;
			db.open(function (db) {
				db.collection(function (tbl) {
					tbl.find(function (rows) {
						rows.each(function (row) {
							if (row !== null) found = true;
						});
						
						var maxID = -1;
						tbl.find(function (rows) {
							rows.each(function (row) {
								if (row !== null) {
									if (row['UserID'] > maxID) maxID = row['UserID'];
								}
							});
							
							maxID++;
							if (found) {
								self.generateOutput('Username already taken.');
							} else {
								tbl.insert({
									'UserID': maxID,
									'username': params['username'].toLowerCase(),
									'password': pwHash(params['password'])
								});
								self.generateOutput(false, 'Registered successfully, go to the login page.');
							}
						});
					}, {'username': params['username'].toLowerCase()});
				}, 'users');
			});
		}
	} else {
		self.generateOutput();
	}
	
	self.render = function () {
		return this.html;
	}
}