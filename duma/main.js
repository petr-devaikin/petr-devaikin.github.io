// TODO:
// - check on mobile


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


if (!String.prototype.transliterate) {
    var tr = {"Ё":"Yo","Й":"I","Ц":"Ts","У":"U","К":"K","Е":"E","Н":"N","Г":"G","Ш":"Sh","Щ":"Sch","З":"Z","Х":"H","Ъ":"'","ё":"yo","й":"i","ц":"ts","у":"u","к":"k","е":"e","н":"n","г":"g","ш":"sh","щ":"sch","з":"z","х":"h","ъ":"'","Ф":"F","Ы":"I","В":"V","А":"A","П":"P","Р":"R","О":"O","Л":"L","Д":"D","Ж":"Zh","Э":"E","ф":"f","ы":"i","в":"v","а":"a","п":"p","р":"r","о":"o","л":"l","д":"d","ж":"zh","э":"e","Я":"Ya","Ч":"Ch","С":"S","М":"M","И":"I","Т":"T","Ь":"'","Б":"B","Ю":"Yu","я":"ya","ч":"ch","с":"s","м":"m","и":"i","т":"t","ь":"'","б":"b","ю":"yu"};

    String.prototype.transliterate = function() {
        return this.split('').map(function (char) {
            return tr[char] || char;
        }).join('');
    }
}

//=====================


var LEFT_MARGIN = 50,
    TOP_MARGIN = 50,
    CONVO_OFFSET = 150,

    FRACTION_WIDTH = 10,

    SHADOW_K = .1,

    SCALE_Y = 1,

    L_ALL_DEPS = 'Все депутаты',
    L_CONVO = 'созыв',
    L_DEP_OF_CONVO = 'Депутаты {0} созыва',
    L_PPL = '{0} чел.'

    ENGLISH = false;


var dom = {
    svg: undefined,
    convocations: undefined,
    fractions: undefined,
    transitions: undefined,
    defs: undefined,
    deputies: undefined,
    header: undefined,
}

//=====================

function setTitle(name) {
    var counter = L_PPL.format(dom.deputies.selectAll('.deputat:not(.hidden)').size());

    dom.header.select('#title').html(name === undefined ? L_ALL_DEPS : name);
    dom.header.select('#supp').text(counter);
    //dom.header.select('#counter').text(supp === undefined ? '' : counter);
    dom.header.select('#clear').classed('hidden', name === undefined);
}

function hoverConvocation(convocation) {
    dom.fractions.selectAll('.fraction')
        .classed('active', function(d) { return convocation !== undefined && d.convocationId == convocation.id; });
    dom.drawArea.selectAll('.transition.active')
        .classed('active', false);
}

function hoverFraction(fraction) {
    dom.fractions.selectAll('.fraction')
        .classed('active', function(d) { return fraction !== undefined && d.id == fraction.id; });
}

function hoverTransition(transition) {
    dom.drawArea.selectAll('.transition')
        .classed('active', function(d) { return transition !== undefined && d.id == transition.id; });

    dom.fractions.selectAll('.fraction')
        .classed('active', function (d) {
            return transition !== undefined && (d.id == transition.from || d.id == transition.to);
        });
}

function hoverDeputat(deputat) {
    dom.fractions.selectAll('.fraction')
        .classed('active', function(d) {
            return deputat !== undefined && deputat.fractionIds.indexOf(d.id) != -1;
        })
        .classed('faded', function(d) {
            if (deputat !== undefined)
                return deputat.fractionIds.indexOf(d.id) == -1;
            else
                if (noSelection)
                    return false
                else
                    return !d3.select(this).classed('selected');
            });

    dom.drawArea.selectAll('.transition')
        .classed('active', function(d) {
            if (deputat === undefined)
                return false;
            var i = deputat.fractionIds.indexOf(d.from);
            return i != -1 && deputat.fractionIds.indexOf(d.to) == i + 1;
        })
        .classed('faded', function(d) {
            if (deputat !== undefined) {
                var i = deputat.fractionIds.indexOf(d.from);
                return i == -1 || deputat.fractionIds.indexOf(d.to) != i + 1;
            }
            else
                if (noSelection)
                    return false;
                else
                    return !d3.select(this).classed('selected');
        });
}

