var mscUploader = {
	start: function(el) {
		document.forms[0].submit();
		el.setStyle('display', 'none');
		$('loadingAnimation').setStyle('display', 'inline-block');
		setTimeout('mscUploader.checkUploadStatus()', 2000);
	},
	
	checkUploadStatus: function() {
		var code = $('upload_target').contentDocument.activeElement.get('text').trim();
		if (code === 'NOT_DONE') setTimeout('mscUploader.checkUploadStatus()', 2000);
		else mscUploader.done(code);
	},
	
	done: function(code) {
		$$('#fileupload div.fakefile input[name="add"]')[0].setStyle('display', 'inline-block');
		$('loadingAnimation').setStyle('display', 'none');
		
		code = code.trim();
		
		if (code === 'SUCCESS') location.reload(true);
		else if (code === 'ERR_1') this.error('Illegal filetype.');
		else if (code === 'ERR_2') this.error('No file specified.');
		else if (code === 'ERR_3') this.error('Your session has expired, please refresh and login again.');
		else if (code !== 'NOT_DONE') this.error('Unknown return code.');
		else return;
		
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
	fakefile.value = '';
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