import { xApp } from "../xapp.js"

class SomeClass {
    constructor(selector, config) {
        const defaults = {},
        $element = document.querySelector(selector),
        settings = Object.assign(defaults, config),
        libdef = {

        },
        libsettings = Object.assign(libdef, settings.libSettings),

    }

    somethod() {
    }
}

xApp.someClass = function(selector, config) {
    return new SomeClass(selector, config)
}