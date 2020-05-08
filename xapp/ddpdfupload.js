import { xApp } from "../xapp.js"

xApp.ddpdfupload = function(selector, config) {
    const defaults = {
            uploadEndPoint: '/api/v0/resource/upload/pdf',
            uploadPath: '/uploads', // <== NOT USED
            fileUploaded: function(filename) {}
        },
        $element = document.querySelector(selector),
        $file = $element.querySelector('input[type="file"]'),
        multiple = $file.hasAttribute('multiple'),
        $thumb = $element.querySelector('.xapp-thumbnail'),
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
            const formData = new FormData(),
                url = URL.createObjectURL(file)
            makeThumb(url).then($canvas => {
                while ($thumb.hasChildNodes()) {
                    $thumb.removeChild($thumb.lastChild)
                }
                const imgUrl = $canvas.toDataURL("image/png"),
                    $img = document.createElement('img'),
                    data = { path: settings.uploadPath }
                $img.src = imgUrl
                $thumb.appendChild($img)
                formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }))
                formData.append('pdf', file)

                const xhr = xApp.apiXMLHttpRequest(settings.uploadEndPoint, {
                    body: formData,
                    onUploadProgress: (e) => {
                        updateProgress(i, (e.loaded * 100.0 / e.total) || 100)
                    },
                    onFinish: (json) => {
                        settings.fileUploaded(json.data.fileName)
                    }
                })
                xhr.send()
            })
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
        },
        makeThumb = function(url) {
            return pdfjsLib.getDocument({ url }).promise.then(doc => {
                return doc.getPage(1).then(page => {
                    // draw page to fit into 96x96 canvas
                    const vp = page.getViewport({ scale: 1 }),
                        $canvas = document.createElement("canvas")
                    $canvas.height = 500
                    const scale = $canvas.height / vp.height
                    $canvas.width = (vp.width / vp.height * $canvas.height)
                    return page.render({ canvasContext: $canvas.getContext("2d"), viewport: page.getViewport({ scale }) }).promise.then(function() {
                        return $canvas
                    })
                })
            }).catch(console.error)
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