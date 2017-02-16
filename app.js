/**
 * Created by MaxGenash on 12.02.2017.
 */

const { saveImgOnDics, generateTvGuideImg } = require("./generateTvGuideImg"),
    getTvGuide = require("./getTvGuide"),
    postImgOnVK = require("./postImgOnVK");

async function app({
    vkUsername,
    vkPassword,
    vkGroupId,
    vkAppId,
    vkAppSecret,
    vkApiVersion
}) {
    console.log("TV_Gide_Img_Generator started with arguments = ", arguments);
    let tvGuideResData,
        imgCanvas,
        savedImgName,
        vkSuccessfulPostId;

    if(!vkUsername || !vkPassword || !vkGroupId || !vkAppId || !vkAppSecret || !vkApiVersion)
        console.error("Warning! Some of the TV_Gide_Img_Generator arguments are empty!");

    try {
        //Get TV Guide Data
        tvGuideResData = await getTvGuide();

        //Generate image
        imgCanvas = generateTvGuideImg(tvGuideResData);

        //Save the image on drive before sending(to have a copy on drive)
        savedImgName = await saveImgOnDics(imgCanvas, "TV_guide_img.png");

        //send request to VK API
        vkSuccessfulPostId = await postImgOnVK({
            postedImg: savedImgName,
            postedGroupId: vkGroupId,
            vkUsername,
            vkPassword,
            vkApiVersion,
            vkAppId,
            vkAppSecret
        });
        console.log("\npostImgOnVK successfully posted img, postId = ", vkSuccessfulPostId);
    } catch (e) {
        console.error("\nCaught error in TV_Gide_Img_Generator: ", e);
        return -1;
    }

    console.log("\nTV_Gide_Img_Generator end");
    return 0;
}


module.exports = app;