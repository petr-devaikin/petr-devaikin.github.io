function hideAllDeputats(id) {
    var deps = document.getElementsByClassName("deputat");
    var elements = [];
    
    for (var i = 0; i < deps.length; i++)
        elements.push(deps[i]);

    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.add("hidden");
        elements[i].classList.remove("shown");
    }
}

function showAllDeputats() {
    var deps = document.getElementsByClassName("deputat hidden");
    var elements = [];

    for (var i = 0; i < deps.length; i++)
        elements.push(deps[i]);

    for (var i = 0; i < elements.length; i++) {
        elements[i].classList.remove("hidden");
        elements[i].classList.add("shown");
    }

    markFirstLetterOfDeputat();
}

function showDeputatsOfFraction(id) {
    hideAllDeputats();
    for (var d in fractions[id].deputatsIds) {
        var did = fractions[id].deputatsIds[d];
        deputats[did].obj.classList.remove("hidden");
        deputats[did].obj.classList.add("shown");
    }

    markFirstLetterOfDeputat();
}

function showDeputatsOfParty(id) {
    hideAllDeputats();
    for (var d in parties[id].deputatsIds) {
        var did = parties[id].deputatsIds[d];
        deputats[did].obj.classList.remove("hidden");
        deputats[did].obj.classList.add("shown");
    }

    markFirstLetterOfDeputat();
}

function showDeputatsOfConnection(id) {
    hideAllDeputats();
    for (var d in connections[id].deputatsIds) {
        var did = connections[id].deputatsIds[d];
        deputats[did].obj.classList.remove("hidden");
        deputats[did].obj.classList.add("shown");
    }

    markFirstLetterOfDeputat();
}

function showCustomDeputatsTitle(title) {
    var customSpan = document.getElementById("custom-deputats");
    customSpan.innerHTML = title;
    document.getElementById("all-deputats").style.display = "none";
    customSpan.style.display = "inline";
}

function showAllDeputatsTitle() {
    document.getElementById("all-deputats").style.display = "inline";
    document.getElementById("custom-deputats").style.display = "none";
}


function markFirstLetterOfDeputat() {
    var deputats = document.getElementsByClassName("first-deputat");
    var toRemove = [];
    for (var i = 0; i < deputats.length; i++)
        toRemove.push(deputats[i]);
    for (var i = 0; i < toRemove.length; i++)
        toRemove[i].classList.remove("first-deputat");

    var groups = document.getElementsByClassName("letter-group");
    for (var i = 0; i < groups.length; i++) {
        var shown = groups[i].getElementsByClassName("shown");
        if (shown.length > 0)
            shown[0].classList.add("first-deputat");
    }
}