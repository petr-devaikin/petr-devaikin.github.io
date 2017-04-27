function Tooltip() {
	var SHIFT = 20,
		TRANSITION_TIME = 500;

	var steps = [];
	var currentStep = 0;

	var tooltip,
		startButton,
		nextButton,
		closeButton;

	this.addStep = function(newStep) { steps.push(newStep); }
	this.loadSteps = function(s) { steps = s; }

	function nextStep() {
		currentStep++;

		var step = steps[currentStep];
			
		nextButton.addClass('disabled');

		if (step.before !== undefined)
			step.before(updateTooltip);
		else
			updateTooltip();

		function updateTooltip() {
			// Set content
			$('p', tooltip).text(step.text);

			if (currentStep == 0) {
				tooltip.show();
				nextButton.text('Explain')
					.click(nextStep);
			}
			else if (currentStep == steps.length - 1) {
				nextButton
					.text('Start exploration')
					.off('click')
					.click(stopExplanation);
			}
			else {
				nextButton.text('Next');
			}

			// Position tooltip
			if (step.position !== undefined)
				setPosition(step.position());

			
			setTimeout(
				function() {
					if (step.after !== undefined)
						step.after(function() {
							nextButton.removeClass('disabled');
						});
					else
						nextButton.removeClass('disabled');
				},
				currentStep == 0 ? 0 : TRANSITION_TIME
			);
		}

		function setPosition(pos) {
			var target = $(pos.target);
			var left, top;
			var shift = SHIFT;
			if (pos.shift) shift += pos.shift;
			switch (pos.position) {
				case 'left':
					left = target.offset().left - tooltip.outerWidth() - shift;
					top = target.offset().top + (target.outerHeight() - tooltip.outerHeight()) / 2;
					break;
				case 'left-top':
					left = target.offset().left - tooltip.outerWidth() - shift;
					top = target.offset().top;
					break;
				case 'left-bottom':
					left = target.offset().left - tooltip.outerWidth() - shift;
					top = target.offset().top + target.outerHeight() - tooltip.outerHeight();
					break;
				case 'right':
					left = target.offset().left + target.outerWidth() + shift;
					top = target.offset().top + (target.outerHeight() - tooltip.outerHeight()) / 2;
					break;
				case 'right-top':
					left = target.offset().left + target.outerWidth() + shift;
					top = target.offset().top;
					break;
				case 'right-bottom':
					left = target.offset().left + target.outerWidth() + shift;
					top = target.offset().top + target.outerHeight() - tooltip.outerHeight();
					break;
				case 'top':
					left = target.offset().left + (target.outerWidth() - tooltip.outerWidth()) / 2;
					top = target.offset().top - tooltip.outerHeight() - shift;
					break;
				case 'bottom':
					left = target.offset().left + (target.outerWidth() - tooltip.outerWidth()) / 2;
					top = target.offset().top + target.outerHeight() + shift;
					break;
			}
			tooltip.css('left', left).css('top', top);
		}
	}

	function stopExplanation() {
		tooltip.hide();
	}

	function createTooltip() {
		tooltip = $('<div class="tooltip"></div>');
		nextButton = $('<div class="tooltip__button"></div>');
		closeButton = $('<div class="tooltip__close">x</div>');
		tooltip.append($('<p>'));
		tooltip.append(startButton).append(nextButton).append(closeButton);
		$('body').append(tooltip);

		closeButton.click(stopExplanation);
	}

	this.startTour = function() {
		if (steps.length) {
			createTooltip();
			currentStep = -1;
			nextStep();
		}
	}
}