import { xApp } from "../xapp.js"

xApp.tinymce = function(selector, config) {
    const defaults = {
            uploadImageEndPoint: '/api/v0/resource/upload/media-image',
            uploadImagePath: '/uploads',
            uploadImageResize: false,
            mediaBasePath: xApp.basePath + '/resources/media'
        },
        $element = document.querySelector(selector),
        settings = Object.assign(defaults, config),
        imageUploadHandler = function(blobInfo, success, failure) {
            const data = new FormData(),
                formData = { path: settings.uploadImagePath, resize: settings.uploadImageResize },
                genericErrorText = `Couldn't upload file: ${blobInfo.filename()}.`,
                xhr = xApp.apiXMLHttpRequest(settings.uploadImageEndPoint, {
                    body: data,
                    onError: (e) => { failure(genericErrorText) },
                    onAbort: (e) => {},
                    onUploadProgress: (e) => {},
                    onFinish: (response) => {
                        if (!response || response.error) {
                            failure(response && response.error ? response.error.message : genericErrorText)
                            return;
                        }

                        const imgsrc = settings.mediaBasePath + response.data.path + '/' + response.data.name
                        success(imgsrc)
                    }
                })
            data.append('data', new Blob([JSON.stringify(formData)], { type: 'application/json' }), 'data')
            data.append('image', blobInfo.blob(), blobInfo.filename())
            xhr.send()
        },
        libdef = {
            target: $element,
            menubar: false,
            plugins: 'advlist autolink lists link image charmap print preview anchor ' +
                'searchreplace visualblocks code fullscreen ' +
                'insertdatetime media table paste help wordcount',
            toolbar: 'undo redo | formatselect | ' +
                'bold italic underline strikethrough | alignleft aligncenter ' +
                'alignright alignjustify | ' +
                'bullist numlist outdent indent | link image-browser media insert-pdf | ' +
                'fullscreen preview code | ' +
                'removeformat | help',
            media_url_resolver: function(data, resolve, reject) {
                xApp.apiGet('/api/v0/module/media/embedcode?url=' + decodeURI(data.url))
                    .then(json => {
                        if (json.data.result) {
                            resolve({html: '<div class="'+json.data.class+'-wrapper'+'">' + json.data.code + '</div>'})
                        } else {
                            reject({msg: 'invalid resource'})
                        }
                    })
            },
            images_upload_handler: imageUploadHandler,
            relative_urls: false,
            setup: function(editor) {
                editor.on('init', function(args) {
                    xApp.unblock()
                })
                editor.ui.registry.addButton('image-browser', {
                    icon: 'gallery',
                    tooltip: 'Image Browser',
                    onAction: function() {
                        editor.windowManager.openUrl({
                            title: 'Image Browser',
                            url: xApp.basePath + '/modules/tinymce/media-browser-dlg?filter=image',
                            height: 600,
                            width: 1000,
                            onMessage: function(instance, data) {
                                switch (data.mceAction) {
                                    case 'filePicked':
                                        if (data.fileType == 'IMAGE') {
                                            editor.execCommand('mceInsertContent', false, '<img src="' + settings.mediaBasePath + data.fileSrc + '">')
                                        }
                                        instance.close()
                                }
                            }
                        });
                    }
                })
                editor.ui.registry.addButton('insert-pdf', {
                    icon: 'new-document',
                    tooltip: 'Sisipkan PDF',
                    onAction: function() {
                        editor.windowManager.openUrl({
                            title: 'PDF Browser',
                            url: xApp.basePath + '/modules/tinymce/media-browser-dlg?filter=pdf',
                            height: 600,
                            width: 1000,
                            onMessage: function(instance, data) {
                                switch (data.mceAction) {
                                    case 'filePicked':
                                        if (data.fileType == 'PDF') {
                                            editor.execCommand('mceInsertContent', false, '<div class="xapp-pdf-media-wrapper"><iframe class="xapp-pdf-media" src="' + xApp.basePath + '/node_modules/slimlibs-js/libs/pdf.js/web/viewer.html?file=' + encodeURIComponent(settings.mediaBasePath + data.fileSrc) + '"></iframe></div>')
                                        }
                                        instance.close()
                                }
                            }
                        });
                    }
                })
            },
            content_css: [xApp.basePath + '/node_modules/bootstrap3/dist/css/bootstrap.min.css', xApp.basePath + '/css/tinymce-content.css']
        },
        libsettings = Object.assign(libdef, settings.libSettings)
    xApp.block()

    tinymce.init(libsettings)
    xApp.onUnload(() => {
        tinymce.remove()
    })
    return tinymce.get($element.id)
}