var noSelection = true;
function clearSelection() {
    if (!noSelection) {
        noSelection = true;

        dom.drawArea.selectAll('.selected')
            .classed('selected', false);
        dom.drawArea.selectAll('.faded')
            .classed('faded', false);
        dom.deputies.selectAll('.deputat.hidden')
            .classed('hidden', false);
    }
}

function selectFraction(fraction) {
    noSelection = false;

    dom.fractions.selectAll('.fraction')
        .classed('selected', function(d) { return d.id == fraction.datum().id; })
        .classed('faded', function(d) { return d.id != fraction.datum().id; });

    dom.drawArea.selectAll('.transition')
        .classed('faded', true)
        .classed('selected', false);


    dom.deputies.selectAll('.deputat')
        .classed('hidden', function(d) { return d.fractionIds.indexOf(fraction.datum().id) == -1; });


    setTitle(
        '{0}, {1}&nbsp;{2}'.format(
            fraction.datum()._name,
            d_convocations[fraction.datum().convocationId].number,
            L_CONVO
        )
    );
}

function selectTransition(transition) {
    noSelection = false;

    dom.fractions.selectAll('.fraction')
        .classed('faded', function(d) { return d.id != transition.datum().from && d.id != transition.datum().to; })
        .classed('selected', function(d) { return d.id == transition.datum().from || d.id == transition.datum().to; });

    dom.drawArea.selectAll('.transition')
        .classed('faded', function(d) { return d.id != transition.datum().id; })
        .classed('selected', function(d) { return d.id == transition.datum().id; });

    dom.deputies.selectAll('.deputat')
        .classed('hidden', function(d) {
            var i = d.fractionIds.indexOf(transition.datum().from)
            return i == -1 || d.fractionIds.indexOf(transition.datum().to) != i + 1;
        });


    var title = d_fractions[transition.datum().from].partyId == d_fractions[transition.datum().to].partyId ?
        '{0}, {1}&nbsp;→&nbsp;{2}&nbsp;{3}'.format(
            d_fractions[transition.datum().from]._name,
            d_fractions[transition.datum().from]._convoName,
            d_fractions[transition.datum().to]._convoName,
            L_CONVO
        ) :
        '{0},&nbsp;{1} → {2},&nbsp;{3}'.format(
            d_fractions[transition.datum().from]._name,
            d_fractions[transition.datum().from]._convoName,
            d_fractions[transition.datum().to]._name,
            d_fractions[transition.datum().to]._convoName
        );

    setTitle(
        title,
        '{0} → {1}'.format(d_fractions[transition.datum().from]._convoName, d_fractions[transition.datum().to]._convoName)
    );
}

function selectConvocation(convo) {
    noSelection = false;

    dom.fractions.selectAll('.fraction')
        .classed('selected', function(d) { return d.convocationId == convo.datum().id; })
        .classed('faded', function(d) { return d.convocationId != convo.datum().id; });

    dom.drawArea.selectAll('.transition')
        .classed('faded', true)
        .classed('selected', false);

    dom.deputies.selectAll('.deputat')
        .classed('hidden', function(d) { return d.convocations[convo.datum().id - 1].partyId === undefined; });

    setTitle(
        L_DEP_OF_CONVO.format(convo.datum().number)
    );
}

//=====================


function fractionPosition(fraction) {
    return [
        (LEFT_MARGIN + (d_convocations[fraction.convocationId].id - 1) * CONVO_OFFSET),
        SCALE_Y * (fraction.offset + fraction.order * 3) + TOP_MARGIN
    ]
}


