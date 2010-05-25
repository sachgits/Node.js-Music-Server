var mscUploader = {
	start: function(el) {
		document.forms[0].submit();
		el.setStyle('display', 'none');
		$('loadingAnimation').setStyle('display', 'inline-block');
	},
	
	done: function(code) {
		$$('#fileupload div.fakefile input[name="add"]')[0].setStyle('display', 'inline-block');
		$('loadingAnimation').setStyle('display', 'none');
		
		code = code.trim();
		
		if (code === 'SUCCESS') {
			this.eraseError();
		} else if (code === 'ERR_1') this.error('Illegal filetype.');
		else this.error('Unknown return code.');
		
		$$('input[name="upload"]')[0].value = '';
		$$('input[name="fakefile"]')[0].value = '';
		$$('input[name="fakefile"]')[0].removeClass('blank');
	},
	
	eraseError: function() {
		if ($$('div.content.error').length < 1) return;
		$$('div.content.error')[0].destroy();
	},
	
	error: function(msg) {
		if ($$('div.content.error').length > 0) {
			$$('div.content.error')[0].set('html', '<p>' + msg + '</p>');
		} else {
			new Element('div', {
				'class': 'content error',
				'html': '<p>' + msg + '</p>'
			}).inject($('uploaders'), 'before');
		}
	}
};

window.addEvent('domready', function() {
	// Because webkit sucks donkey balls
	if (Browser.Engine.webkit) {
		$$('#fileupload div.filecontainer')[0].setStyle('width', '90%');
		$$('#fileupload div.fakefile input[name="fakefile"]')[0].setStyle('width', '93%');
		
		[
			$$('#fileupload div.fakefile input[name="add"]')[0],
			$$('#fileupload div.fakefile img')[0]
		].forEach(function(el) {
			el.setStyles({
			    'position': 'absolute',
			    'top': 9,
			    'left': '106%'
			});
		});
	}
	
	var fakefile = $$('#fileupload input[name="fakefile"]')[0];
	$$('input[type="file"]')[0].addEvent('change', function() {
		fakefile.addClass('blank');
		fakefile.value = this.value;
	});
	
	$$('input[name="add"]').forEach(function(el) {
		if (el.getParent().get('class') !== 'fakefile') {
			el.addEvent('click', function() {
				this.form.submit();
			});
		} else {
			el.addEvent('click', function() {
				mscUploader.start(this);
			});
		}
	});
});