if (prefix !== '') {
	buttons = '<div class="first"><a href="/">Home</a></div>';
}

buttons += ' \
	<div' + ((prefix !== '') ? '' : ' class="first"') + '><a href="' + prefix + 'login/">Login</a></div> \
	<div><a href="' + prefix + 'register/">Register</a></div> \
';

if (userData.username) {
	buttons = ' \
		<div class="first"><a href="/">Home</a></div> \
		<div><a href="' + prefix + 'youtube/">Youtube</a></div> \
		<div><a href="' + prefix + 'logout/">Logout</a></div> \
	';
}

self.html = '\
	<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"> \
		<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en"> \
			<head> \
				<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/> \
				<meta name="author" content="Kim Mantas" /> \
				<title>' + title + '</title> \
				<link href="' + prefix + 'assets/styles/main.css" rel="stylesheet" type="text/css" media="screen" /> \
				<link href="' + prefix + 'assets/styles/notes.css" rel="stylesheet" type="text/css" media="screen" /> \
			</head> \
			<body> \
				<div id="super-duper-wrapper"> \
					<div id="container" class="notes"> \
						<h1>Music Server</h1> \
						<div class="taglines">Oh hai guys, I re-reimplemented ur music server.</div> \
					</div> \
';