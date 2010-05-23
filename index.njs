if (this.POST['upload']) {
	if (this.POST['upload']['filename'] !== '') {
		var fd = fs.openSync('uploads/' + this.POST['upload']['filename'], 'w', 0600);
		fs.writeSync(fd, this.POST['upload']['data'], 0, 'binary');
		fs.closeSync(fd);
	}
	
	var tpl = new Template(this, 'assets/xhtml/blank.html');
	tpl.addScript('/assets/js/index-aux.js');
	tpl.output();
} else {
	var tpl = new Template(this, 'assets/xhtml/default.html');
	Utilities.navbar(this, tpl);
	tpl.replace('title', 'Music Server: Home');
	if (this.SESSION['id']) {
		tpl.load('assets/xhtml/uploaders.html', 'message');
		tpl.addScript('/assets/js/mootools-dom.js');
		tpl.addScript('/assets/js/index.js');
		tpl.output();
	} else tpl.output();
}