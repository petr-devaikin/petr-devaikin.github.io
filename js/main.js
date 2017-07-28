$(function() {
	hasher.changed.add(handleChanges); //add hash change listener
	hasher.initialized.add(handleChanges); //add initialized listener (to grab initial value in case it is already set)
	hasher.init();

	$('.menu__main a').append('<div class="cross"></div>');
	$('.cross').click(function() {
		hasher.setHash('');
		return false;
	});
});

function setYear() {
	var currentYear;
	$(".project:visible").each(function() {
		if ($(this).attr('data-year') == currentYear) {
			$(".project__year", this).hide();
		}
		else {
			currentYear = $(this).attr('data-year');
			$(".project__year", this).show();
		}
	});
}

function selectSection(sectionName) {
	$(".menu__main a").each(function() {
		if ($(this).attr("href") == "#" + sectionName) {
			$(this).addClass("selected");
		}
		else {
			$(this).removeClass("selected");
		}
	});

	$(".project").each(function() {
		if (sectionName == '' || $(this).attr('data-type').split(',').indexOf(sectionName) != -1)
			$(this).show();
		else
			$(this).hide();
	});

	setYear();
}

function handleChanges(newHash, oldHash) {
	selectSection(newHash);
}