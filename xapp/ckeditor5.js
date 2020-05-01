import { xApp } from "../xapp.js"

class MyUploadAdapter {
    constructor(loader, uploadImageEndPoint, uploadImagePath, uploadImageResize, uploadImageSuccess, imageBasePath) { //image uploaded callback??
        this.loader = loader
        this.uploadImageEndPoint = uploadImageEndPoint
        this.uploadImagePath = uploadImagePath
        this.uploadImageResize = uploadImageResize
        this.uploadImageSuccess = uploadImageSuccess
        this.imageBasePath = imageBasePath
    }

    upload() {
        return this.loader.file
            .then(file => new Promise((resolve, reject) => {
                this._sendRequest(resolve, reject, file)
            }));
    }

    abort() {
        if (this.xhr) {
            this.xhr.abort()
        }
    }

    _sendRequest(resolve, reject, file) {
        const data = new FormData(),
        formData = {path: this.uploadImagePath, resize: this.uploadImageResize}

        data.append('data', new Blob([JSON.stringify(formData)], { type: 'application/json' }))
        data.append('image', file)

        const genericErrorText = `Couldn't upload file: ${ file.name }.`,
            loader = this.loader,
            xhr = this.xhr = xApp.apiXMLHttpRequest(this.uploadImageEndPoint, {
                body: data,
                onError: (e) => reject(genericErrorText),
                onAbort: (e) => reject(),
                onUploadProgress: (e) => {
                    loader.uploadTotal = e.total
                    loader.uploaded = e.loaded
                },
                onFinish: (response) => {
                    if (!response || response.error) {
                        return reject(response && response.error ? response.error.message : genericErrorText)
                    }

                    const imgsrc = this.imageBasePath + response.data.path + '/' + response.data.fileName

                    this.uploadImageSuccess(imgsrc)

                    resolve({
                        default: imgsrc
                    })
                }
            })
            xhr.send()
    }
}

class CkEditorWrapper {
    constructor(instance, pdfEmbedPattern) {
        this.instance = instance
        this.pdfEmbedPattern = pdfEmbedPattern
    }

    getData() {
        const $div = document.createElement('div')
        $div.innerHTML = this.instance.getData()
        const figureMedias = $div.querySelectorAll('figure.media')

        figureMedias.forEach($el=> {
            const $oembed = $el.querySelector('oembed'),
            medUrl = $oembed.getAttribute('url').replace('https://', '')
            if (medUrl.match(this.pdfEmbedPattern)) {
                const $wiframe = document.createElement('div')
                $wiframe.innerHTML = `<iframe class="xapp-pdf-media" src="${xApp.basePath}/node_modules/slimlibs-js/libs/pdf.js/web/viewer.html?file=${encodeURIComponent(medUrl)}"></iframe>`
                $el.parentNode.replaceChild($wiframe.firstElementChild, $el)
            }
        })

        return $div.innerHTML
    }

    setData(val) {
        const $div = document.createElement('div')
        $div.innerHTML = val
        const iframes = $div.querySelectorAll('iframe.xapp-pdf-media')

        iframes.forEach($el=> {
            const medUrl = new URL('https://embohlah'+$el.getAttribute('src')),
            urlParams = new URLSearchParams(medUrl.search),
            url = decodeURIComponent(urlParams.get('file')),
            $wioembed = document.createElement('div')
            $wioembed.innerHTML = `<figure class="media"><oembed url="${url.replace('https://', '')}"></oembed></figure>`
            $el.parentNode.replaceChild($wioembed.firstElementChild, $el)
        })

        this.instance.setData($div.innerHTML)
    }

    execute(cmd, arg) {
        this.instance.execute(cmd, arg)
    }
}


