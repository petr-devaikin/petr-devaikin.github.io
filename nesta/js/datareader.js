function Datareader(base) {
	if (base === undefined) base = '../data/';

	this.readData = function(dataSet, callback, params) {
		if (readers[dataSet] !== undefined)
			readers[dataSet](callback, params);
	}

	var readers = {};

	// big sector year welsh
	readers[Datareader.DATASETS.BigSectorYearWelsh] = function(callback) {
		d3.csv(
			base + Datareader.DATASETS.BigSectorYearWelsh,
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

	// bubblechart
	readers[Datareader.DATASETS.Bubblechart] = function(callback) {
		d3.csv(
			base + Datareader.DATASETS.Bubblechart,
			function(data) {
				var disciplines = [];
				var topics = [];

				data.forEach(function(line) {
					if (disciplines.indexOf(line.discipline) == -1)
						disciplines.push(line.discipline);

					var item = {
						name: line.research_topic.split('_').join(' '),
						category: line.discipline,
						value: {
							nonWelsh: parseFloat(line.value_pounds_Non_Welsh),
							welsh: parseFloat(line.value_pounds_Welsh),
						},
						projects: {
							nonWelsh: parseFloat(line.number_of_projects_Non_Welsh),
							welsh: parseFloat(line.number_of_projects_Welsh),
							welshProportion: parseFloat(line.number_of_projects_Welsh_proportion),
						},
					};

					if (item.value.welsh > 0 && item.projects.welsh > 0)
						topics.push(item);
				});

				callback(disciplines, topics);
			}
		);
	}

	// Returns the dictionary with cities and their areas
	readers[Datareader.DATASETS.Lads] = function(callback) {
		d3.csv(
			base + Datareader.DATASETS.Lads,
			function(line, i) {
				return {
					name: line.LAD13NM_LGDName,
					area: line.Areas
				}
			},
			function(data) {
				var res = {};
				data.forEach(function(d) { res[d.name] = d.area; });
				callback(res);
			}
		);
	}

	// Return LADs shape
	readers[Datareader.DATASETS.LadsMap] = function(callback) {
		d3.json(
			base + Datareader.DATASETS.LadsMap,
			function(error, lads) {
				if (error) return console.error(error);

				callback(lads);
			}
		);
	}

	// Topic piopularity
	readers[Datareader.DATASETS.TopicPopularity] = function(callback) {
		var years = ['2013', '2014', '2015', '2016'];
		d3.queue()
			.defer(d3.csv, base + Datareader.DATASETS.TopicPopularity.format('2013'))
			.defer(d3.csv, base + Datareader.DATASETS.TopicPopularity.format('2014'))
			.defer(d3.csv, base + Datareader.DATASETS.TopicPopularity.format('2015'))
			.defer(d3.csv, base + Datareader.DATASETS.TopicPopularity.format('2016'))
			.await(function(error) {
				var args = arguments;
				var topics = [];
				var dataForYears = {};

				years.forEach(function(year, i) {
					var data = args[i + 1];
					dataForYears[year] = {};

					data.forEach(function(line, j) {
						var topic = line.Topics;
						if (topics.indexOf(topic) == -1) topics.push(topic);
						for (var prop in line)
							if (line.hasOwnProperty(prop) && prop != 'Topics' && prop != '') {
								if (dataForYears[year][prop] === undefined) dataForYears[year][prop] = {};
								dataForYears[year][prop][topic] = parseFloat(line[prop]);
							}
					})
				});
				callback(years, topics, dataForYears);
			})
	}

	// Groups topics
	readers[Datareader.DATASETS.GroupsTopic] = function(callback, old) {
		var filename = base + Datareader.DATASETS.GroupsTopic + (old ? '_2013' : '_2013_2014_2015_2016') + '.csv';
		d3.csv(
			filename,
			function(line, i) {
				return {
					sourceId: line.id_x,
					sourceName: line.Source,
					targetId: line.id_y,
					targetName: line.Target
				}
			},
			function(data) {
				var nodes = {};
				var linkes = [];
				data.forEach(function(d) {
					if (nodes[d.sourceId] === undefined) nodes[d.sourceId] = d.sourceName;
					if (nodes[d.targetId] === undefined) nodes[d.targetId] = d.targetName;

					if (linkes.find(function(l) {
						return (l.target == d.sourceId && l.source == d.targetId) ||
							(l.source == d.sourceId && l.target == d.targetId);
					}) === undefined)
						linkes.push({
							source: d.sourceId,
							target: d.targetId,
							value: 1
						});
				})

				callback(
					Object.keys(nodes).map(function(k) { return { id: k, name: nodes[k]}; }),
					linkes
				);
			}
		)
	}

	// Engineering Tech Lad
	readers[Datareader.DATASETS.EngineeringTechLad] = function(callback) {
		d3.csv(
			base + Datareader.DATASETS.EngineeringTechLad,
			function(data) {
				var lads = [];
				var topics = [];
				var res = [];

				data.forEach(function(line, i) {
					if (i == 0)
						Object.keys(line).forEach(function(prop, j) {
							if (prop != 'lad_name') topics.push(prop);
						});
					else
						lads.push(line['lad_name']);

					topics.forEach(function(topic, j) {
						if (line[topic] !== undefined && line[topic] != '' && line[topic] != '0')
							res.push({
								lad: line['lad_name'],
								topic: topic,
								value: parseFloat(line[topic])
							});
					});
				});
				callback(lads, topics, res);
			}
		);
	}

	// Attendants
	readers[Datareader.DATASETS.Attendants] = function(callback) {
		d3.csv(
			base + Datareader.DATASETS.Attendants,
			function(rawData) {
				from = [];
				to = [];
				data = [];

				rawData.forEach(function(line, i) {
					if (i == 0)
						Object.keys(line).forEach(function(prop, j) {
							if (prop != 'registration_city' && prop != '') to.push(prop);
						});
					else
						from.push(line['registration_city']);

					to.forEach(function(toCity, j) {
						data.push({
							from: line['registration_city'],
							to: toCity,
							value: parseInt(line[toCity])
						});
					});
				});
				callback(from, to, data);
			}
		);
	}

	// Industry
	readers[Datareader.DATASETS.IndustryBusiness] = function(callback) {
		d3.csv(
			base + Datareader.DATASETS.IndustryBusiness,
			function(line) {
				return {
					lad: line.lad_name,
					year: line.year,
					sector: line.industry.split('_')[0],
					industry: line.industry.split('_').slice(1).join(' '),
					business: line.business_n,
					decileSalary: line.decile_salary,
					decileGVA: line.decile_gva,
					decileUniqueness: line.decile_uniq
				}
			},
			function(rawData) {
				var years = [];
				var lads = [];
				var sectors = {};

				rawData.forEach(function(d) {
					if (sectors[d.sector] === undefined) sectors[d.sector] = {
						combined: {},
						industries: {},
					};
					if (years.indexOf(parseInt(d.year)) == -1) years.push(parseInt(d.year));
					if (lads.indexOf(d.lad) == -1) lads.push(d.lad);

					if (sectors[d.sector].combined[parseInt(d.year)] === undefined)
						sectors[d.sector].combined[parseInt(d.year)] = 0;

					sectors[d.sector].combined[parseInt(d.year)] += parseFloat(d.business);

					if (sectors[d.sector].industries[d.industry] === undefined)
						sectors[d.sector].industries[d.industry] = {};

					sectors[d.sector].industries[d.industry][parseInt(d.year)] = {
						business: parseFloat(d.business),
						decileSalary: parseFloat(d.decileSalary),
						decileGVA: parseFloat(d.decileGVA),
						decileUniqueness : parseFloat(d.decileUniqueness),
					};
				});

				callback(years, lads, sectors);
			}
		);
	}

	readers[Datareader.DATASETS.IndustryEmployment] = function(callback) {
		d3.csv(
			base + Datareader.DATASETS.IndustryEmployment,
			function(line) {
				return {
					lad: line.lad_name,
					year: parseInt(line.year),
					sector: line.industry.split('_')[0],
					industry: line.industry.split('_').slice(1).join(' '),
					employment: parseInt(line.employment),
					decileSalary: parseInt(line.decile_salary),
					decileGVA: parseInt(line.decile_gva),
					decileUniqueness: parseInt(line.decile_uniq)
				}
			},
			function(rawData) {
				var years = [];
				var lads = [];
				var sectors = {};

				rawData.forEach(function(d) {
					if (sectors[d.sector] === undefined) sectors[d.sector] = {
						combined: {},
						industries: {},
					};
					if (years.indexOf(d.year) == -1) years.push(d.year);
					if (lads.indexOf(d.lad) == -1) lads.push(d.lad);

					if (sectors[d.sector].combined[d.year] === undefined)
						sectors[d.sector].combined[d.year] = 0;

					sectors[d.sector].combined[d.year] += d.employment;

					if (sectors[d.sector].industries[d.industry] === undefined)
						sectors[d.sector].industries[d.industry] = {};

					sectors[d.sector].industries[d.industry][d.year] = {
						employment: d.employment,
						decileSalary: d.decileSalary,
						decileGVA: d.decileGVA,
						decileUniqueness : d.decileUniqueness,
					};
				});

				callback(years, lads, sectors);
			}
		);
	}

	readers[Datareader.DATASETS.IndustryBusinessEmployment] = function(callback) {
		d3.csv(
			base + Datareader.DATASETS.IndustryBusinessEmployment,
			function(line, i) {
				return {
					year: parseInt(line.year),
					sector: line.industry.split('_')[0],
					industry: line.industry.split('_').slice(1).join(' '),
					business: parseInt(line.business_n),
					employment: parseInt(line.employment),
					decileSalary: line.decile_salary == '' ? 0 : parseInt(line.decile_salary),
					decileGVA: line.decile_gva == '' ? 0 : parseInt(line.decile_gva),
					decileUniqueness: line.decile_uniq == '' ? 0 : parseInt(line.decile_uniq)
				}
			},
			function(rawData) {
				var years = [];
				var sectors = [];

				rawData.forEach(function(d) {
					if (sectors.indexOf(d.sector) == -1) sectors.push(d.sector);
					if (years.indexOf(d.year) == -1) years.push(d.year);
				});

				callback(years, sectors, rawData);
			}
		);
	}

	// LAD Employment and Business
	readers[Datareader.DATASETS.LadsEmployment] = function(callback) {
		var lads = [];
		var sectors = [];
		var subsectors = [];

		var propsToIgnore = ['lad_name', 'year'];

		d3.csv(
			base + Datareader.DATASETS.LadsBusinessEmployment,
			function(line, i) {
				if (i == 0) {
					var res = {
						lad: line.lad_name,
						value: parseFloat(line.year),
						subsectors: [],
					}
					Object.keys(line).forEach(function(prop) {
						if (propsToIgnore.indexOf(prop) == -1) {
							var sector = prop.split('_')[0];
							var subsector = prop.split('_').slice(1).join(' ');
							
							if (sectors.indexOf(sectors) == -1) sectors.push(sector);
							subsectors.push({
								name: subsector,
								sector: sector,
								id: prop,
							});
							res.subsectors.push({
								subsector_id: prop,
								sector: sector,
								subsector: subsector,
								value: parseFloat(line[prop])
							})
						}
					});
				}
				return res;
			},
			function(rawData) {
				callback(lads, sectors, subsectors, rawData);
			}
		);
	}

	readers[Datareader.DATASETS.LadsEmploymentBusiness] = function(callback) {
		var sectors = [];
		var subsectors = [];

		var propsToIgnore = ['lad_name', 'year'];

		d3.queue()
			.defer(
				d3.csv,
				base + Datareader.DATASETS.LadsEmployment,
				function(line, i) {
					var res = {
						lad: line.lad_name,
						employment: parseFloat(line.year),
						business: undefined,
						subsectors: [],
					}
					if (i == 0) {
						Object.keys(line).forEach(function(prop) {
							if (propsToIgnore.indexOf(prop) == -1) {
								var sector = prop.split('_')[0];
								var subsector = prop.split('_').slice(1).join(' ');
								
								if (sectors.indexOf(sector) == -1) sectors.push(sector);
								subsectors.push({
									name: subsector,
									sector: sector,
									id: prop,
								});
							}
						});
					}
					subsectors.forEach(function(sub) {
						res.subsectors.push({
							subsector_id: sub.id,
							sector: sub.sector,
							subsector: sub.name,
							employment: parseFloat(line[sub.id]),
							business: undefined
						});
					});
					return res;
				})
			.defer(
				d3.csv,
				base + Datareader.DATASETS.LadsBusiness,
				function(line, i) {
					var res = {
						lad: line.lad_name,
						business: parseFloat(line.year),
						subsectors: [],
					}
					subsectors.forEach(function(sub) {
						res.subsectors.push({
							subsector_id: sub.id,
							business: parseFloat(line[sub.id])
						});
					});
					return res;
				})
			.await(function(error) {
				var args = arguments;

				var errorLads = [];
				var errorSubsectors = [];

				// merge
				var dataEmployment = args[1];
				var dataBusiness = args[2];
				dataBusiness.forEach(function(line) {
					var record = dataEmployment.find(function(d) {
						return d.lad == line.lad;
					});
					if (record === undefined) {
						if (errorLads.indexOf(line.lad) == -1) errorLads.push(line.lad);
						return;
					}
					record.business = line.business;

					subsectors.forEach(function(sub) {
						var subsectorEmployment = record.subsectors.find(function(d) {
							return d.id == sub.id;
						});

						var subsectorBusiness = line.subsectors.find(function(d) {
							return d.id == sub.id;
						});

						if (subsectorEmployment === undefined || subsectorBusiness === undefined) {
							if (errorSubsectors.indexOf(sub.id) == -1) errorSubsectors.push(sub.id);
							return;
						}
						subsectorEmployment.business = subsectorBusiness.business;
					});
				});

				errorLads = errorLads.concat(
					dataEmployment
						.filter(function(d) { return d.business === undefined; })
						.map(function(d) { return d.lad; })
				);

				dataEmployment = dataEmployment.filter(function(d) { return d.business !== undefined; });
				var lads = dataEmployment.map(function(d) { return d.lad; });

				if (errorLads.length)
					console.error('Merge error. {0} LADs. {1}...'.format(errorLads.length, errorLads.slice(0,10).join(', ')));
				if (errorSubsectors.length)
					console.error('Merge error. {0} Subsectors. {1}...'.format(errorSubsectors.length, errorSubsectors.slice(0,10).join(', ')));

				callback(lads, sectors, subsectors, dataEmployment);
			});
	}
}

Datareader.DATASETS = {
	Lads: 'lads.csv',
	LadsMap: 'ladsmap.json',
	BigSectorYearWelsh: 'bc_big_sector_year_welsh.csv',
	Bubblechart: 'bubble_chart_source_data.csv',
	TopicPopularity: 'topic_popularity/topic_popularity_by_city_scaled_{0}.csv',
	GroupsTopic: 'wales_groups_topic_ids',
	EngineeringTechLad: 'engineering_tech_lad.csv',
	Attendants: 'attendants_in_other_cities.csv',
	IndustryBusiness: '19_3_2017_lad_idbr_merged.csv',
	IndustryEmployment: '19_3_2017_lad_bres_merged.csv',
	IndustryBusinessEmployment: '19_3_2017_wales_industry_advantage_2010_15.csv',
	LadsEmploymentBusiness: 'lads_employment_business',
	LadsEmployment: '19_3_2017_lq_employment_bres_2009_15.csv',
	LadsBusiness: '19_3_2017_lq_business_count_idbr_2010_15.csv',
}
