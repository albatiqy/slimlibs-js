import { xApp } from "../xapp.js"

xApp.imageCompress = function(base64) {
    const canvas = document.createElement('canvas'),
        img = document.createElement('img')

    return new Promise((resolve, reject) => {
        img.onload = function() {
            let width = img.width,
                height = img.height
            const maxHeight = 800,
                maxWidth = 800

            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height *= maxWidth / width))
                    width = maxWidth
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width *= maxHeight / height))
                    height = maxHeight
                }
            }
            canvas.width = width
            canvas.height = height

            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, width, height)

            resolve(canvas)
        }
        img.onerror = function(err) {
            reject(err)
        }
        img.src = base64
    })
}