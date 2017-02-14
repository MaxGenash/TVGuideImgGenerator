/**
 * Created by MaxGenash on 12.02.2017.
 */

const Canvas = require('canvas'),
    fs = require('fs');

function saveImgOnDics(imgCanvas, imgName) {
    return new Promise((resolve, reject) => {
        var out = fs.createWriteStream(__dirname + "/" + imgName),
            stream = imgCanvas.pngStream();

        stream.on('data', function(chunk){
            out.write(chunk);
        });

        stream.on('end', function() {
            console.log(`\nSaved img ${imgName} on dics`);
            resolve(imgName);
        });
    });
}

function generateTvGuideImg (options) {
    var canvas = new Canvas(200, 200);
    var ctx = canvas.getContext("2d");

    ctx.font = '30px Impact';
    ctx.rotate(.1);
    ctx.fillText("Awesome!", 50, 100);

    var te = ctx.measureText('Awesome!');
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.lineTo(50, 102);
    ctx.lineTo(50 + te.width, 102);
    ctx.stroke();

    return canvas;
}

module.exports = {
    generateTvGuideImg,
    saveImgOnDics
};