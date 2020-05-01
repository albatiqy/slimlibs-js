import { xApp } from "../xapp.js"

xApp.ddimgupload = function(selector, config) {
    const defaults = {
            uploadImageEndPoint: '/api/v0/resource/upload/media-image',
            uploadPath: '/uploads',
            uploadResize: true,
            imageBasePath: xApp.basePath + '/resources/media',
            imageUploaded: function(imgsrc) {}
        },
        $element = document.querySelector(selector),
        $file = $element.querySelector('input[type="file"]'),
        settings = Object.assign(defaults, config),
        preventDefaults = function(e) {
            e.preventDefault()
            e.stopPropagation()
        },
        highlight = function(e) {
            $element.classList.add('highlight')
        },
        unhighlight = function(e) {
            $element.classList.remove('highlight')
        },
        handleDrop = function(e) {
            const dt = e.dataTransfer,
                files = dt.files
            handleFiles(files)
        },
        handleFiles = function(files) {
            files = [...files]
            initializeProgress(files.length)
            files.forEach(uploadFile)
        },
        uploadFile = function(file, i) {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onloadend = function() {
                const formData = new FormData(),
                    $img = document.createElement('img'),
                    data = { path: settings.uploadPath, resize: settings.uploadResize }
                $img.src = reader.result
                $element.querySelector('.preview').appendChild($img)
                formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }))
                formData.append('image', new Blob([reader.result], { type: 'text/plain;base64' }))

                const xhr = xApp.apiXMLHttpRequest(settings.uploadImageEndPoint, {
                    body: formData,
                    onUploadProgress: (e) => {
                        updateProgress(i, (e.loaded * 100.0 / e.total) || 100)
                    },
                    onFinish: (json) => {
                        settings.imageUploaded(settings.imageBasePath + json.data.path + '/' + json.data.fileName)
                        $img.parentNode.removeChild($img)
                    }
                })
                xhr.send()
                    /*
                                    xApp.apiPost(settings.uploadImageEndPoint, formData).
                                    then(json => {
                                        settings.imageUploaded(settings.imageBasePath + json.data.path + '/' + json.data.fileName)
                                        $img.parentNode.removeChild($img)
                                        progressDone()
                                    })
                    */
            }
        },
        $progressBar = $element.querySelector('.progress-bar'),
        initializeProgress = function(numfiles) {
            $progressBar.value = 0
            uploadProgress = []
            for (let i = numfiles; i > 0; i--) {
                uploadProgress.push(0)
            }
        },
        updateProgress = function(fileNumber, percent) {
            uploadProgress[fileNumber] = percent
            let total = uploadProgress.reduce((tot, curr) => tot + curr, 0) / uploadProgress.length
            $progressBar.value = total
        }

    let uploadProgress = []

    $file.addEventListener('change', function(e) {
        handleFiles(this.files)
    })

    ;
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        $element.addEventListener(eventName, preventDefaults, false)
    })

    ;
    ['dragenter', 'dragover'].forEach(eventName => {
        $element.addEventListener(eventName, highlight, false)
    })

    ;
    ['dragleave', 'drop'].forEach(eventName => {
        $element.addEventListener(eventName, unhighlight, false)
    })
    $element.addEventListener('drop', handleDrop, false)
}