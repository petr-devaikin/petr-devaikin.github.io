
var activeDevice = 'mac',
    activePage = 0;


var RATIOS = {
    'mac': { width: 0.725, top: 0.0586, bottom: 0.074 },
    'ipad': { width: 0.60546875, top: 0.0595703125, bottom: 0.0595703125 },
    'iphone': { width: 0.224, top: 0.07421875, bottom: 0.080078125 },
}

var MAX_FRAME_WIDTH = 800;

$(function() {
    $('.content').css('position', 'fixed')
        .css('left', 0)
        .css('right', 0);
    var expander = $('<div></div>').addClass('page-expander');
    $('.content').before(expander);

    setActiveDevice();
    setActivePage();

    $(window).resize(function() {
        setScreenSize();
        setContentPosition();
    });

    $(window).scroll(function() {
        setContentPosition();
    })

    $('.project__screens__menu--bottom .project__screens__menu__item').click(function() {
        setActiveDevice($(this).attr('for'));
        return false;
    });

    $('.project__screens__menu--top .project__screens__menu__item').click(function() {
        setActivePage($(this).attr('for'));
        return false;
    });

    var pics = [
        '0_mac.jpg', '1_mac.jpg', '2_mac.jpg',
        '0_ipad.jpg', '1_ipad.jpg', '2_ipad.jpg',
        '0_iphone.jpg', '1_iphone.jpg', '2_iphone.jpg',
    ];
    for (var i = 0; i < pics.length; i++) {
        var pic = new Image();
        pic.src = pics[i];
    }
});


function setScreenSize() {
    var expander = $('.page-expander');
    expander.css('height', 0);

    var screenTop = $('.project__screens').offset().top;
    var windowHeight = $(window).innerHeight();

    //var windowScroll = $(window).scrollTop();
    var screenTopMenuHeight = $('.project__screens__menu--top').outerHeight();
    var screenBottomMenuHeight = $('.project__screens__menu--bottom').outerHeight();

    var availableWidth = $('.project').innerWidth() - 75; // !!!
    var availableHeight = windowHeight - screenTop - screenTopMenuHeight - screenBottomMenuHeight;

    var frameWidth = (availableWidth > MAX_FRAME_WIDTH) ? MAX_FRAME_WIDTH : availableWidth;
    var frameHeight = frameWidth / 2048 * 1136;

    //var topShift = 0;
    if (frameHeight > availableHeight) {
        //topShift = (frameHeight - availableHeight) / 2;
        frameHeight = availableHeight;
        frameWidth = frameHeight * 2048 / 1136;
    }

    $('.project__screens__frame').css('height', frameHeight);

    var imageWidth = frameWidth * RATIOS[activeDevice].width;
    var imageHeight = frameHeight - frameWidth * (RATIOS[activeDevice].bottom + RATIOS[activeDevice].top);

    var image = $('.project__screens__frame__content');

    var imgSrc = activePage + "_" + activeDevice + ".jpg";
    var img = new Image();
    img.onload = function() {
        var height = windowHeight + this.height * imageWidth / this.width - imageHeight;
        expander.css('height', height);
    }
    img.src= imgSrc;

    image.css('background-image', "url('" + imgSrc + "')");
    image.css('margin-left', -frameWidth * RATIOS[activeDevice].width / 2);
    image.css('width', imageWidth);
    image.css('top', frameWidth * RATIOS[activeDevice].top);
    image.css('height', imageHeight);
}


function setContentPosition() {
    var windowPosition = $(window).scrollTop();
    $('.project__screens__frame__content').css('background-position', 'center -' + windowPosition + 'px');
}


function setActiveDevice(deviceName) {
    $('.project__screens__frame__device--' + activeDevice).hide();
    $('.project__screens__frame__content__img[device=' + activeDevice + '][page=' + activePage + ']').hide();

    if (deviceName !== undefined)
        activeDevice = deviceName;

    $('.project__screens__menu--bottom .project__screens__menu__item--active').removeClass('project__screens__menu__item--active');
    $('.project__screens__menu--bottom .project__screens__menu__item[for=' + activeDevice + ']').addClass('project__screens__menu__item--active');

    var device = $('.project__screens__frame__device--' + activeDevice);

    device.show();
    $('.project__screens__frame__content__img[device=' + activeDevice + '][page=' + activePage + ']').css('display', 'block');

    setScreenSize();
}


function setActivePage(pageNumber) {
    $('.project__screens__frame__content__img[device=' + activeDevice + '][page=' + activePage + ']').hide();

    if (pageNumber !== undefined)
        activePage = pageNumber;

    $('.project__screens__menu--top .project__screens__menu__item--active').removeClass('project__screens__menu__item--active');
    $('.project__screens__menu--top .project__screens__menu__item[for=' + activePage + ']').addClass('project__screens__menu__item--active');

    $('.project__screens__frame__content__img[device=' + activeDevice + '][page=' + activePage + ']').css('display', 'block');

    setScreenSize();
}