function drawConvocations() {
    var convocations = dom.convocations.selectAll('.convocation').data(a_convocations).enter();

    var groups = convocations.append('g')
        .classed('convocation', true)
        .attr('transform', function(d) { return 'translate({0},{1})'.format(LEFT_MARGIN + (d.id - 1) * CONVO_OFFSET, TOP_MARGIN); });

    var labels = groups.append('g')
        .classed('convocationLabel', true)
        .attr('transform', 'translate(0,-20)')
        .on('mouseover', hoverConvocation)
        .on('mouseout', function(d) { hoverConvocation(); })
        .on('click', function(d) {
            event.stopPropagation();
            selectConvocation(d3.select(this.parentNode));
        });

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

    var transitionsHover = dom.transitionsHover.selectAll('.transition').data(a_transitions_jump.concat(a_transitions_direct)).enter();

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

    function drawHelper(transitions, forHover) {
        var groups = transitions.append('g')
            .classed('transition', true);

        if (forHover !== undefined)
            groups
                .on('mouseover', hoverTransition)
                .on('mouseout', function(d) { hoverTransition(); })
                .on('click', function(d) {
                    event.stopPropagation();
                    selectTransition(d3.select(this));
                });

        var lines1 = groups.filter(function(d) {
            return d_fractions[d.from]._position[1] + d.leftOffset * SCALE_Y == d_fractions[d.to]._position[1] + d.rightOffset * SCALE_Y;
        })

        lines1.append('rect')
            .attr('x', function(d) { return d_fractions[d.from]._position[0] + FRACTION_WIDTH / 2; })
            .attr('y', function(d) { return d_fractions[d.from]._position[1] + d.leftOffset * SCALE_Y; })
            .attr('width', function(d) { return d_fractions[d.to]._position[0] - d_fractions[d.from]._position[0] - FRACTION_WIDTH; })
            .attr('height', function(d) { return d.number * SCALE_Y; })
            .attr('stroke', 'none')
            .attr('fill', function(d) {
                if (forHover === undefined)
                    return 'url(#g{0}-{1})'.format(d.from, d.to);
                else
                    return 'rgba(0, 0, 0, 0)';
            });

        var lines2 = groups.filter(function(d) {
            return d_fractions[d.from]._position[1] + d.leftOffset != d_fractions[d.to]._position[1] + d.rightOffset;
        })

        lines2.append('path')
            .attr('d', function(d) {
                var f1 = d_fractions[d.from],
                    f2 = d_fractions[d.to];
                var result = 'M {0} {1} C {2} {3}, {4} {5}, {6} {7}'.format(
                    f1._position[0] + FRACTION_WIDTH / 2, f1._position[1] + (d.leftOffset + d.number / 2) * SCALE_Y,
                    (f1._position[0] + f2._position[0]) / 2, f1._position[1] + (d.leftOffset + d.number / 2) * SCALE_Y,
                    (f1._position[0] + f2._position[0]) / 2, f2._position[1] + (d.rightOffset + d.number / 2) * SCALE_Y,
                    f2._position[0] - FRACTION_WIDTH / 2, f2._position[1] + (d.rightOffset + d.number / 2) * SCALE_Y
                );

                return result;
            })
            .attr('fill', 'none')
            .attr('stroke', function(d) {
                if (forHover === undefined)
                    return 'url(#g{0}-{1})'.format(d.from, d.to);
                else
                    return 'rgba(0, 0, 0, 0)';
            })
            .attr('stroke-width', function(d) {
                if (forHover === undefined || d.number > 5)
                    return d.number * SCALE_Y;
                else
                    return 6;
            });
    }

    drawHelper(transitionsDirect);
    drawHelper(transitionsJump);
    drawHelper(transitionsHover, true);
}

