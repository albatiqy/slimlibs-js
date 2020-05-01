import { xApp } from "../xapp.js"
import "../fetch.js"

xApp.comdialog = function(config) {
    const defaults = {
        path: '',
        modal: false,
        dialogParams: {
            path: ''
        },
        onSubmit: function(event, data) {},
        onClose: function() {}
    },
    _page_loads = xApp.htmlFetchDeps(),
    settings = Object.assign(defaults, config)
    xApp.loadPage(xApp.basePath + xApp.routerBasePath + '/components'+ settings.path, '#container', _page_loads, function($parent, refid) {
        const $el = $parent.querySelector('#' + refid)
        $el.__proto__.xappconfig = Object.assign({
            modal: settings.modal,
            dialogDestroy: function() {
                document.body.classList.remove('xapp-noscroll')
                _page_loads.empty()
                $el.remove()
            },
            dialogReady: function(data) {
                document.body.classList.add('xapp-noscroll')
                $el.querySelectorAll('.xapp-close').forEach($v => {
                    $v.addEventListener('click', e => {
                        e.preventDefault()
                        $el.xappconfig.dialogDestroy()
                    })
                })
            },
            dialogFilePicked: function(file) {
                settings.onSubmit("file", file)
                $el.xappconfig.dialogDestroy()
            }
        }, settings.dialogParams)
        xApp.onUnload(() => {
            $el.xappconfig.dialogDestroy()
        })
    })
}