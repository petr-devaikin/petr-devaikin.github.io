function setBubbleOpacity(id, opacity, speed) {
    bigTimer.addObject(parties[id].bubble, opacity, speed);
}

function setFractionOpacity(id, opacity, speed) {
    bigTimer.addObject(fractions[id].obj, opacity, speed);
}

function setStopOpacity(node, opacity, speed) {
    bigTimer.addObject(node, opacity, speed);
}

// complicated setters

function setOpacityOfConnections(fractionId, opacity, speed, justToFractions) {
    for (var g in fractions[fractionId].connections.toTheLeft) {
        if (justToFractions === undefined || findElementInArray(parseInt(g), justToFractions) != -1) {
            setStopOpacity(fractions[fractionId].connections.toTheLeft[g].rightObj, opacity, speed);
        }
    }
    for (var g in fractions[fractionId].connections.toTheRight) {
        if (justToFractions === undefined || findElementInArray(parseInt(g), justToFractions) != -1) {
            setStopOpacity(fractions[fractionId].connections.toTheRight[g].leftObj, opacity, speed);
        }
    }
}

function showPersonConnections(fractionId, justToFractions) {
    for (var g in fractions[fractionId].connections.toTheLeft) {
        if (justToFractions === undefined || findElementInArray(parseInt(g), justToFractions) != -1) {
            fractions[fractionId].connections.toTheLeft[g].personPath.show();
            fractions[fractionId].connections.toTheLeft[g].personPath.toFront();
        }
    }
    for (var g in fractions[fractionId].connections.toTheRight) {
        if (justToFractions === undefined || findElementInArray(parseInt(g), justToFractions) != -1) {
            fractions[fractionId].connections.toTheRight[g].personPath.show();
            fractions[fractionId].connections.toTheRight[g].personPath.toFront();
        }
    }
}

function hidePersonConnections(fractionId, justToFractions) {
    for (var g in fractions[fractionId].connections.toTheLeft) {
        if (justToFractions === undefined || findElementInArray(parseInt(g), justToFractions) != -1) {
            fractions[fractionId].connections.toTheLeft[g].personPath.hide();
        }
    }
    for (var g in fractions[fractionId].connections.toTheRight) {
        if (justToFractions === undefined || findElementInArray(parseInt(g), justToFractions) != -1) {
            fractions[fractionId].connections.toTheRight[g].personPath.hide();
        }
    }
}

function connectionsToFront(fractionId, justToFractions) {
    for (var g in fractions[fractionId].connections.toTheLeft) {
        if (justToFractions === undefined || findElementInArray(parseInt(g), justToFractions) != -1)
            fractions[fractionId].connections.toTheLeft[g].path.toFront();
    }
    for (var g in fractions[fractionId].connections.toTheRight) {
        if (justToFractions === undefined || findElementInArray(parseInt(g), justToFractions) != -1)
            fractions[fractionId].connections.toTheRight[g].path.toFront();
    }
}

function connectionsToBack(fractionId, justToFractions) {
    for (var g in fractions[fractionId].connections.toTheLeft) {
        if (justToFractions === undefined || findElementInArray(parseInt(g), justToFractions) != -1)
            fractions[fractionId].connections.toTheLeft[g].path.toBack();
    }
    for (var g in fractions[fractionId].connections.toTheRight) {
        if (justToFractions === undefined || findElementInArray(parseInt(g), justToFractions) != -1)
            fractions[fractionId].connections.toTheRight[g].path.toBack();
    }
}


// fractions

function fractionToTop(id) {
    fractions[id].obj.obj.toFront();
}

function showFraction(id) {
    setFractionOpacity(id, shownOpacity, showAnimationTime);
    setOpacityOfConnections(id, shownOpacity, showAnimationTime);
    connectionsToFront(id);
    fractionToTop(id);
}

function hideFraction(id) {
    setFractionOpacity(id, hiddenOpacity, hideAnimationTime);
    setOpacityOfConnections(id, hiddenOpacity, hideAnimationTime);
}

// parties

function showParty(id) {
    for (var f in parties[id].direct)
        showFraction(parties[id].direct[f], showAnimationTime);
}

function hideParty(id) {
    for (var f in parties[id].direct)
        hideFraction(parties[id].direct[f], hideAnimationTime);

}

// party bubbles

function showPartyBubble(id) {
    setBubbleOpacity(id, shownOpacity, showAnimationTime);
}

function mutePartyBubble(id) {
    setBubbleOpacity(id, mutedOpacity, showAnimationTime);
}

function hidePartyBubble(id) {
    setBubbleOpacity(id, hiddenOpacity, hideAnimationTime);
}

// connections

function showConnection(id) {
    var connection = connections[id];

    setFractionOpacity(connection.startFraction.id, shownOpacity, showAnimationTime);
    setFractionOpacity(connection.finishFraction.id, shownOpacity, showAnimationTime);
    setStopOpacity(connection.leftObj, shownOpacity, showAnimationTime);
    setStopOpacity(connection.rightObj, shownOpacity, showAnimationTime);

    connection.path.toFront();
    fractionToTop(connection.startFraction.id);
    fractionToTop(connection.finishFraction.id);
}



// deputats

function showDeputatWay(id) {
    var deputat = deputats[id];

    for (var p in deputat.parties) {
        mutePartyBubble(deputat.parties[p]);
    }

    for (var f in deputat.fractions) {
        var id = deputat.fractions[f];
        setFractionOpacity(id, shownOpacity, showAnimationTime);
        showPersonConnections(id, deputat.fractions);
        fractionToTop(id);
    }
}

function hideDeputatWay(id) {
    var deputat = deputats[id];
    for (var f in deputat.fractions) {
        var id = deputat.fractions[f];
        setFractionOpacity(id, hiddenOpacity, hideAnimationTime);
        hidePersonConnections(id, deputat.fractions);
    }
}