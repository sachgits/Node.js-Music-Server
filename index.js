mainFunc = 'mainIndex';

function mainIndex (obj) {
	var self = this;
	var prefix = '';
	self.html = '';
	
	var buttons = '';
	fs.readFile('header.js').addCallback(function (content) {
		eval(content);
		self.html += '\
			<div id="submenu"> \
				<div id="submenu-wrapper"> \
					' + buttons + ' \
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