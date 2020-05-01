import { xApp } from "../xapp.js"
import "./comdialog.js"

class ImgBrowser {
    constructor(selector, config) {
        const defaults = {
                imageClick: function(src) {},
                moreDialogPath: '/media/browser-dlg',
                listEndPoint: '',
                imgClass: 'c-hand',
                imageBasePath: xApp.basePath + '/resources/media'
            },
            settings = Object.assign(defaults, config),
            $element = document.querySelector(selector),
            $imgContainerDiv = $element.querySelector('.xapp-imglist > div'),
            $imgMoreBtn = $element.querySelector('a.xapp-imgmore')
        $imgMoreBtn.addEventListener('click', e => {
            e.preventDefault()
            xApp.comdialog({
                path: settings.moreDialogPath,
                onSubmit: function(event, data) {
                    switch (event) {
                        case 'file':
                            settings.imageClick(settings.imageBasePath + data)
                    }
                },
                dialogParams: {
                    filter: 'image'
                }
            })
        })
        this.settings = settings
        this.$imgContainerDiv = $imgContainerDiv
        xApp.apiGet(settings.listEndPoint)
            .then(json => {
                json.data.forEach(v => {
                    const $img = document.createElement('img'),
                        imgsrc = settings.imageBasePath + v
                    $img.src = imgsrc
                    $img.classList.add(settings.imgClass) // <=== keluarkan
                    $img.addEventListener('click', e => {
                        settings.imageClick(imgsrc)
                    })
                    $imgContainerDiv.appendChild($img)
                })
            }).catch(error => {})
    }

    append(imgsrc) {
        const $img = document.createElement('img')
        $img.src = imgsrc
        $img.classList.add(this.settings.imgClass) // <=== keluarkan
        $img.addEventListener('click', e => {
            this.settings.imageClick(imgsrc)
        })
        this.$imgContainerDiv.insertBefore($img, this.$imgContainerDiv.firstChild);
    }
}

xApp.imgbrowser = function(selector, config) {
    return new ImgBrowser(selector, config)
}