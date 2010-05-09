window.addEvent('domready', function() {
	var pw = $$('input[name="password"]')[0];
	var pw2 = $$('input[name="password2"]')[0];
	[pw, pw2].forEach(function(el) {
		el.addEvent('keyup', function(e) {
			if (pw.value !== pw2.value) {
				pw2.removeClass('success');
				pw2.addClass('error');
			} else {
				pw2.removeClass('error');
				pw2.addClass('success');
			}
		});
	});
});