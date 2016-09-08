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

    FB.api('/me/events?limit=50', function(response) {
        var html = "";
        for (var i in response.data)
            html += response.data[i].start_time.substr(0, 10) + ' – ' + response.data[i].name + '<br/>';
        document.getElementById('events').innerHTML = html;
    });
}
