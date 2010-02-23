mainFunc = 'loginMainIndex';

function loginMainIndex (obj) {
	var self = this;
	var prefix = '../';
	var title = 'Music Server: Login';
	self.html = '';
	
	var buttons = '';
	self.generateOutput = function (err) {
		fs.readFile('header.js').addCallback(function (content) {
			eval(content);
			
			if (!err) {
				var main = '\
					<div class="content"> \
						<form method="post" action="." name="loginForm">\
							<h2>Login</h2>\
							<p><label for="username">Username</label><input type="text" name="username" class="biginput" /></p>\
							<p><label for="password">Password</label><input type="password" name="password" class="biginput" /></p>\
							<p class="submit"><input type="submit" name="submit" value="Login" class="bigbutton" /></p>\
						</form>\
					</div>\
				';
			} else {
				var main = '\
					<div class="content error">\
						<p>' + err + '</p>\
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
	if (params['submit']) {
		var uid = -1;
		db.open(function (db) {
			db.collection(function (tbl) {
				tbl.findOne(function (row) {
					if (row !== undefined && row !== null) {
						uid = row['UserID'];
						obj.userData = {
							'UserID': uid,
							'username': row['username']
						};
					}
					
					if (uid < 0) {
						self.generateOutput('Invalid username or password.');
					} else {
						document.cookie = 'UserID=' + uid + '; expires=' + new Date(new Date().getTime() + 259200000).toUTCString() + '; path=/'; // expires in 3 days
						obj.redirect = '/';
					}
				}, {'username': params['username'].toLowerCase(), 'password': pwHash(params['password'])});
			}, 'users');
		});
	} else {
		self.generateOutput();
	}
	
	self.render = function () {
		return this.html;
	}
}