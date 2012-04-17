///////////////////////////////////////////////////////////////////////
//  QImage
///////////////////////////////////////////////////////////////////////
/**
 * QImage constructor
 * @constructor
 * @augments Kinetic.Shape
 * @param {Object} config
 */
Kinetic.QImage = function(config) {
    // default attrs
    if(this.attrs === undefined) {
        this.attrs = {};
    }
    this.image = config.image;
    this.shapeType = "Image";

    config.drawFunc = function() {
        if(this.image !== undefined) {
            var width = this.attrs.width !== undefined ? this.attrs.width : this.image.width;
            var height = this.attrs.height !== undefined ? this.attrs.height : this.image.height;
            var srcx = this.attrs.srcx !== undefined ? this.attrs.srcx : this.image.srcx;
            var srcy = this.attrs.srcy !== undefined ? this.attrs.srcy : this.image.srcy;
            var srcwidth = this.attrs.srcwidth !== undefined ? this.attrs.srcwidth : this.image.srcwidth;
            var srcheight = this.attrs.srcheight !== undefined ? this.attrs.srcheight : this.image.srcheight;
            var canvas = this.getCanvas();
            var context = this.getContext();
            context.beginPath();
            this.applyLineJoin();
            context.rect(0, 0, width, height);
            context.closePath();
            this.fillStroke();
            context.drawImage(this.image, srcx, srcy, srcwidth, srcheight, 0, 0, width, height);
        }
    };
    // call super constructor
    Kinetic.Shape.apply(this, [config]);
};
/*
 * QImage methods
 */
Kinetic.QImage.prototype = {
    /**
     * set image
     * @param {ImageObject} image
     */
    setImage: function(image) {
        this.image = image;
    },
    /**
     * get image
     */
    getImage: function(image) {
        return this.image;
    },
    /**
     * set width
     * @param {Number} width
     */
    setWidth: function(width) {
        this.width = width;
    },
    /**
     * get width
     */
    getWidth: function() {
        return this.width;
    },
    /**
     * set height
     * @param {Number} height
     */
    setHeight: function(height) {
        this.height = height;
    },
    /**
     * get height
     */
    getHeight: function() {
        return this.height;
    },
    /**
     * set width and height
     * @param {Number} width
     * @param {Number} height
     */
    setSize: function(width, height) {
        this.width = width;
        this.height = height;
    }
};
// extend Shape
Kinetic.GlobalObject.extend(Kinetic.QImage, Kinetic.Shape);