xApp.ckeditor5 = function(selector, config) {
    const defaults = {
        uploadImageEndPoint: '/api/v0/resource/upload/media-image',
        uploadImagePath: '/uploads',
        uploadImageResize: true,
        uploadImageSuccess: function(imgsrc) {},
        imageBasePath: xApp.basePath + '/resources/media',
        pdfEmbedPattern: /^\/*[^\/]*\/resources\/.*\.pdf$/i
    },
        $element = document.querySelector(selector),
        settings = Object.assign(defaults, config),
        ConvertDivAttributes = function(editor) {
            editor.model.schema.register('div', {
                allowWhere: '$block',
                allowContentOf: '$block' //$root
            });

            editor.model.schema.addAttributeCheck(context => {
                if (context.endsWith('div')) {
                    return true
                }
            });

            editor.conversion.for('upcast').elementToElement({
                view: 'div',
                model: (viewElement, modelWriter) => {
                    return modelWriter.createElement('div', viewElement.getAttributes());
                }
            })

            editor.conversion.for('downcast').elementToElement({
                model: 'div',
                view: 'div'
            })

            editor.conversion.for('downcast').add(dispatcher => {
                dispatcher.on('attribute', (evt, data, conversionApi) => {
                    if (data.item.name != 'div') {
                        return
                    }

                    const viewWriter = conversionApi.writer,
                    viewDiv = conversionApi.mapper.toViewElement(data.item)

                    if (data.attributeNewValue) {
                        viewWriter.setAttribute(data.attributeKey, data.attributeNewValue, viewDiv)
                    } else {
                        viewWriter.removeAttribute(data.attributeKey, viewDiv)
                    }
                })
            })
        },
        MyCustomUploadAdapterPlugin = function (editor) {
            editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
                return new MyUploadAdapter(loader, settings.uploadImageEndPoint, settings.uploadImagePath, settings.uploadImageResize, settings.uploadImageSuccess, settings.imageBasePath)
            }
        },
        libdef = {
            toolbar: {
                items: [
                    'heading',
                    '|',
                    'bold',
                    'italic',
                    'underline',
                    'strikethrough',
                    //'subscript',
                    //'superscript',
                    '|',
                    'fontFamily',
                    'fontSize',
                    'fontColor',
                    //'fontBackgroundColor',
                    '|',
                    'bulletedList',
                    'numberedList',
                    'indent',
                    'outdent',
                    'alignment',
                    '|',
                    'link',
                    'imageUpload',
                    'insertTable',
                    'mediaEmbed',
                    'blockQuote',
                    'horizontalLine',
                    'pageBreak',
                    '|',
                    'undo',
                    'redo',
                    'removeFormat'
                ]
            },
            language: 'en',
            image: {
                toolbar: [
                    'imageTextAlternative',
                    'imageStyle:full',
                    'imageStyle:side'
                ]
            },
            table: {
                contentToolbar: [
                    'tableColumn',
                    'tableRow',
                    'mergeTableCells',
                    'tableCellProperties',
                    'tableProperties'
                ]
            },
            licenseKey: '',
           mediaEmbed: {
            previewsInData: false,
            extraProviders: [{
                    name: 'xapp-pdf',
                    url: settings.pdfEmbedPattern,
                    html: match => {
                        const url = match[0],
                        iframeUrl = encodeURIComponent(url)
                        return (
                            `<iframe class="xapp-pdf-media" src="${xApp.basePath}/node_modules/slimlibs-js/libs/pdf.js/web/viewer.html?file=${iframeUrl}"></iframe>`
                        )
                    }
                },
            ]},
            extraPlugins: [ConvertDivAttributes, MyCustomUploadAdapterPlugin]
        },
        libsettings = Object.assign(libdef, settings.libSettings)
    return ClassicEditor
        .create($element, libsettings)
        .then(editor => {
            xApp.onUnload(() => {
                editor.destroy()
                delete window.CKEDITOR_VERSION
            })
            return new CkEditorWrapper(editor, settings.pdfEmbedPattern)
        })
        .catch(error => {
            console.error(error);
        })
}