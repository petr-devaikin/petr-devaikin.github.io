function Vislayout() {
	var steps = [];
	var currentStep = 0;

	var tooltip,
		startButton,
		nextButton,
		closeButton;

	this.addStep = function(newStep) { steps.push(newStep); }

	function nextStep() {
		currentStep++;

		var step = steps[currentStep];
		console.log(step);
		$('p', tooltip).text(step.text);

		if (currentStep == 0) {
			tooltip.show();
			nextButton.text('Explain')
				.click(nextStep);
		}
		else if (currentStep == steps.length - 1) {
			nextButton.text('Start exploration')
				.off('click')
				.click(stopExplanation);
		}
		else {
			nextButton.text('Next');
		}

		if (step.action !== undefined) step.action();
		var coords = step.position();
		tooltip.css('left', coords[0]).css('top', coords[1]);
	}

	function stopExplanation() {
		tooltip.hide();
	}

	function createTooltip() {
		tooltip = $('<div class="vislayout__tooltip"></div>');
		nextButton = $('<div class="vislayout__tooltip__button"></div>');
		closeButton = $('<div class="vislayout__tooltip__close">x</div>');
		tooltip.append($('<p>'));
		tooltip.append(startButton).append(nextButton).append(closeButton);
		$('.vislayout').append(tooltip);

		closeButton.click(stopExplanation);
	}

	this.startExplanation = function() {
		if (steps.length) {
			createTooltip();
			currentStep = -1;
			nextStep();
		}
	}
}