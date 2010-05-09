var Utilities = {
	navbar: function(tpl) {
		var stock = '<div{sub1}><a href="{sub2}">{sub3}</a></div>';
		var btns = '';
		var first = {};
		
		if (tpl.svr.req.url !== '/') {
			btns += stock.substitute({'sub1': ' class="first"', 'sub2': '/', 'sub3': 'Home'});
		} else {
			first = {'sub1': ' class="first"'};
		}
		
		btns += stock.substitute($merge(first, {'sub2': '/login/', 'sub3': 'Login'}));
		btns += stock.substitute({'sub2': '/register/', 'sub3': 'Register'});
		
		tpl.replace('buttons', btns);
	},
	
	redirect: function(svr, to) {
		svr.headers = $merge({'Location': to}, svr.headers);
		svr.successCode = 303;
		svr.sendHeaders();
	}
}