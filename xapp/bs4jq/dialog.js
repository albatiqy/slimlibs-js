import { xApp } from "../../xapp.js"
import "../../fetch.js"
import "./msgbox.js"

xApp.dialog = function(config) {
    const defaults = {
            submitSuccess: function(json) {}
        },
        settings = Object.assign(defaults, config),
        _page_loads = xApp.htmlFetchDeps()
    xApp.block()
    xApp.loadPage(settings.url, 'body', _page_loads, function($parent, refid) {
        xApp.unblock()
        const $del = $parent.querySelector('#' + refid),
            $el = $($del)

        $del.__proto__.xAppDialogSubmitSuccess = function(json) {
            $el.modal('hide')
            settings.submitSuccess(json)
        }

        $del.__proto__.xAppDialogSubmitError = function(error) {
            xApp.msgboxDangerAlert(error.data.message, "Error")
        }

        $el.modal({
            backdrop: 'static'
        })
        $el.on('hidden.bs.modal', function(e) {
            _page_loads.empty()
            //$el.modal('dispose')
            $del.remove()
        })
        if (typeof settings.shown == 'function') {
            $el.on('shown.bs.modal', function() {
                settings.shown($del)
            })
        }
        if (typeof settings.initialized == 'function') {
            settings.initialized($del, _page_loads)
        }
    })
}