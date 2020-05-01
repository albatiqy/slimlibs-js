import { xApp } from "../../xapp.js"

//require page template

const msgbox = function(message, config) {
    const defaults = {
            title: "Perhatian",
            noCaption: 'Batal',
            btnNo: true,
            yesCaption: 'Ya'
        },
        settings = Object.assign(defaults, config),
        template = document.querySelector('#xapp-templates')
    if (template != null) {
        let $modal = template.content.querySelector('.modal')
        if ($modal != null) {
            $modal = $modal.cloneNode(true)
            $modal.querySelector('.modal-body p').textContent = message
            const $yesbtn = $modal.querySelector('[data-xapp="ok"]'),
                $nobtn = $modal.querySelector('.modal-footer [data-dismiss="modal"]'),
                $modaltitle = $modal.querySelector('.modal-header .modal-title')
            $modaltitle.textContent = settings.title
            $yesbtn.textContent = settings.yesCaption
            if (settings.btnNo) {
                $nobtn.textContent = settings.noCaption
            } else {
                $nobtn.remove()
            }
            $yesbtn.classList.add('btn-' + settings.class)
            $yesbtn.addEventListener('click', function(e) {
                if (typeof settings.yesCallback == 'function') {
                    settings.yesCallback()
                }
                $($modal).modal('hide')
            })
            $($modal).modal('show')
            $($modal).on('hidden.bs.modal', function() {
                $modal.remove()
            })
        }
    }
}

xApp.msgboxSuccess = function(message, yesCallback, config) {
    msgbox(message, Object.assign({
        yesCallback: yesCallback,
        class: 'success'
    }, config))
}

xApp.msgboxWarning = function(message, yesCallback, config) {
    msgbox(message, Object.assign({
        yesCallback: yesCallback,
        class: 'warning'
    }, config))
}

xApp.msgboxInfo = function(message, yesCallback, config) {
    msgbox(message, Object.assign({
        yesCallback: yesCallback,
        class: 'info'
    }, config))
}

xApp.msgboxDanger = function(message, yesCallback, config) {
    msgbox(message, Object.assign({
        yesCallback: yesCallback,
        class: 'danger'
    }, config))
}

xApp.msgboxDangerAlert = function(message, title) {
    msgbox(message, {
        btnNo: false,
        yesCaption: 'Ok',
        title: title,
        class: 'danger'
    })
}

xApp.msgbox = msgbox