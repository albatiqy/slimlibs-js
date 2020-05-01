import { xApp } from "../../xapp.js"

xApp.formDialogSettings = function(selector, config) {
    const $container = document.querySelector(selector),
        $form = $container.querySelector('form'),
        $submit = $container.querySelector('[data-xapp="submit"]'),
        submit_url = $form.getAttribute('action'),
        $modal_content = $container.querySelector('.modal-content'),
        $modal_dialog = $container.querySelector('.modal-dialog'),
        formBlock = function() {
            olayPointerEvents = $modal_dialog.style.pointerEvents
            $modal_dialog.style.pointerEvents = 'unset'
            $modal_content.insertAdjacentHTML('afterend', '<div class="xapp-submit-overlay"></div>')
        },
        formUnblock = function() {
            const $_submit_olay = $container.querySelector('.xapp-submit-overlay')
            if ($_submit_olay != null) {
                $_submit_olay.remove()
                $modal_dialog.style.pointerEvents = olayPointerEvents
            }
        },
        defaults = {
            $submitButton: null,
            useFormData: false,
            validationCallbacks: function(field, errors) {return true},
            loadCallbacks: function(field, value) {return true},
            loadError: function(e) {
                if (e.constructor.name == 'ResultException') {
                    switch (e.errType) {
                        case xApp.errTypes.NOT_EXIST:
                            location = '#!/' + xApp.path
                            break
                    }
                }
            },
            beforeSubmit: function() {
                formBlock()
            },
            afterSubmit: function() {
                formUnblock()
            },
            submitSuccess: function(json) {},
            submitError: function(error) {
                if (error.constructor.name == 'ResultException') {
                    switch (error.errType) {
                        case xApp.errTypes.VALIDATION:
                            const errors = error.data
                            $form.querySelectorAll('.invalid-feedback').forEach($v => $v.remove())
                            $form.querySelectorAll('.is-invalid').forEach($v => $v.classList.remove('.is-invalid'))
                            for (const field in errors) {
                                if (!this.validationCallbacks(field, errors[field])) {
                                    const $input = $form.querySelector('[name="' + field + '"]')
                                    $input.insertAdjacentHTML('afterend', '<div class="invalid-feedback">' + errors[field] + '</div>')
                                    $input.classList.add('is-invalid')
                                }
                            }
                            break
                    }
                } else { //notify error??
                    if (error.constructor.name == 'JSONError') {
                        console.log(error)
                    }
                }
            }
        },
        settings = Object.assign(defaults, {
            $form: $form,
            $submitButton: $submit,
            endPoint: submit_url,
            edit: null
        }, config),
        submit_success = settings.submitSuccess, //jangan2 rekursif
        submit_error = settings.submitError
    let olayPointerEvents = ''
    settings.submitSuccess = function(json) {
        submit_success(json)
        if (typeof $container.xAppDialogSubmitSuccess == 'function') {
            $container.xAppDialogSubmitSuccess(json)
        }
    }
    settings.submitError = function(error) {
        submit_error(error)
        if (typeof $container.xAppDialogSubmitError == 'function') {
            $container.xAppDialogSubmitError(error)
        }
    }
    if (typeof settings.dialogShown == 'function') {
        $($container).on('shown.bs.modal', function() {
            if (settings.edit != null) {
                formBlock()
                xApp.apiGet(settings.endPoint + '/' + settings.edit)
                    .then(json => {
                        for (const k in json.data) {
                            if (!settings.loadCallbacks(k, json.data[k])) {
                                const $ctl = $form.querySelector('[name="' + k + '"]')
                                if ($ctl != null) {
                                    switch ($ctl.nodeName) {
                                        case 'INPUT':
                                            $ctl.value = json.data[k]
                                    }
                                }
                            }
                        }
                        formUnblock()
                    }).catch(error => { //handle ini
                        settings.loadError(error)
                    })
            }
            settings.dialogShown($container)
        })
    }
    return settings
}