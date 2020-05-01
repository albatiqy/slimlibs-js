import { xApp } from "../xapp.js"

class ValidatorClass {
    constructor(config) {
        const defaults = {
            clearErrors: function(){},
            invalidInput: function(attib, msg){},
            labels: {},
            showException: function(msg) {}
        },
        settings = Object.assign(defaults, config)
        this.settings = settings
        this.showException = settings.showException
    }

    validate(data) {
        this.settings.clearErrors()
        const errors = {}
        for(const attrib in data) {
            const error = [],label = (attrib in this.settings.labels?this.settings.labels[attrib]:attrib)
            if (data[attrib]=='') {
                error.push(label+' harap diisi')
            }
            if (error.length > 0) {
                this.settings.invalidInput(attrib, error.join('<br/>'))
                errors[attrib] = error
            }
        }
        if (Object.keys(errors).length > 0) {
            return false
        }
        return true
    }
}

xApp.validator = function(config) {
    return new ValidatorClass(config)
}