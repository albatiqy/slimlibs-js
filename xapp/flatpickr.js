import { xApp } from "../xapp.js"

xApp.flatpickr = function(selector, config) {
    const defaults = {},
        $element = document.querySelector(selector),
        settings = Object.assign(defaults, config),
        libdef = {
            enableTime: true,
            dateFormat: 'd/m/Y H:i:S'
        },
        libsettings = Object.assign(libdef, settings.libSettings)
        const ret = flatpickr($element, libsettings)
        xApp.onUnload(()=>{
            ret.destroy()
        })
        return ret

}