$(function() {
	setYear();
});

function setYear() {
	var currentYear;
	$(".project").each(function() {
		if ($(this).attr('data-year') == currentYear) {
			$(".project__year", this).hide();
		}
		else {
			currentYear = $(this).attr('data-year');
			$(".project__year", this).show();
		}
	});
}