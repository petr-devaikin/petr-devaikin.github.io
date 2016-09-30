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

//=====================


var LEFT_MARGIN = 50,
    TOP_MARGIN = 50,
    CONVO_OFFSET = 150,

    FRACTION_WIDTH = 10,

    SHADOW_K = .1;


var dom = {
    svg: undefined,
    convocations: undefined,
    fractions: undefined,
    transitions: undefined,
    defs: undefined,
    deputies: undefined,
}

//=====================


function fractionPosition(fraction) {
    return [
        (LEFT_MARGIN + (d_convocations[fraction.convocationId].id - 1) * CONVO_OFFSET),
        fraction.offset + fraction.order * 3 + TOP_MARGIN
    ]
}


function drawConvocations() {
    var convocations = dom.convocations.selectAll('.convocation').data(a_convocations).enter();

    var groups = convocations.append('g')
        .classed('convocation', true)
        .attr('transform', function(d) { return 'translate({0},{1})'.format(LEFT_MARGIN + (d.id - 1) * CONVO_OFFSET, TOP_MARGIN); });

    var labels = groups.append('g')
        .classed('convocationLabel', true)
        .attr('transform', 'translate(0,-20)');

    labels.append('text')
        .classed('convocationYears', true)
        .text(function(d) { return d.years; });

    labels.append('text')
        .classed('convocationNumber', true)
        .attr('y', -15)
        .text(function(d) { return d.number; });
}

function drawTransitions() {
    var transitionsDirect = dom.transitionsDirect.selectAll('.transition').data(a_transitions_direct).enter();
    var transitionsJump = dom.transitionsJump.selectAll('.transition').data(a_transitions_jump).enter();

    var grads = dom.defs.selectAll('linearGradient')
        .data(a_transitions_direct.concat(a_transitions_jump), function(d) { return d.from + '-' + d.to })
        .enter()
            .append('linearGradient')
            .attr('id', function(d) { return 'g' + d.from + '-' + d.to; })
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 1)
            .attr('y2', 0);

    grads.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', function(d) { return d_fractions[d.from]._color; });

    grads.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', function(d) { return d_fractions[d.to]._color; });

    function drawHelper(transitions) {
        var groups = transitions.append('g')
            .classed('transition', true);

        var lines1 = groups.filter(function(d) {
            return d_fractions[d.from]._position[1] + d.leftOffset == d_fractions[d.to]._position[1] + d.rightOffset;
        })

        lines1.append('rect')
            .attr('x', function(d) { return d_fractions[d.from]._position[0] + FRACTION_WIDTH / 2; })
            .attr('y', function(d) { return d_fractions[d.from]._position[1] + d.leftOffset; })
            .attr('width', function(d) { return d_fractions[d.to]._position[0] - d_fractions[d.from]._position[0] - FRACTION_WIDTH; })
            .attr('height', function(d) { return d.number; })
            .attr('fill', function(d) { return 'url(#g{0}-{1})'.format(d.from, d.to); })
            .attr('stroke', 'none');

        var lines2 = groups.filter(function(d) {
            return d_fractions[d.from]._position[1] + d.leftOffset != d_fractions[d.to]._position[1] + d.rightOffset;
        })

        lines2.append('path')
            .attr('d', function(d) {
                var f1 = d_fractions[d.from],
                    f2 = d_fractions[d.to];
                var result = 'M {0} {1} C {2} {3}, {4} {5}, {6} {7}'.format(
                    f1._position[0] + FRACTION_WIDTH / 2, f1._position[1] + d.leftOffset + d.number / 2,
                    (f1._position[0] + f2._position[0]) / 2, f1._position[1] + d.leftOffset + d.number / 2,
                    (f1._position[0] + f2._position[0]) / 2, f2._position[1] + d.rightOffset + d.number / 2,
                    f2._position[0] - FRACTION_WIDTH / 2, f2._position[1] + d.rightOffset + d.number / 2
                );

                return result;
            })
            .attr('fill', 'none')
            .attr('stroke', function(d) { return 'url(#g{0}-{1})'.format(d.from, d.to); })
            .attr('stroke-width', function(d) { return d.number; });
    }

    drawHelper(transitionsDirect);
    drawHelper(transitionsJump);
}

function drawFractions() {
    var fractions = dom.fractions.selectAll('.fraction').data(a_fractions).enter();

    var groups = fractions.append('g')
        .classed('fraction', true)
        .attr('transform', function(d) {
            d._position = fractionPosition(d);
            d._color = d_parties[d.partyId].color;
            return 'translate({0},{1})'.format(d._position[0], d._position[1]);
        });

    groups.append('rect')
        .attr('x', -FRACTION_WIDTH / 2)
        .attr('y', 0)
        .attr('width', FRACTION_WIDTH)
        .attr('height', function(d) { return d.size; })
        .attr('fill', function(d) { return d._color; });
}

function addDeputies() {
    var deputies = dom.deputies.selectAll('.deputat').data(a_deputies).enter().append('div');

    deputies
        .classed('deputat', true)
        .append('div')
            .classed('deputatName', true)
            .text(function(d) {
                var fio = d.name.split(' ');
                return '{0} {1}.{2}.'.format(fio[0], fio[1][0], fio[2][0]);
            });

    var convos = deputies
        .append('div')
        .classed('depConvos', true)
        .selectAll('depConvo').data(function(d) { return d.convocations; }).enter();

    convos.append('div')
        .classed('depConvo', true)
        .classed('empty', function(d) { return d.partyId === undefined; })
        .style('background-color', function(d) {
            if (d.partyId !== undefined)
                return d_parties[d.partyId].color;
            else
                return 'none';
        })
}

function scrollEvents() {
    var h2 = d3.select('h2');

    d3.select(document).on('scroll', function() {
        h2.classed('scroll', document.body.scrollTop > 0);
    });
}


function draw() {
    dom.svg = d3.select('svg');
    dom.convocations = dom.svg.select('.convocations');
    dom.fractions = dom.svg.select('.fractions');
    dom.transitionsDirect = dom.svg.select('.transitions .direct');
    dom.transitionsJump = dom.svg.select('.transitions .jump');
    dom.defs = dom.svg.select('defs');
    dom.deputies = d3.select('.deputies');

    drawConvocations();
    drawFractions();
    drawTransitions();
    addDeputies();

    scrollEvents();
}
