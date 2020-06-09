import { xApp } from "./xapp.js"

class ConnectionTimedout extends Error {
    constructor() {
        super("Server tidak merespon")
    }
}

xApp.login = function(email, password) {
    localStorage.setItem("access_token", null)
    return new Promise((resolve, reject)=>{
        setTimeout(function() {
            reject(new ConnectionTimedout())
          }, 5000)
        fetch(xApp.basePath + "/api/v0/users/login", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        }).then(resolve, reject)
    })
    .then(xApp.handleHttpJSONResponse)
    .then((json)=>{
        localStorage.setItem("access_token", json.data.access_token)
        localStorage.setItem("refresh_token", json.data.refresh_token)
        localStorage.setItem("token_expires", json.data.expires)
        document.cookie = 'access_token=' + json.data.access_token + '; expires=' + (new Date(json.data.expires * 1000).toUTCString())
        return json
    })
}

xApp.apiGet = async function(url) {
    return xApp.apiCall(url, {})
}

xApp.apiPost = async function(url, data) {
    let settings = {
        method: 'POST'
    }
    if (data.constructor.name=='FormData') {
        settings = Object.assign(settings, {
            body: data
        })
    } else {
        settings = Object.assign(settings, {
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
    }
    return xApp.apiCall(url, settings)
}

xApp.apiPut = async function(url, data) {
    let settings = {
        method: 'PUT'
    }
    if (data.constructor.name=='FormData') {
        settings = Object.assign(settings, {
            body: data
        })
    } else {
        settings = Object.assign(settings, {
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
    }
    return xApp.apiCall(url, settings)
}

xApp.apiDelete = async function(url, data) {
    let settings = {
        method: 'DELETE'
    }
    if (data.constructor.name=='FormData') {
        settings = Object.assign(settings, {
            body: data
        })
    } else {
        settings = Object.assign(settings, {
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
    }
    return xApp.apiCall(url, settings)
}

xApp.refreshToken = async function(callback) {
    try {
        const ntoken = await fetch(xApp.basePath + "/api/v0/users/token", {headers:{"Content-Type": "application/json", "Accept": "application/json"}, method:'POST', body:JSON.stringify({refresh_token: localStorage.getItem('refresh_token')})})
            .then(xApp.handleHttpJSONResponse)
        localStorage.setItem("access_token", ntoken.data.access_token)
        localStorage.setItem("refresh_token", ntoken.data.refresh_token)
        localStorage.setItem("token_expires", ntoken.data.expires)
        return callback()
    } catch (e) {
        throw e
    }
}

xApp.apiCall = async function(url, config) {
    const defaults = {
            headers: {
                'Accept': 'application/json'
            }
        },
        defaults_headers = defaults.headers,
        access_token = localStorage.getItem('access_token'),
        settings = Object.assign(defaults, config),
        endPoint = xApp.basePath + url
    settings.headers = Object.assign(defaults_headers, config.headers)
    if (access_token != null) {
        settings.headers['Authorization'] = 'Bearer ' + access_token
    }

    try {
        return await fetch(endPoint, settings)
            .then(xApp.handleHttpJSONResponse)
    } catch (error) {
        switch (error.constructor.name) {
            case 'ResultException':
                if (error.httpStatus==401) {
                    try {
                        return xApp.refreshToken(() => {
                            settings.headers['Authorization'] = 'Bearer ' + localStorage.getItem('access_token')
                            return fetch(endPoint, settings).then(xApp.handleHttpJSONResponse)
                        })
                    } catch (e) {
                        if (!('pageReff' in xApp)) {
                            xApp.pageReff = location.hash
                        }
                        location = '#!/login'
                        return
                    }
                }
            case 'JSONError':
                throw error
            //else??
        }
    }
}

class XMLHttpRequestWrapper {
    constructor(url, config) {
        const defaults = {
            body: null,
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            },
            method: 'POST',
            responseType: 'json',
            onUploadProgress: function (e) {},
            onFinish: function (response) {},
            onError: function(e) {},
            onAbort: function(e) {}
        },
        settings = Object.assign(defaults, config)

        let xhr = new XMLHttpRequest()

        xhr.open(settings.method, xApp.basePath + url, true)
        for (const h in settings.headers) {
            xhr.setRequestHeader(h, settings.headers[h])
        }
        xhr.responseType = settings.responseType
        if (xhr.upload) {
            xhr.upload.addEventListener("progress", function(e) {
                if (e.lengthComputable) {
                    settings.onUploadProgress(e)
                }
            })
        }
        xhr.addEventListener('error', settings.onError)
        xhr.addEventListener('abort', settings.onAbort)
        xhr.addEventListener('load', async () => {
            if ([200, 201].includes(xhr.status)) {
                settings.onFinish(xhr.response)
            } else {
                if (xhr.status==401) { // REFRESH TOKEN==================
                    try {
                        xApp.refreshToken(() => {
                            const nxhr = new XMLHttpRequest()
                            nxhr.open(settings.method, xApp.basePath + url, true)
                            settings.headers['Authorization'] = 'Bearer ' + localStorage.getItem('access_token')
                            for (const h in settings.headers) {
                                nxhr.setRequestHeader(h, settings.headers[h])
                            }
                            nxhr.responseType = settings.responseType
                            if (nxhr.upload) {
                                nxhr.upload.addEventListener("progress", function(e) {
                                    if (e.lengthComputable) {
                                        settings.onUploadProgress(e)
                                    }
                                })
                            }
                            nxhr.addEventListener('error', settings.onError)
                            nxhr.addEventListener('abort', settings.onAbort)
                            nxhr.addEventListener('load', function(e) {
                                if ([200, 201].includes(nxhr.status)) {
                                    settings.onFinish(nxhr.response)
                                } else {
                                    throw 'upload error'
                                }
                            })
                            xhr = nxhr
                            nxhr.send(settings.body)
                        })
                    } catch (e) {
                        if ('pageReff' in xApp) {
                            xApp.pageReff = location.hash
                            location = '#!/login'
                            return
                        }
                    }
                } //else??
            }
        })
        this.xhr = xhr
        this.settings = settings
    }

    send() {
        this.xhr.send(this.settings.body)
    }

    abort() {
        this.xhr.abort()
    }
}

xApp.apiXMLHttpRequest = function(url, config) {
    return new XMLHttpRequestWrapper(url, config)
}