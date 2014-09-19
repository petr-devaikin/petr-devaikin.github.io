function widthPadding() {
    return (width - drawingWidth) / 2;
}

function getConvocationX(id) {
    var delta = (drawingWidth - partyWidth) / (Object.keys(convocations).length - 1);
    var x = widthPadding();
    return x + delta * (id);
}

function drawLine(R, a, b) {
    return R.path("M" + a[0] + " " + a[1] + "L" + b[0] + " " + b[1]);
}

function drawConnection(R, a, b, height, title) {
    var offset = height / 2.0;
    var start = [a[0], a[1] + offset];
    var end = [b[0], b[1] + offset];
    var centre = [(start[0] + end[0]) / 2.0, (start[1] + end[1]) / 2.0];

    var w = end[0] - start[0];
    var h = Math.abs(end[1] - start[1]);

    var d = w / 2.0 * (0.15 + 0.4 * h / Math.sqrt(w * w + h * h));

    var path = R.path("M " + start[0] + "," + start[1] +
        "Q " + (start[0] + d) + "," + start[1] + "," + centre[0] + "," + centre[1] +
        "Q " + (end[0] - d) + "," + end[1] + "," + end[0] + "," + end[1]);

    path.attr({
        title: title,
        cursor: "pointer"
    });

    return path;
}

function drawFraction(R, coords, height, color, name) {
    var rect = R.rect(coords[0] - 1, coords[1], partyWidth + 2, height);
    rect.attr({
        "stroke-width": 0, fill: color,
        title: name,
        cursor: "pointer"
    });
    return rect;
}

function getPartyColor(id) {
    if (partyColors[id] !== undefined)
        return partyColors[id].color;
    var red = (100 + id * 47) % 255;
    var green = (0 + id * 113) % 255;
    var blue = (255 - id * 9) % 155;
    return "rgb(" + red + "," + green + "," + blue + ")";
}

function getGradientParams(color1, color2) {
    return [{
        "id": "s1",
        "style": "stop-color:" + color1 + ";stop-opacity:" + shownOpacity
    },
    {
        "id": "s2",
        "offset": "100%",
        "style": "stop-color:" + color2 + ";stop-opacity:" + shownOpacity
    }];
}

//

function draw() {
    var R = Raphael(canvasId);

    var back = R.rect(0, 0, width, height).attr({
        fill: "white",
        "stroke-width": 0
    });
    back.click(function () {
        showAllDeputats();
        deselectObject();
    });

    drawConvocations(R);
    drawWork(R);
}

function drawConvocations(R) {
    for (var c in convocations) {
        var t = R.text(getConvocationX(c), convLabelsTop, convocations[c].Name);
        t.attr(convocationTextStyle);
        t.attr({
            title: convocationNames[c] + " созыв, " + convocations[c].DeputatsCount + " деп.",
            cursor: "pointer"
        });

        t.click(
            function (convocationId) {
                return function () {
                    selectConvocation(convocationId);
                }
            }(c));
    }
}

function drawWork(R) {
    for (var c = 0; c < convocationsCount; c++) {
        var conv = convocations[c];
        
        for (var f in conv.Fractions) {
            addFraction(conv.Fractions[f], c);
        }

        for (var f in conv.Fractions) {
            fractions[conv.Fractions[f].Id].calcCoordinates();
            fractions[conv.Fractions[f].Id].draw(R);
        }

        if (c > 0)
            for (var f in conv.Fractions) {
                var fraction = conv.Fractions[f];
                var fr = fractions[fraction.Id];
                for (var k in fraction.ConnectionToPrevFractionsCount) {
                    var con = fraction.ConnectionToPrevFractionsCount[k];

                    var prevFr = fractions[con.FractionRealId];

                    var connection = new Connection(prevFr, fr, con.Deputats);
                    connection.draw(R);

                    fr.addConnectionToTheLeft(prevFr.id, connection);
                    prevFr.addConnectionToTheRight(fr.id, connection);
                }
            }
    }
}