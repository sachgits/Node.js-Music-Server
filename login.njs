var tpl = new Template(this, 'assets/xhtml/default.html');
Utilities.navbar(tpl);
tpl.replace('title', 'Music Server: Login');
tpl.load('assets/xhtml/loginForm.html', 'container');

if (this.GET['registered']) tpl.replace('message', '<div class="content success"><p>Registration successful, please log in.</p></div>');
tpl.output();