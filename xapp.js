import {SlimlibsGlobals, SlimlibsHandleHttpJSONResponse} from "../../js/modules/globals.js?module"
const xApp = Object.assign(SlimlibsGlobals, {
    appSelector: '#app',
    pageSelector: '#container',
    cookiePath: (SlimlibsGlobals.basePath==''?'/':SlimlibsGlobals.basePath),
    Libs: {},
    Fn: {},
    ENUMS: {
        notify: {
            info: 0,
            success: 1,
            warning: 2,
            danger: 3
        }
    }
})

xApp.handleHttpJSONResponse = SlimlibsHandleHttpJSONResponse

xApp.notifyError = function(error) {
    xApp.notify(error.message, xApp.ENUMS.notify.error)
}

xApp.notify = function(text, tp) {
    const event = new CustomEvent('xapp-app.notify', {
        bubbles: true,
        detail: {text: text, type: tp}
    }), $app = document.querySelector(xApp.appSelector)
    if ($app!=null) {
        $app.dispatchEvent(event)
    }
}
xApp.notifyInfo = function(text) {
    xApp.notify(text, xApp.ENUMS.notify.info)
}
xApp.notifySuccess = function(text) {
    xApp.notify(text, xApp.ENUMS.notify.success)
}
xApp.notifyWarning = function(text) {
    xApp.notify(text, xApp.ENUMS.notify.warning)
}
xApp.notifyDanger = function(text) {
    xApp.notify(text, xApp.ENUMS.notify.danger)
}

xApp.cookieEnabled = function() {
    if (navigator.cookieEnabled) return true
    document.cookie = "cookietest=1"
    const ret = document.cookie.indexOf("cookietest=") != -1
    document.cookie = "cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT"
    return ret
}

xApp.getCookie = function(name) {
    var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? decodeURIComponent(v[2]) : null;
}

xApp.setCookie = function(name, value, seconds) {
    var d = new Date;
    d.setTime(1000*seconds);
    document.cookie = name + "=" + encodeURIComponent(value) + ";path="+xApp.cookiePath+";expires=" + d.toGMTString();
}

xApp.deleteCookie = function(name) { xApp.setCookie(name, '', -1); }

xApp.routerBasePath = (location.pathname.slice(-1)=="/"?"":location.pathname).substr(xApp.basePath.length)

export { xApp }