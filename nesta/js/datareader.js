function Datareader(base) {
	if (base === undefined)
		base = '../data/';

	this.read = function(fileName, callback) {
		if (fileName == 'bc_big_sector_year_welsh.csv') {
			d3.csv(
				base + fileName,
				function(data) {
					var cities = {},
						sectors = [],
						years = [];

					var propsToIgnore = ['lad_name', 'year'];

					data.forEach(function(line, i) {
						if (i == 0)
							Object.keys(line).forEach(function(prop, j) {
								if (propsToIgnore.indexOf(prop) == -1) sectors.push(prop);
							});

						if (years.indexOf(line.year) == -1) years.push(line.year);

						if (cities[line.lad_name] === undefined) cities[line.lad_name] = {};

						sectors.forEach(function(sector) {
							if (cities[line.lad_name][sector] === undefined) cities[line.lad_name][sector] = {};
							cities[line.lad_name][sector][line.year] = parseInt(line[sector]);
						});
					});
					
					
					callback(cities, sectors, years);
				}
			);
		}
	}
}