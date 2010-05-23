var mscUploader = {
	start: function(el) {
		document.forms[0].submit();
		el.setStyle('display', 'none');
		$('loadingAnimation').setStyle('display', 'inline-block');
	},
	
	done: function() {
		$$('#fileupload div.fakefile input[name="add"]')[0].setStyle('display', 'inline-block');
		$('loadingAnimation').setStyle('display', 'none');
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
		fakefile.setStyle('background-image', 'none');
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