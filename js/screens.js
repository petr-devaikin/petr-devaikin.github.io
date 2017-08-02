
var activeDevice = 'mac',
    activePage = 0;


var RATIOS = {
    'mac': { width: 0.725, top: 0.0586, bottom: 0.074 },
    'ipad': { width: 0.60546875, top: 0.0595703125, bottom: 0.0595703125 },
    'iphone': { width: 0.224, top: 0.07421875, bottom: 0.080078125 },
}

var MAX_FRAME_WIDTH = 800;

$(function() {
    setActiveDevice();
    setActivePage();

    $(window).resize(function() {
        setScreenSize();
        screenFloat();
    });

    $(window).scroll(function() {
        screenFloat();
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
        pic.onload = function() {
            console.log(this.src);
        }
        pic.src = pics[i];
    }
});


function setScreenSize() {
    $('.content').css('position', 'fixed')
        .css('left', 0)
        .css('right', 0);

    $('.project-container__foreground').attr('style', '');

    var screenTop = $('.project__screens').offset().top;
    var windowHeight = $(window).innerHeight();

    //var windowScroll = $(window).scrollTop();
    var screenTopMenuHeight = $('.project__screens__menu--top').outerHeight();
    var screenBottomMenuHeight = $('.project__screens__menu--bottom').outerHeight();

    var availableWidth = $('.project').innerWidth() - 75; // !!!
    var availableHeight = windowHeight - screenTop - screenTopMenuHeight - screenBottomMenuHeight;

    var frameWidth = (availableWidth > MAX_FRAME_WIDTH) ? MAX_FRAME_WIDTH : availableWidth;
    var frameHeight = frameWidth / 2048 * 1136;

    var topShift = 0;
    if (frameHeight > availableHeight) {
        frameHeight = availableHeight;
        topShift = (availableHeight - frameHeight) / 2;
    }

    $('.project__screens__frame').css('height', frameHeight);

    var image = $('.project__screens__frame__content');
    image.css('background-image', "url('" + activePage + "_" + activeDevice + ".jpg')");
    image.css('margin-left', -frameWidth * RATIOS[activeDevice].width / 2);
    image.css('width', frameWidth * RATIOS[activeDevice].width);
    image.css('top', frameWidth * RATIOS[activeDevice].top + topShift);
    image.css('height', frameHeight - frameWidth * (RATIOS[activeDevice].bottom + RATIOS[activeDevice].top));
}


function screenFloat() {
    /*
    if (isFullScreen)
        return;

    var windowPosition = $(window).scrollTop();
    var windowHeight = $(window).innerHeight();

    var foregroundheight = $('.project-container__foreground').height();

    if (foregroundheight < windowPosition + windowHeight)
        $('.project-container__foreground')
            .css('position', 'fixed')
            .css('bottom', 0);
    else
        $('.project-container__foreground')
            .css('position', 'absolute')
            .css('bottom', '');
    */
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

