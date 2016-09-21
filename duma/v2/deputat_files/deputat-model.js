var deputats = {}; // фракции и партии депутатов

function getOrCreateDeputat(deputat) {
    if (deputats[deputat.Id] === undefined)
        deputats[deputat.Id] = new Deputat(deputat.Id);
    return deputats[deputat.Id];
}


function Deputat(id) {
    this.id = id;
    this.obj = document.getElementById("deputat-" + id);
    this.parties = [];
    this.fractions = [];

    this.tryToAddParty = function (partyId) {
        if (findElementInArray(partyId, this.parties) == -1)
            this.parties.push(partyId);
    };

    this.tryToAddFraction = function (fractionId) {
        if (findElementInArray(fractionId, this.fractions) == -1) {
            this.fractions.push(fractionId);
            return true;
        }
        else
            return false;
    }

    this.tryToAddPartyAndFraction = function (partyId, fractionId) {
        this.tryToAddParty(partyId);

        if (this.tryToAddFraction(fractionId)) {
            var newDiv = document.createElement('div');
            newDiv.className = "deputat-fraction";
            newDiv.setAttribute("style", "background-color: " + getPartyColor(partyId));
            newDiv.setAttribute("convocation", fractions[fractionId].convocation);
        
            this.obj.appendChild(newDiv);
        }
    };
}