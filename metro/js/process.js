function findStation(lineNumber, name) {
    var filtered = coords.filter(function(el) { return el[0] == lineNumber && el[1] == name; });
    return filtered.length > 0 ? filtered[0] : undefined;
}

function processStations() {
    for (var i = 0; i < coords.length; i++) {
        coords[i].year = parseInt(coords[i][2].split(' ')[2]);
        coords[i].position = toPixelPosition(coords[i][4], coords[i][5]);
    }
    coords.sort(function(a, b) { return b.year - a.year; });
}

function getLines() {
    var result = [];
    for (var i = 0; i < lines.length; i++) {
        var connections = [];
        for (var p = 0; p < lines[i].stations.length; p++) {
            var stationGroup = lines[i].stations[p];
            for (var j = 1; j < stationGroup.length; j++) {
                var connection = {
                    start: findStation(lines[i].number, stationGroup[j - 1]),
                    stop: findStation(lines[i].number, stationGroup[j]),
                };
                connection.year = Math.max(connection.start.year, connection.stop.year);
                if (j > 1 && connections[connections.length - 1].start.year < connection.start.year &&
                             connection.stop.year < connection.start.year) {
                    var anotherConnection = {
                        start: connections[connections.length - 1].start,
                        stop: connection.stop,
                        until: connection.start.year - 1,
                    };
                    anotherConnection.year = Math.max(anotherConnection.start.year, anotherConnection.stop.year);
                    connections.push(anotherConnection);
                }
                connections.push(connection);
            }
        }
        result.push({
            line: lines[i],
            connections: connections,
        });
    } 
    return result;
}

function getPeriod() {
    var result = [];
    for (var i = 0; i < coords.length; i++) {
        if (result.indexOf(coords[i].year) == -1)
            result.push(coords[i].year);
    }
    return result.sort();
}