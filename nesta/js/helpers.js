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

if (!Number.prototype.abbrNum) {
	Number.prototype.abbrNum = function(decPlaces) {
		var number = this + 0;

		if (decPlaces === undefined) decPlaces = 0;
		decPlaces = Math.pow(10,decPlaces);

		var abbrev = [ "k", "m", "b", "t" ];

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