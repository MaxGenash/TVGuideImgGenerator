/**
 * Created by MaxGenash on 12.02.2017.
 */

const { saveImgOnDics, generateTvGuideImg } = require("./generateTvGuideImg"),
    getTvGuide = require("./getTvGuide"),
    postImgOnVK = require("./postImgOnVK"),
    config = require("./config.json");

(async function({
    vkUsername,
    vkPassword,
    vkGroupId,
    appId,
    appSecret
}) {
    console.log("TV_Gide_Img_Generator started with arguments = ", arguments);

    //TODO перевіряти щоб було передано усі параметри

    //Get TV Guide Data
    try {
        var getTvGuideRes = await getTvGuide();
    } catch (e) {
        //TODO
        console.error("wtf: e =", e);
        return -1;
    }

    //generate image
    var imgCanvas = generateTvGuideImg();

    //Зберігаємо картинку на диск перед відправкою
    // краще було б відправляти напряму з оперативної пам'яті,
    // але я не знайшов як конвертувати тоді картинку у multipart/form-data у відповідності до вимог VK API
    try {
        var savedImgName = await saveImgOnDics(imgCanvas, "TV_guide_img.png");
    } catch (e) {
        //TODO
        console.error("wtf: e =", e);
        return -1;
    }

    //send request to VK API
    let vkResponse = await postImgOnVK({
        postedImg: savedImgName,
        postedGroupId: vkGroupId,
        vkUsername,
        vkPassword,
        appId,
        appSecret
    });

    if(vkResponse.success)
        console.log("\npostImgOnVK returned success: ", vkResponse.success);
    else
        console.error("\npostImgOnVK returned error: ", vkResponse);

    console.log("\nTV_Gide_Img_Generator stop");
}(config));
