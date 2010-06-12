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
		el.addEvent('click', function() {
			this.form.submit();
		});
	});
	
	$$('div.fadein').forEach(function(el) {
		el.fade('in');
	});
});