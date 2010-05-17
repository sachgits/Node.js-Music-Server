var tpl = new Template(this, 'assets/xhtml/default.html');
Utilities.navbar(this, tpl);
tpl.replace('title', 'Music Server: Home');
if (this.SESSION['id']) {
	
} else tpl.output();