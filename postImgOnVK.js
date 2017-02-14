/**
 * Created by MaxGenash on 12.02.2017.
 */

const FormData = require('form-data'),
    fs = require("fs"),
    fetch = require('node-fetch');

async function getVkToken(options) {
    let {vkUsername, vkPassword, appId, appSecret} = options;

    //тип авторизації описано тут: https://vk.com/dev/auth_direct
    //client_id і client_secret взято із додатку "ВКонтакте для Windows"
    // стиряного у цій статті: https://sohabr.net/habr/post/233439/
    let res = await fetch(`https://oauth.vk.com/access_token?v=5.62&client_id=${appId}&client_secret=${appSecret}&username=${vkUsername}&password=${vkPassword}&grant_type=password&scope=all`);
    if(!res.ok) {
        //TODO: перевіряти що саме не так(або мб просто виводити response headers)
        throw new Error("VK getVkToken response wasn't not ok");
    }
    let json = await res.json();
    console.log("\nVK getVkToken response: ", json);

    if(json.access_token)
        return json.access_token;
    //якщо json.error, то далі просто не буде виконуватись
    else
        throw new Error("VK getVkToken response doesn't contain access_token");
}

async function postImgOnVk (options = {}) {
    let res,
        json,
        wallUploadUrl,
        vkToken,
        uploadedImgJsonResp,
        savedPhotoAttachmentId,
        {postedImg, postedGroupId, vkUsername, vkPassword, appId, appSecret} = options;

    //TODO Перевіряти чи норм прийшли усі параметри
    if(!postedImg || !postedGroupId /* ... */) {
        console.error("Wrong parameters!!!");
        return {
            "error": {
                "error_msg": "Wrong parameters"
            }
        }
    }

    //TODO: писати всюди версію АПІ ВК із конфіга

    try {
        /////// 0. Получение токена авторизации
        //виділено у окрему функцію, бо отримання токена більш-менш незалежна процедура
        vkToken = await getVkToken({vkUsername, vkPassword, appId, appSecret});


        /////// 1. Получение адреса
        console.log("\nsending request to VK photos.getWallUploadServer");
        res = await fetch(`https://api.vk.com/method/photos.getWallUploadServer?group_id=${postedGroupId}&v=5.62&access_token=${vkToken}`);
        if(!res.ok) {
           //TODO: перевіряти що саме не так(або мб просто виводити response headers)
           throw new Error("VK photos.getWallUploadServer wasn't ok!");
        }

        json = await res.json();
        console.log("\nVK photos.getWallUploadServer response: ", json);
        //in success case json looks like:
        // {
        //     "response": {
        //         "upload_url": "https:\/\/pu.vk.com\/c837721\/upload.php?act=do_add&mid=19654341&aid=-14&gid=131637994&hash=deee415d94671cf50g62b05e6d84bbed&rhash=3b58aeebaffbba5c3b010e1e5715866b&swfupload=1&api=1&wallphoto=1",
        //         "album_id":-14,
        //         "user_id":29654341
        //     }
        // }

        if(json && json.response && json.response.upload_url)
            wallUploadUrl = json.response.upload_url;
        //якщо json.error, то далі просто не буде виконуватись
        else
            throw new Error("VK photos.getWallUploadServer response doesn't contain upload_url");


        /////// 2. Передача файла

        //Ограничения:
        //  Допустимые форматы: JPG, PNG, GIF.
        //  не более 6 фотографий за один раз в методе photos.saveWallPhoto,
        //  сумма высоты и ширины не более 14000px,
        //  файл объемом не более 50 МБ.
        console.log("\nSending photo to VK wallUploadUrl");
        let formData = new FormData();
        formData.append("photo", fs.createReadStream(__dirname + "/" + postedImg));
        res = await fetch(wallUploadUrl, {
            method: 'POST',
            body: formData
        });
        if(!res.ok) {
            //TODO: перевіряти що саме не так
            throw new Error("VK upload img wasn't ok!");
        }

        uploadedImgJsonResp = await res.json();
        console.log("\nVK upload img response: ", uploadedImgJsonResp);
        //in success case json looks like:
        // {
        //     "server":123456,
        //     "photo":"[{\"photo\":\"26f1e24c4c:w\",\"sizes\":[[\"s\",\"123456852\",\"15e88\",\"01qMnm6kJ-U\",56,75],[\"m\",\"123456852\",\"15e89\",\"Y9BJ8lGrL_0\",97,130],[\"x\",\"123456852\",\"15e8a\",\"wVmxGPX0i88\",453,604],[\"y\",\"123456852\",\"15e8b\",\"ZGgaSculk1E\",605,807],[\"z\",\"123456852\",\"15e8c\",\"yl_hClRMfG8\",810,1080],[\"w\",\"123456852\",\"15e8d\",\"J1uuxjwvAKQ\",1620,2160],[\"o\",\"123456852\",\"15e8e\",\"r5KpmV_5EPM\",130,173],[\"p\",\"123456852\",\"15e8f\",\"vUIVbZdbRp0\",200,267],[\"q\",\"123456852\",\"15e90\",\"m_wtVnGD6BQ\",320,427],[\"r\",\"123456852\",\"15e91\",\"YGElZzBgEIM\",510,680]],\"kid\":\"95574768563a263c4a275f4af50a9425\",\"debug\":\"xswmwxwywzwwwowpwqwrw\"}]",
        //     "hash":"ed06bb07ef7a128fdae22decad8291f7"
        // }

        //якщо json.error, то далі просто не буде виконуватись
        if(!uploadedImgJsonResp.server || !uploadedImgJsonResp.photo || !uploadedImgJsonResp.hash)
            throw new Error("VK upload img response doesn't contain either field server, photo or hash");
        if(!uploadedImgJsonResp.photo.length)
            throw new Error("Could not upload img to VK: VK server response contain empty array response.photo[]");


        /////// 3. Сохранение результата
        console.log("\nsending request to VK photos.saveWallPhoto");
        res = await fetch(`https://api.vk.com/method/photos.saveWallPhoto?` + encodeURI(`group_id=${postedGroupId}&server=${uploadedImgJsonResp.server}&photo=${uploadedImgJsonResp.photo}&hash=${uploadedImgJsonResp.hash}&caption=Опубліковано через програму https://github.com/MaxGenash/TVGuideImgGenerator у відповідності до відбіркового завдання хакатону int20h.&v=5.62&access_token=${vkToken}`));
        if(!res.ok) {
            //TODO: перевіряти що саме не так
            throw new Error("VK photos.saveWallPhoto wasn't ok!");
        }

        json = await res.json();
        console.log("\nVK photos.saveWallPhoto response: ", json);
        //in success case json looks like:
        // {
        //     response:
        //     [
        //         {
        //             id: 456539290,
        //             album_id: -14,
        //             owner_id: 29654341,
        //             photo_75: 'https://pp.vk.me/c837722/v837722341/3364e/VLzSzsMotyY.jpg',
        //             photo_130: 'https://pp.vk.me/c837722/v837722341/3364f/mGfILBbE67Y.jpg',
        //             photo_604: 'https://pp.vk.me/c837722/v837722341/33650/5h2uyoNQsTg.jpg',
        //             width: 200,
        //             height: 200,
        //             text: 'some text',
        //             date: 1487103379
        //         }
        //     ]
        // }

        if(json && json.response && json.response[0] && json.response[0] && json.response[0].owner_id && json.response[0].id)
            savedPhotoAttachmentId = `photo${json.response[0].owner_id}_${json.response[0].id}` ;
        //якщо json.error, то далі просто не буде виконуватись
        else
            throw new Error("VK photos.saveWallPhoto response doesn't contain either responseJson.response[0].owner_id or responseJson.response[0].id");


        /////// 4. Публикация фотографии
        console.log("\nsending request to VK wall.post");
        let from_group = 0,     // 1 — запись будет опубликована от имени группы,
                                // 0 — запись будет опубликована от имени пользователя (по умолчанию).
            wallMessage = "Опубліковано через програму https://github.com/MaxGenash/TVGuideImgGenerator у відповідності до відбіркового завдання хакатону int20h.";
        res = await fetch(`https://api.vk.com/method/wall.post?` + encodeURI(`owner_id=${-postedGroupId}&from_group=${from_group}&attachments=${savedPhotoAttachmentId}&message=${wallMessage}&v=5.62&access_token=${vkToken}`));
        if(!res.ok) {
            //TODO: перевіряти що саме не так
            throw new Error("VK wall.post wasn't ok!");
        }

        json = await res.json();
        console.log("\nVK wall.post response: ", json);
        //in success case json looks like:
        // {
        //      response: { post_id: 4 }
        // }

        if(json && json.response && json.response.post_id !== undefined)   //post_id може дорівнювати 0
            return {
                "success": { post_id: json.response.post_id }
            };
        //якщо json.error, то далі просто не буде виконуватись
        else
            throw new Error("VK wall.post response doesn't contain post_id");
    } catch (e) {
        console.log("\nCaught error in postImgOnVk: ", e);
        return {
            "error": {
                "error_msg": e
            }
        }
    }
}

module.exports = postImgOnVk;