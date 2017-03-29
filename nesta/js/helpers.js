if (!String.prototype.format) {
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) { 
			return typeof args[number] != 'undefined'
				? args[number]
				: match
			;
		});
	};
}

if (!Number.prototype.separate) {
	Number.prototype.separate = function() {
		var nStr = this + '';
		var x = nStr.split('.');
		var x1 = x[0];
		var x2 = x.length > 1 ? '.' + x[1] : '';
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + ',' + '$2');
		}
		return x1 + x2;
	}
}

if (!Number.prototype.abbrNum) {
	Number.prototype.abbrNum = function(decPlaces) {
		var number = this + 0;

		if (decPlaces === undefined) decPlaces = 0;
		decPlaces = Math.pow(10, decPlaces);

		var abbrev = [ "k", "m", "b", "t" ];

		if (number < 1000)
			number = Math.round(number*decPlaces)/decPlaces;
		else
			for (var i=abbrev.length-1; i>=0; i--) {
				var size = Math.pow(10,(i+1)*3);

				if (size <= number) {
					number = Math.round(number*decPlaces/size)/decPlaces;

					if ((number == 1000) && (i < abbrev.length - 1)) {
						number = 1;
						i++;
					}

					number += abbrev[i];
					break;
				}
			}

		return number;
	}
}