var ColorPalette = {
	discreteDouble: function(maxValue, stepNumber) {
		//console.log(maxValue, stepNumber);
		var minColor = '#d73027',
			maxColor = '#1a9850',
			zeroColor = '#bbb';

		var stepNumberOneSide = (stepNumber - 1) / 2;
		//console.log('step one side: ' + stepNumberOneSide);

		if (maxValue < stepNumberOneSide) maxValue = stepNumberOneSide;

		var step = Math.ceil((maxValue * 2 + 1) / stepNumber);
		if (step % 2 == 0) step += 1;

		//console.log('step: ' + step);

		maxValue = Math.ceil((step * stepNumber - 1) / 2);
		//console.log('new max value: ' + maxValue);

		var steps = d3.range(stepNumber).map(function(d, i) {
			return {
				min: -maxValue + Math.round(d * step),
				max: -maxValue + Math.round((d + 1) * step) - 1,
			};
		});
		//console.log(steps);

		var colorSteps = d3.range(stepNumber).map(function(d) {
			if (d <= stepNumberOneSide) {
				//console.log(d / stepNumberOneSide);
				return d3.interpolateRgb(minColor, zeroColor)(d / stepNumberOneSide);
			}
			else {
				//console.log((d - stepNumberOneSide) / stepNumberOneSide);
				return d3.interpolateRgb(zeroColor, maxColor)((d - stepNumberOneSide) / stepNumberOneSide);
			}
		});

		//console.log(colorSteps);

		var colorScale = d3.scaleQuantize()
			.domain([-maxValue, maxValue])
			.range(colorSteps);

		//for (var i = -maxValue; i <= maxValue; i++)
		//	console.log(i, colorScale(i));

		return {
			steps: steps,
			scale: colorScale
		}
	}
}