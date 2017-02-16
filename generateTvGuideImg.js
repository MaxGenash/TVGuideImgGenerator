/**
 * Created by MaxGenash on 12.02.2017.
 */

const Canvas = require('canvas'),
    moment = require('moment'),
    _ = require('lodash'),
    fs = require('fs');

/**
 * Зберігає пеердане Canvas зображення у файл
 * @param {Canvas} imgCanvas - Canvas із зображенням яке треба зберегти
 * @param {String} imgName - назва картинки із якою треба зберегти зображення
 * @returns {String} - назва картинки яку зберегли
 * @returns {Promise.<String>} - назва збереженої картинки
 */
function saveImgOnDics(imgCanvas, imgName) {
    console.log("\nCalled saveImgOnDics with arguments", arguments);

    return new Promise((resolve, reject) => {
        let out = fs.createWriteStream(__dirname + "/" + imgName),
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

/**
 * Генерує картинку із телепрограмою що відповідає переданому tvGuideData
 * @param {Object} tvGuideData - дані про телепрограму
 * @returns {Canvas} - Canvas із згенерованою картинкою
 */
function generateTvGuideImg (tvGuideData) {
    console.log("\nCalled generateTvGuideImg with arguments", arguments);

    let imgH = 800, //для початку будь-які значення щоб створити канвас для виміру розмірів тексту
        imgW = 600,
        imgHeadline = `Телепрограма каналу «1+1» на ${moment(tvGuideData.date).format('DD.MM.YYYY')}`,
        maxTitleWidth = 200,    //обмеження у 200 символів на випадок якщо назва буде занадто довга
        programsList = tvGuideData.programs.map((el, i) => {
            if(!moment(el.realtime_begin).isValid())
                throw new Error(`Invalid date stamp = "${el.realtime_begin}" of tvGuideData.programs[${i}].realtime_begin`);
            if(!el.title)
                throw new Error(`Invalid value = "${el.title}" of tvGuideData.programs[${i}].title`);

            //el.realtime_begin*1000 - множимо на 1000 бо там переається час в секундах, а не в мілісекундах
            let startTime = moment(el.realtime_begin*1000).format('HH:mm'),
                truncatedSubtitle = _.truncate(el.subtitle, {'length': maxTitleWidth}),
                truncatedTitle = _.truncate(el.title, {'length': maxTitleWidth}),
                subtitlePerformed = el.subtitle ? "(" + truncatedSubtitle + ")" : "";

            return {
                timeText: startTime,
                titleText: " - " + truncatedTitle + subtitlePerformed
            }
        }),
        canvas = new Canvas(imgH, imgW),
        ctx = canvas.getContext("2d");

    //Міряємо розміри картинки
    ctx.font = '30px Comic Sans';
    let headlineW = ctx.measureText(imgHeadline).width;
    ctx.font = '18px Latto';
    let programsListW = Math.max(...programsList.map(el => ctx.measureText(el.timeText + el.titleText).width) );

    let imgPadding = 20,
        prListTextLineH = 30,
        headlineH = 30,
        headlineMarginBottom = 15;
    imgW = imgPadding*2 + Math.max(programsListW, headlineW);
    imgH = imgPadding*2 + headlineH + headlineMarginBottom + prListTextLineH*programsList.length;

    //Створюємо Canvas необхідних розмірів
    canvas = new Canvas(imgW, imgH);
    ctx = canvas.getContext("2d");

    //Заповнюємо картинку текстом
    ctx.textBaseline="top";
    ctx.font = '30px Comic Sans';
    ctx.fillText(imgHeadline, imgPadding, imgPadding);
    programsList.forEach((el, i) => {
        ctx.font = 'bold 18px Roboto';
        ctx.fillText(
            el.timeText,
            imgPadding+10,
            headlineH + headlineMarginBottom + imgPadding + i*prListTextLineH
        );
        ctx.font = 'italic 18px Roboto';
        ctx.fillText(
            el.titleText,
            imgPadding+10 + ctx.measureText(el.timeText).width,
            headlineH + headlineMarginBottom + imgPadding + i*prListTextLineH
        );
    });

    console.log("\nImg is generated.");
    return canvas;
}

module.exports = {
    generateTvGuideImg,
    saveImgOnDics
};