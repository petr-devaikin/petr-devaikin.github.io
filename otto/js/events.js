function connected() {
    testAPI();
}

function notConnected() {
    window.location = 'login.html';
}

//==================

var events = [];

function testAPI() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
        console.log('Successful login for: ' + response.name);
        document.getElementById('status').innerHTML =
            'Hi ' + response.name + '!';
    });

    FB.api('/me/events?limit=50&fields=name,start_time,category,place', function(response) {
        var html = "";
        for (var i in response.data)
            if (new Date(response.data[i].start_time) > new Date())
                html += '<div class="event">' +
                    response.data[i].name +
                    '<div class="eventDate">' + response.data[i].start_time.substr(0, 10) + '</div>' +
                    '<div class="eventPlace">At ' + response.data[i].place.name + '</div>' +
                    '</div>';
        document.getElementById('events').innerHTML = html;
    });
}