function drawFractions() {
    var fractions = dom.fractions.selectAll('.fraction').data(a_fractions).enter();
    var fractionsHover = dom.fractionsHover.selectAll('.fraction').data(a_fractions).enter();


    var groups = fractions.append('g')
        .classed('fraction', true)
        .attr('transform', function(d) {
            d._position = fractionPosition(d);
            d._color = d_parties[d.partyId].color;
            d._name = d_parties[d.partyId].name.transliterate();
            d._convoName = d_convocations[d.convocationId].number;
            return 'translate({0},{1})'.format(d._position[0], d._position[1]);
        });

    var hoverGroups = fractionsHover.append('g')
        .classed('fraction', true)
        .attr('transform', function(d) {
            return 'translate({0},{1})'.format(d._position[0], d._position[1]);
        })
        .on('mouseover', hoverFraction)
        .on('mouseout', function() { hoverFraction(); })
        .on('click', function() {
            event.stopPropagation();
            selectFraction(d3.select(this));
        });

    groups.append('rect')
        .attr('x', -FRACTION_WIDTH / 2)
        .attr('y', 0)
        .attr('width', FRACTION_WIDTH)
        .attr('height', function(d) { return d.size * SCALE_Y; })
        .attr('fill', function(d) { return d._color; });

    hoverGroups.append('rect')
        .attr('x', -FRACTION_WIDTH / 2)
        .attr('y', function(d) {
            if (d.size < 5)
                return -(5 - d.size) / 2 * SCALE_Y;
            else
                return 0;
        })
        .attr('width', FRACTION_WIDTH)
        .attr('height', function(d) {
            if (d.size < 5)
                5 * SCALE_Y
            else
                return d.size * SCALE_Y;
        })
        .attr('fill', 'rgba(0, 0, 0, 0)');


    var labels = groups.append('g')
        .classed('fractionLabel', true)
        .attr('transform', function(d) {
            var y = 0;
            var x = d.convocationId == 7 ? -13 : 7;
            var toShift = {
                5713: 10,
                5714: 10,
                5707: 10,
                5729: 10,
                5739: 10,
                7000: 20,
                5726: 15,
                5733: 15,
                7004: -12
            }

            if (toShift[d.id] !== undefined) y = toShift[d.id]

            return 'translate({0}, {1})'.format(x, y + 2);
        })
        .attr('text-anchor', function(d) {
            return d.convocationId == 7 ? 'end' : 'start';
        });

    labels.append('rect')
        .attr('y', 0)
        .attr('height', 16);

    labels.append('text')
        .text(function(d) { return d._name; })
        .attr('x', 3)
        .attr('y', 12);

    labels.each(function(d) {
        var bbox = d3.select(this).select('text').node().getBBox();
        d3.select(this).select('rect').attr('x', bbox.x -3 );
        d3.select(this).select('rect').attr('width', bbox.width + 6);
    })
}

function addDeputies() {
    var deputies = dom.deputies.selectAll('.deputat').data(a_deputies).enter().append('div');

    deputies
        .classed('deputat', true)
        .attr('title', function(d) { return d.name.transliterate(); })
        .on('mouseover', function(d) { hoverDeputat(d); })
        .on('mouseout', function(d) { hoverDeputat(); })
        .on('click', function(d) { event.stopPropagation(); })
        .append('div')
            .classed('deputatName', true)
            .text(function(d) {
                var fio = d.name.split(' ');
                return '{0} {1}.{2}.'.format(fio[0], fio[1][0], fio[2][0]).transliterate();
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
    d3.select(document).on('scroll', function() {
        dom.header.classed('scroll', document.body.scrollTop > 0);
    });
}


function draw(eng) {
    if (eng) {
        ENGLISH = true;

        L_ALL_DEPS = 'All deputies';
        L_CONVO = 'convocation';
        L_DEP_OF_CONVO = 'Deputies, {0} convocation';
        L_PPL = '{0} pers.'
    }

    if (window.innerHeight < 575 + 85 + 25) {
        SCALE_Y = (575 - TOP_MARGIN - (575 + 85 + 25 - window.innerHeight)) / (575 - TOP_MARGIN);
    }

    if (window.innerWidth < 1000 + 210 + 20) {
        CONVO_OFFSET = (1000 - (1000 + 210 + 20 - window.innerWidth) - 2 * LEFT_MARGIN) / 6;
    }

    dom.svg = d3.select('#diagram svg');
    dom.convocations = dom.svg.select('.convocations');
    dom.fractions = dom.svg.select('.fractions');
    dom.transitionsDirect = dom.svg.select('.transitions .direct');
    dom.transitionsJump = dom.svg.select('.transitions .jump');
    dom.defs = dom.svg.select('defs');
    dom.deputies = d3.select('.deputies');
    dom.header = d3.select('#listHeader');
    dom.transitionsHover = d3.select('.hoverTransitions');
    dom.fractionsHover = d3.select('.hoverFractions');
    dom.drawArea = d3.select('svg .drawings');

    drawConvocations();
    drawFractions();
    drawTransitions();
    addDeputies();

    setTitle();

    scrollEvents();

    d3.select(window).on('click', function() {
        clearSelection();
        setTitle();
    });
}
