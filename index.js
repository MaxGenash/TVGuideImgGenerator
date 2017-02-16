/**
 * Created by MaxGenash on 16.02.2017.
 */

require("babel-polyfill");

const config = require("./config.json"),
    app = require("./app.js");

app(config);
