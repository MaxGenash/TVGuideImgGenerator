/**
 * Created by MaxGenash on 12.02.2017.
 */

const moment = require('moment'),
    fetch = require('node-fetch');

/**
 * Робить запит на сервер api.ovva.tv по інформацію про поточну телерограму
 * @param {Object} [options]
 * @param {String} [options.lang="ua"] - мова = "ru" або "ua"
 * @param {String} [options.day=today] - День(в форматі yyyy-mm-dd)
 * @param {String} [options.channel="1plus1"] - channel_string_id телеканалу, список доступних телеканалів тут https://api.ovva.tv/#api-TVGUIDE-GetV2LangTvguideDay
 * @returns {Promise.<Object>} - результати запиту на сервер api.ovva.tv
 */
async function getTvGuide (options = {}) {
    console.log("\nCalled getTvGuide with arguments = ", arguments);

    let { lang = "ua", day = new Date(), channel = "1plus1"} = options;

    if(!moment(day).isValid())
        throw new Error(`function getTvGuide got invalid parameter options.day = ${day}`);

    let formattedDay = moment(day).format('YYYY-MM-DD'),
        //детальніше про Параметри запиту тут: https://api.ovva.tv/#api-TVGUIDE-GetV2LangTvguideChannelDay
        reqURI = `https://api.ovva.tv/v2/${lang}/tvguide/${channel}/${formattedDay}`;

    console.log(`\nSending request to the TV Guide API Server: ${reqURI}`);
    let res = await fetch(reqURI);
    if(!res.ok)
        throw new Error(`TV Guide API Server response wasn't ok! Response status: ${res.status} - ${res.statusText}`);

    let json = await res.json();
    console.log("\nTV Guide API Server response: ", JSON.stringify(json, null, 2));
    //Resp example:
    // {
    //     "data": {
    //         "date": "2017-02-15",
    //         "programs": [
    //             {
    //                 "image": {
    //                     "preview": "https://images.ovva.tv/media/images/084/6a4/19e/0846a419eb1020789d408405d9f36494.jpeg"
    //                 },
    //                 "realtime_begin": 1487131200,
    //                 "realtime_end": 1487134200,
    //                 "will_broadcast_available": true,
    //                 "is_on_the_air": false,
    //                 "title": "ТСН-19:30",
    //                 "subtitle": "40 випуск"
    //             },
    //             {
    //                 "image": {
    //                     "preview": "https://images.ovva.tv/media/images/5e2/c5a/151/5e2c5a1512e5ce35344dd74f8601070a.jpeg"
    //                 },
    //                 "realtime_begin": 1487134200,
    //                 "realtime_end": 1487134800,
    //                 "will_broadcast_available": true,
    //                 "is_on_the_air": false,
    //                 "title": "Сніданок з 1+1",
    //                 "subtitle": "28 випуск"
    //             },
    //              //...
    //             {
    //                 "image": {
    //                     "preview": "https://images.ovva.tv/media/images/234/3a3/c49/2343a3c49108e2b02ebb5e368cccd346.jpeg"
    //                 },
    //                 "realtime_begin": 1487165400,
    //                 "realtime_end": 1487169900,
    //                 "will_broadcast_available": true,
    //                 "is_on_the_air": false,
    //                 "title": "Сказочная Русь",
    //                 "subtitle": ""
    //             },
    //             {
    //                 "image": {
    //                     "preview": "https://images.ovva.tv/media/images/495/4c8/133/4954c8133ac039a8eeb2f57b92dc8e65.jpeg"
    //                 },
    //                 "realtime_begin": 1487187000,
    //                 "realtime_end": 1487188800,
    //                 "will_broadcast_available": true,
    //                 "is_on_the_air": false,
    //                 "title": "Останній москаль",
    //                 "subtitle": "16 серія"
    //             },
    //         ]
    //     }
    // }

    if(json.data && json.data.date && json.data.programs && json.data.programs.length)
        return json.data;
    else
        throw new Error("Got invalid data from TV Guide API Server response!");
}


module.exports = getTvGuide;
