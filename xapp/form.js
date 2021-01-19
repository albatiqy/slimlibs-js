import { xApp } from "../xapp.js"
import "../fetch.js"

xApp.serializeForm = function($form) { // can use FormData entries
    const isValidElement = element => {
            return element.name //&& element.value
        },
        isValidValue = element => {
            return (!['checkbox', 'radio'].includes(element.type) || element.checked)
        },
        isCheckbox = element => element.type === 'checkbox',
        isMultiSelect = element => element.options && element.multiple,
        getSelectValues = options => [].reduce.call(options, (values, option) => {
            return option.selected ? values.concat(option.value) : values
        }, [])

    return [].reduce.call($form.elements, (data, element) => {
        if (isValidElement(element) && isValidValue(element)) {
            if (isCheckbox(element)) {
                data[element.name] = (data[element.name] || []).concat(element.value)
            } else if (isMultiSelect(element)) {
                data[element.name] = getSelectValues(element)
            } else {
                data[element.name] = element.value
            }
        }

        return data
    }, {})
}

xApp.form = function(settings) {
    let $btnSubmitTrigger = null
    const submitx = function() {
        let data = null, cb = null, endpoint=settings.endPoint

        if ($btnSubmitTrigger!=null) {
            $btnSubmitTrigger.disabled = true
        }
        if (settings.$submitButton!=null) {
            settings.$submitButton.disabled = true
        }

        if (settings.useFormData) {
            data = new FormData(settings.$form)
        } else {
            data = xApp.serializeForm(settings.$form)
        }
        settings.beforeSubmit()
        /*
        if (settings.putEndPoint != null) {
            cb = xApp.apiPut
            endpoint = settings.putEndPoint
        } else {
            if (settings.edit != null) {
                cb = xApp.apiPut
                endpoint +=  '/' + settings.edit
            } else {
                cb = xApp.apiPost
            }
        }
        */
        if ('putEndPoint' in settings) {
            if (settings.putEndPoint != null) {
                cb = xApp.apiPut
                endpoint = settings.putEndPoint
            } else {
                if (settings.edit != null) {
                    cb = xApp.apiPut
                    endpoint +=  '/' + settings.edit
                } else {
                    cb = xApp.apiPost
                }
            }
        } else {
            if (settings.edit != null) {
                cb = xApp.apiPut
                endpoint +=  '/' + settings.edit
            } else {
                cb = xApp.apiPost
            }
        }
        if (typeof settings.alterSubmitData=='function') {
            data = settings.alterSubmitData(data)
        }
        cb(endpoint, data)
        .then(json=>{
            settings.afterSubmit(true)
            settings.submitSuccess(json)
        })
        .catch(error=>{
            settings.afterSubmit(false)
            settings.submitError(error)
        })
        .finally(()=>{
            if ($btnSubmitTrigger!=null) {
                $btnSubmitTrigger.disabled = false
                $btnSubmitTrigger = null
            }
            if (settings.$submitButton!=null) {
                settings.$submitButton.disabled = false
            }
        })

    }
    settings.$form.addEventListener("submit", e => {
        $btnSubmitTrigger = e.submitter
        e.preventDefault()
        submitx()
    })
    if (settings.$submitButton!=null) {
        settings.$submitButton.addEventListener("click", submitx)
    }
}