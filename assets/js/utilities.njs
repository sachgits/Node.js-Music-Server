var Utilities = {
	checkLogin: function(svr) {
		svr.openDB();
		svr.DB.open(function(err, db) {
			db.collection('users', function(err, collection) {
				collection.findOne({
					'id': svr.SESSION['id'],
					'verify': svr.SESSION['verify']
				}, function(err, cursor) {
					if (!cursor) this.redirect(svr, '/');
					else return true;
				}.bind(this));
			}.bind(this));
		}.bind(this));
	},
	
	generateKey: function(len) {
		if (!len) len = 12;
		var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
		var key = '';
		for (var i = 0; i < len; i++) key += chars.getRandom();
		return SHA1(key);
	},
	
	navbar: function(svr, tpl) {
		var stock = '<div{sub1}><a href="{sub2}">{sub3}</a></div>';
		var btns = '';
		var first = {};
		
		if (tpl.svr.req.url !== '/') {
			btns += stock.substitute({'sub1': ' class="first"', 'sub2': '/', 'sub3': 'Home'});
		} else {
			first = {'sub1': ' class="first"'};
		}
		
		if (!svr.SESSION['id']) {
			btns += stock.substitute($merge(first, {'sub2': '/login/', 'sub3': 'Login'}));
			btns += stock.substitute({'sub2': '/register/', 'sub3': 'Register'});
		} else {
			btns += stock.substitute($merge(first, {'sub2': '/youtube/', 'sub3': 'Youtube'}));
			btns += stock.substitute({'sub2': '/logout/', 'sub3': 'Logout'});
			tpl.replace('login', '<span>' + svr.SESSION['username'].capitalize() + '</span>');
		}
		
		tpl.replace('buttons', btns);
	},
	
	redirect: function(svr, to) {
		svr.headers = $merge({'Location': to}, svr.headers);
		svr.successCode = 303;
		svr.sendHeaders();
	}
}