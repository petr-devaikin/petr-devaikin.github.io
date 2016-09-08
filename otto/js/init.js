function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    if (response.status === 'connected') {
        connected();
    } else if (response.status === 'not_authorized') {
        notConnected();
    } else {
        notConnected();
    }
}

function checkLoginState() {
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
}

function logout() {
    FB.logout(function() {
        location.reload();
    })
}

window.fbAsyncInit = function() {
    FB.init({
        appId      : '635381786639439',
        cookie     : true,
        xfbml      : true,
        version    : 'v2.7'
    });

    checkLoginState();
};


(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
