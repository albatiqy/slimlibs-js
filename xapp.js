import globals from "../../js/modules/globals.js"
const xApp = Object.assign(globals, {
    appSelector: '#app'
})

class ResultException extends Error {
    constructor(response, status) {
        super(response.message)
        this.name = this.constructor.name
        if ('captureStackTrace' in Error) {
            Error.captureStackTrace(this, this.constructor)
        } else {
            this.stack = (new Error(this.message)).stack
        }
        this.data = response.error
        this.errType = response.errType
        this.httpStatus = status
    }
}

class JSONError extends Error {
    constructor(json, status) {
        if ('message' in json) {
            super(json.message)
        } else {
            super("server error")
        }
        this.name = this.constructor.name
        if ('captureStackTrace' in Error) {
            Error.captureStackTrace(this, this.constructor)
        } else {
            this.stack = (new Error(this.message)).stack
        }
        this.data = json
        this.httpStatus = status
    }
}

xApp.handleHttpJSONResponse = async function(response) { // text status???
    if (['application/json', 'text/json'].includes(response.headers.get('Content-Type'))) {
        let json = null
        try {
            json = await response.json()
        } catch (e) {
            throw new JSONError({message:"malformed json response"}, response.status)
        }
        if (!response.ok) {
            if ('errType' in json) {
                throw new ResultException(json, response.status)
            } else {
                throw new JSONError(json, response.status)
            }
        } else {
            return json
        }
    } else {
        throw new JSONError({message:"invalid content type"}, response.status)
    }
}

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