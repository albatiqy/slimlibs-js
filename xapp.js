import {SlimlibsGlobals, SlimlibsHandleHttpJSONResponse} from "../../js/modules/globals.js?module"
const xApp = Object.assign(SlimlibsGlobals, {
    appSelector: '#app',
    pageSelector: '#container',
    cookiePath: (SlimlibsGlobals.basePath==''?'/':SlimlibsGlobals.basePath),
    Libs: {}
})

xApp.handleHttpJSONResponse = SlimlibsHandleHttpJSONResponse

xApp.notifyError = function(error) {
    const event = new CustomEvent('notification.error', {
        bubbles: true,
        detail: error
    }), $app = document.querySelector(xApp.appSelector)
    if ($app!=null) {
        $app.dispatchEvent(event)
    }
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