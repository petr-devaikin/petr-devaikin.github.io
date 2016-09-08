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
    FB.api('/me?fields=name,email,hometown,location', function(response) {
        console.log('Successful login for: ' + response.name);
        document.getElementById('status').innerHTML = 'Hi ' + response.name + '!';

        document.getElementById('email').innerHTML = response.email;
        document.getElementById('location').innerHTML = 'Current location: ' + response.location.name;
        document.getElementById('hometown').innerHTML = 'From: ' + response.hometown.name;
    });
}
