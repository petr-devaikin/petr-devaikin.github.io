function getOpacityColor(color, opacity) {
    return Raphael.rgb(255 - (255 - color.r) * opacity,
        255 - (255 - color.g) * opacity,
        255 - (255 - color.b) * opacity)
}

function AnimatedObject(type, obj, color) {
    this.aoId = AnimatedObject.prototype.idsCounter++;

    this.type = type;
    this.obj = obj;
    this.color = Raphael.getRGB(color);

    this.currentOpacity = 1;

    this.finalOpacity;
    this.speed;


    this.setOpacity = function (opacity) {
        this.currentOpacity = opacity;

        if (this.type == AnimatedObject.FRACTION_TYPE) {
            this.obj.attr({ "fill": getOpacityColor(this.color, opacity) });
        }
        else if (this.type == AnimatedObject.PARTY_BUBBLE_TYPE) {
            obj.setAttribute("style", "background-color: " + getOpacityColor(this.color, opacity) +
                "; border-color: " + getOpacityColor(this.color, opacity));
        }
        else if (this.type == AnimatedObject.CONNECTION_END_TYPE) {
            var style = "stop-color: " + getOpacityColor(this.color, opacity);
            this.obj.setAttribute("style", style);
        }
        return this;
    }
}

AnimatedObject.FRACTION_TYPE = 1;
AnimatedObject.CONNECTION_END_TYPE = 2;
AnimatedObject.PARTY_BUBBLE_TYPE = 3;

AnimatedObject.prototype.idsCounter = 0;