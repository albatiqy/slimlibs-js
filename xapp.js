import {globals, SlimlibsHandleHttpJSONResponse} from "../../js/modules/globals.js?module"
const xApp = Object.assign(globals, {
    appSelector: '#app',
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

xApp.routerBasePath = (location.pathname.slice(-1)=="/"?"":location.pathname).substr(xApp.basePath.length)

export { xApp }