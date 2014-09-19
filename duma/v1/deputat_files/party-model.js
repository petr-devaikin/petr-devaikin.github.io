var parties = {}; // фракции партии, депутаты партии

function getOrCreateParty(fraction) {
    if (parties[fraction.Party.Id] === undefined)
        var p = new Party(fraction.Party.Id);
    return parties[fraction.Party.Id];
}

function Party(id) {
    this.id = id;
    parties[this.id] = this;

    this.direct = [];
    this.deputatsIds = [];
    this.bubble = new AnimatedObject(AnimatedObject.PARTY_BUBBLE_TYPE,
        document.getElementById("party-" + id),
        getPartyColor(id));
    this.hint = document.getElementById("party-" + id).getAttribute("title");

    this.tryToAddDeputat = function (id) {
        if (findElementInArray(id, this.deputatsIds) == -1)
            this.deputatsIds.push(id);
    };

    this.addDeputats = function (fractionId, deputats) {
        var fr = fractions[fractionId];
        for (var d in deputats) {
            this.tryToAddDeputat(d);
            fr.tryToAddDeputat(d);
            var deputat = getOrCreateDeputat(deputats[d]);
            deputat.tryToAddPartyAndFraction(this.id, fractionId);
        }
    };
}