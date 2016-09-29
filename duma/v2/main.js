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


var CONVO_MARGIN = 100,
    CONVO_OFFSET = 150,

    WIDTH = 1000,
    HEIGHT = 200,

    FRACTION_WIDTH = 10,

    SHADOW_K = .1;


var dom = {
    svg: undefined,
    convocations: undefined,
    fractions: undefined,
    transitions: undefined,
    defs: undefined,
}

//=====================


function fractionPosition(fraction) {
    return [
        (CONVO_MARGIN + (d_convocations[fraction.convocationId].number - 1) * CONVO_OFFSET),
        fraction.offset + fraction.order * 3
    ]
}


function drawConvocations() {
    var convocations = dom.convocations.selectAll('.convocation').data(a_convocations).enter();

    var groups = convocations.append('g')
        .classed('convocation', true)
        .attr('transform', function(d) { return 'translate({0},0)'.format(CONVO_MARGIN + (d.number - 1) * CONVO_OFFSET); });
    groups.append('line')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
        .attr('y2', HEIGHT);
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


function draw() {
    dom.svg = d3.select('svg');
    dom.convocations = dom.svg.select('.convocations');
    dom.fractions = dom.svg.select('.fractions');
    dom.transitionsDirect = dom.svg.select('.transitions .direct');
    dom.transitionsJump = dom.svg.select('.transitions .jump');
    dom.defs = dom.svg.select('defs');

    drawConvocations();
    drawFractions();
    drawTransitions();
}
