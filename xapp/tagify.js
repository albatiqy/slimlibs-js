import { xApp } from "../xapp.js"

xApp.tagify = function(selector, config) {
    const defaults = {},
        $element = document.querySelector(selector),
        settings = Object.assign(defaults, config),
        libdef = {
            pattern: /^[a-z\d\-_ ]+$/i
        },
        libsettings = Object.assign(libdef, settings.libSettings),
        ret = new Tagify($element, libsettings)
    return ret
}