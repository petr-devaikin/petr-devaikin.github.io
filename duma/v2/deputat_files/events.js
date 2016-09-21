var selectedObject = undefined;
var prevSelectedObject = undefined;
var selectedType = undefined;
var prevSelectedType = undefined;

function deselectObject(withoutTitle) {
    if (selectedType == "fraction")
        deselectFraction(selectedObject);
    else if (selectedType == "party")
        deselectParty(selectedObject);
    else if (selectedType == "connection")
        deselectConnection(selectedObject);
    else if (selectedType == "deputat")
        deselectDeputat(selectedObject);
    else if (selectedType == "convocation")
        deselectConvocation(selectedObject);

    selectedObject = undefined;
    selectedType = undefined;

    if (withoutTitle != true)
        showAllDeputatsTitle();
}

function selectFraction(id) {
    if (selectedType == "fraction" && selectedObject.id == id) {
        showAllDeputats();
        deselectObject();
    }
    else {
        deselectObject();

        showDeputatsOfFraction(id);
        var fraction = fractions[id];
        selectedType = "fraction";
        selectedObject = fraction;

        showFraction(id);

        for (var i in fractions)
            if (i != id)
                hideFraction(i);

        for (var i in parties)
            if (i != fraction.partyId)
                hidePartyBubble(i);
            else
                mutePartyBubble(i);

        showCustomDeputatsTitle(fraction.hint);
    }
}

function deselectFraction(obj) {
    for (var i in fractions)
        if (i != obj.id)
            showFraction(i);

    for (var i in parties)
        showPartyBubble(i);
}

function selectParty(id) {
    if (selectedType == "party" && selectedObject.id == id) {
        showAllDeputats();
        deselectObject();
    }
    else {
        deselectObject();

        showDeputatsOfParty(id);
        var party = parties[id];
        selectedType = "party";
        selectedObject = party;

        showParty(id);
        showPartyBubble(id);

        for (var i in parties)
            if (i != id) {
                hideParty(i);
                hidePartyBubble(i);
            }

        showCustomDeputatsTitle(party.hint);
    }
}

function deselectParty(obj) {
    for (var i in parties)
        if (i != obj.id) {
            showParty(i);
            showPartyBubble(i);
        }
}

function selectConnection(id) {
    if (selectedType == "connection" && selectedObject.id == id) {
        showAllDeputats();
        deselectObject();
    }
    else {
        deselectObject();

        showDeputatsOfConnection(id);
        var connection = connections[id];
        selectedType = "connection";
        selectedObject = connection;

        for (var i in fractions)
            if (i != id)
                hideFraction(i);

        showConnection(id);

        for (var i in parties)
            if (i != connection.startFraction.partyId && i != connection.finishFraction.partyId)
                hidePartyBubble(i);
            else
                mutePartyBubble(i);

        showCustomDeputatsTitle(connection.hint);
    }
}

function deselectConnection(obj) {
    for (var i in fractions)
        showFraction(i);

    for (var i in parties)
        showPartyBubble(i);
}

function selectDeputat(id) {
    if (selectedType == "deputat" && selectedObject.id == id) {
        deselectObject();

        if (prevSelectedType == "party")
            selectParty(prevSelectedObject.id);
        else if (prevSelectedType == "fraction")
            selectFraction(prevSelectedObject.id);
        else if (prevSelectedType == "connection")
            selectConnection(prevSelectedObject.id);
        else if (prevSelectedType == "convocation")
            selectConvocation(prevSelectedObject.Id - 1); // ooops
    }
    else {
        if (selectedType != "deputat") {
            prevSelectedObject = selectedObject;
            prevSelectedType = selectedType;
        }

        deselectObject(true);

        var deputat = deputats[id];
        selectedType = "deputat";
        selectedObject = deputat;

        for (var i in parties)
            hideParty(i);
        showDeputatWay(id);
        deputat.obj.classList.add("selected");

        for (var i in parties)
            hidePartyBubble(i);
        for (var i in deputat.parties)
            mutePartyBubble(deputat.parties[i]);
    }
}

function deselectDeputat(obj) {
    obj.obj.classList.remove("selected");
    hideDeputatWay(obj.id);

    for (var i in parties) {
        showPartyBubble(i);
        showParty(i);
    }
}

function selectConvocation(id) {
    if (selectedType == "convocation" && selectedObject.Id - 1 == id) { // ooops
        showAllDeputats();
        deselectObject();
    }
    else {
        deselectObject();

        var conv = convocations[id];
        selectedType = "convocation";
        selectedObject = conv;

        for (var i in fractions)
            hideFraction(i);

        for (var i in parties)
            hidePartyBubble(i);

        for (var f in conv.Fractions) {
            showFraction(conv.Fractions[f].Id);
            showDeputatsOfFraction(conv.Fractions[f].Id);
            mutePartyBubble(conv.Fractions[f].Party.Id);
        }

        showCustomDeputatsTitle(convocationNames[id] + " созыв, " + convocations[id].DeputatsCount + " деп.");
    }
}

function deselectConvocation(obj) {
    for (var i in fractions)
        showFraction(i);

    for (var i in parties)
        showPartyBubble(i);
}

// bindings

// party bubbles

function bindPartiesBubblesEvents() {
    var partiesBubbles = document.getElementsByClassName("party");
    for (var i = 0; i < partiesBubbles.length; i++) {
        partiesBubbles[i].onclick = function (id) {
            return function () { selectParty(id); };
        }(parseInt(partiesBubbles[i].getAttribute("party-id")));
    }
}

// deputats

function bindDeputatsEvents() {
    var dep = document.getElementsByClassName("deputat");
    for (var i = 0; i < dep.length; i++) {
        dep[i].onclick = function (id) {
            return function () { selectDeputat(id); };
        }(parseInt(dep[i].getAttribute("deputat-id")));
    }
}

// fraction

function bindClickToFraction(rect, fractionId) {
    rect.click(
        function (fractionId) {
            return function () {
                selectFraction(fractionId);
            }
        }(fractionId));
}

// connection

function bindClickToConnection(path, id) {
    path.click(
        function (id) {
            return function (e) {
                selectConnection(id);
            }
        }(id));
}