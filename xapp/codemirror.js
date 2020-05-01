import { xApp } from "../xapp.js"

xApp.codemirror = function(selector, config) {
    const defaults = {},
        $element = document.querySelector(selector),
        settings = Object.assign(defaults, config),
        libdef = {
            lineNumbers: true,
            value: $element.value
        },
        libsettings = Object.assign(libdef, settings.libSettings),
        cm = new CodeMirror(function(elt) {
            $element.parentNode.replaceChild(elt, $element)
          }, libsettings)

    return cm
}