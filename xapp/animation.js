import { xApp } from "../xapp.js"

xApp.fadeIn = function($el, speed, next) {
    let last = +new Date()
    const tick = function () {
            $el.style.opacity = +$el.style.opacity + (new Date() - last) / speed
            last = +new Date()

            if (+$el.style.opacity < 1) {
                requestAnimationFrame(tick)
            } else if (next) {
                next.call($el)
            }
        };

    $el.style.opacity = 0
    tick()
}