var ColorPalette = {
	discrete: function(minValue, maxValue, stepNumber) {
		var colors;

		if (stepNumber == 0) {
			colors = ['#2c7bb6', '#abd9e9', '#fdae61', '#d7191c'];
		}
		else {
			var minColor = '#cccccc';
			var maxColor = '#b30000';
			colors = d3.range(stepNumber).map(function(d) {
				return d3.interpolateRgb(minColor, maxColor)(d / stepNumber);
			});
		}

		var step = Math.ceil((maxValue - minValue + 1) / stepNumber);
		maxValue = minValue + step * stepNumber - 1;

		var steps = d3.range(stepNumber).map(function(d, i) {
			return {
				min: minValue + d * step,
				max: minValue + (d + 1) * step - 1,
			};
		});

		var scale = d3.scaleQuantize()
			.domain([minValue, maxValue])
			.range(colors);

		return {
			steps: steps,
			scale: scale
		}
	},
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
				min: -maxValue + d * step,
				max: -maxValue + (d + 1) * step - 1,
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
	},
	ordinal: function(items) {
		var scale = d3.scaleOrdinal(items.length <= 10 ? d3.schemeCategory10 : d3.schemeCategory20).domain(items);
		return {
			scale: scale
		}
	}
}