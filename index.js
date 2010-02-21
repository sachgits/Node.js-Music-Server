mainFunc = 'mainIndex';

function mainIndex (obj) {
	var self = this;
	self.html = '';
	
	fs.readFile('header.html').addCallback(function (content) {
		self.html = content;
		self.html += '\
		<div id="super-duper-wrapper"> \
			<div id="container" class="notes"> \
				<h1>Music Server</h1> \
				<div class="taglines">Oh hai guys, I re-reimplemented ur music server.</div> \
			</div> \
			<div id="submenu"> \
				<div id="submenu-wrapper"> \
					<div class="first"><a href="login/">Login</a></div> \
					<div><a href="register/">Register</a></div> \
					<div class="clear"></div> \
				</div> \
			</div> \
			<div id="wrapper"> \
				<div class="container"> \
					 \
				</div> \
			</div> \
		</div> \
		';
		
		fs.readFile('footer.html').addCallback(function (content) {
			self.html += content;
			obj.writeOutput();
		});
	});
	
	self.render = function () {
		return this.html;
	}
}