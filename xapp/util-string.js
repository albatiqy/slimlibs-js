import { xApp } from "../xapp.js"

xApp.stringApplyInterpolate = function() {
    String.prototype.interpolate = function(params) {
        const names = Object.keys(params),
        vals = Object.values(params)
        return new Function(...names, `return \`${this}\`;`)(...vals)
    }
}