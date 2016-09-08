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

    FB.api('/me/likes?limit=50&fields=category,name', function(response) {
        var html = "";
        for (var i in response.data)
            html += response.data[i].name + ' – ' + response.data[i].category + '<br/>';
        document.getElementById('likes').innerHTML = html;
    });
}
