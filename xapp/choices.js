import { xApp } from "../xapp.js"

xApp.choices = function(selector, config) {
    const defaults = {},
        $element = document.querySelector(selector),
        settings = Object.assign(defaults, config),
        libdef = {

        },
        libsettings = Object.assign(libdef, settings.libSettings),
        ch = new Choices($element, libsettings)

    return ch
}