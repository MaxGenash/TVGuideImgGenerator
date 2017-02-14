/**
 * Created by MaxGenash on 12.02.2017.
 */

const moment = require('moment'),
    fetch = require('node-fetch');

/**
 * Повертає проміс із результатами щапиту на сервер api.ovva.tv
 * @param options
 * @param options.lang - мова = "ru" або "ua", Default value: "ua"
 * @param options.day - День(в форматі yyyy-mm-dd), Default value: поточний день
 * @param options.channel - channel_string_id телеканалу, список доступних телеканалів тут https://api.ovva.tv/#api-TVGUIDE-GetV2LangTvguideDay , Default value: "1plus1"
 * @returns {Object}
 */
async function getTvGuide (options = {}) {
    console.log("\nCalled getTvGuide with options = ", options);

    let { lang = "ua", day = new Date(), channel = "1plus1"} = options;

    if(!moment(day).isValid())
        return {
            error: `function getTvGuide got invalid parameter options.day = ${day}`
        };
    //TODO: первіряти усі параметри

    let formattedDay = moment(day).format('YYYY-MM-DD'),
        //детальніше про Параметри запиту тут: https://api.ovva.tv/#api-TVGUIDE-GetV2LangTvguideChannelDay
        reqURI = `https://api.ovva.tv/v2/${lang}/tvguide/${channel}/${formattedDay}`;
    try {
        console.log(`\nSending request to the TV Guide API Server: ${reqURI}`);
        let res = await fetch(reqURI);
        if(!res.ok) {
            console.error("\nTV Guide API Server response is not ok!");
            return {
                "error": {
                    "error_msg": "TV Guide API Server response is not ok!"
                }
            }
        }

        let json = await res.json();
        console.log("\nTV Guide API Server response:", json);
        return json;
    } catch (e) {
        console.error("\ngetTvGuide request caught an error: ", e);
        return {
            "error": {
                error_msg: "Could not send request to TV Guide API Server: " + (e && e.error || e ||  "Unexpected error")
            }
        }
    }
}

module.exports = getTvGuide;
