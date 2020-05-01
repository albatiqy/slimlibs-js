import { xApp } from "../xapp.js"

xApp.someFunction = function(selector, config) {
    const defaults = {},
        $element = document.querySelector(selector),
        settings = Object.assign(defaults, config),
        libdef = {

        },
        libsettings = Object.assign(libdef, settings.libSettings),
}