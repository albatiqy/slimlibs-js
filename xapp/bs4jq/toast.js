import { xApp } from "../../xapp.js"

//require page template

function toast(message, title, color) {
    const $toastc = document.querySelector('#xapp-toast-container')

    if ($toastc != null) {
        const template = document.querySelector('#xapp-templates')
        if (template != null) {
            let $toast = template.content.querySelector('.toast')
            if ($toast != null) {
                $toast = $toast.cloneNode(true)
                $toast.querySelector('.toast-header strong').textContent = title
                $toast.querySelector('.toast-body').textContent = message
                $toast.querySelector('.bd-placeholder-img rect').setAttribute("fill", color)
                $toastc.appendChild($toast)
                $($toast).toast({
                    delay: 2000
                })
                $($toast).toast('show')
                $($toast).on('hidden.bs.toast', function() {
                    //$($toast).toast('dispose')
                    $toast.remove()
                })
            }
        }

    }
}

xApp.toastSuccess = function(message, title) {
    toast(message, title, '#28a745')
}

xApp.toastInfo = function(message, title) {
    toast(message, title, '#17a2b8')
}

xApp.toastWarning = function(message, title) {
    toast(message, title, '#ffc107')
}

xApp.toastDanger = function(message, title) {
    toast(message, title, '#dc3545')
}