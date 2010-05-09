var tpl = new Template(this, 'assets/xhtml/default.html');
Utilities.navbar(tpl);
tpl.replace('title', 'Music Server: Home');
tpl.output();