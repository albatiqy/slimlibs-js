import { xApp } from "../xapp.js"

xApp.tinymce = function(selector, config) {
    const defaults = {
            uploadImageEndPoint: '/api/v0/resource/upload/media-image',
            uploadImagePath: '/uploads',
            uploadImageResize: false,
            imageBasePath: xApp.basePath + '/resources/media'
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

                        const imgsrc = settings.imageBasePath + response.data.path + '/' + response.data.name
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
            plugins: [
                'advlist autolink lists link image charmap print preview anchor',
                'searchreplace visualblocks code fullscreen',
                'insertdatetime media table paste code help wordcount'
            ],
            toolbar: 'undo redo | formatselect | ' +
                'bold italic backcolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | image-browser | ' +
                'removeformat | help',
            images_upload_handler: imageUploadHandler,
            images_upload_base_path: '/',
            setup: function(editor) {
                    editor.ui.registry.addButton('image-browser', {
                        icon: 'gallery',
                        tooltip: 'Image Browser',
                        onAction: function() {
                            editor.windowManager.openUrl({
                                title: 'Image Browser',
                                url: xApp.basePath + '/modules/tinymce/media-browser-dlg',
                                height: 600,
                                width: 1000,
                                onMessage: function(instance, data) {
                                    switch (data.mceAction) {
                                        case 'filePicked':
                                            if (data.fileType=='IMAGE') {
                                                editor.execCommand('mceInsertContent', false, '<img src="' + settings.imageBasePath + data.fileSrc + '">')
                                            }
                                            instance.close()
                                    }
                                }
                            });
                        }
                    })
                }
                //content_css: xApp.basePath + '/themes/family-doctor/css/style.css'
        },
        libsettings = Object.assign(libdef, settings.libSettings)

    tinymce.init(libsettings)
    return tinymce.get($element.id)
}