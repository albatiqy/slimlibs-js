import{xApp}from"./xapp.js";class HtmlFetchDeps{constructor(){this.scripts=[],this.styles=[]}empty(){for(;0<this.scripts.length;){const b=this.scripts.pop();b.remove()}for(;0<this.styles.length;){const b=this.styles.pop();b.remove()}}pushScript(b){this.scripts.push(b)}pushStyle(b){this.styles.push(b)}}xApp.htmlFetchDeps=function(){return new HtmlFetchDeps};const _layout_loads=xApp.htmlFetchDeps(),_page_loads=xApp.htmlFetchDeps(),_unload_scripts=[],_hashchange_scripts=[],_reg_elements=[];xApp.pageReff=null;let _layout=null;xApp.onUnload=function(b){_unload_scripts.push(b)},xApp.pushRemovedElements=function(b){_reg_elements.push(b)},xApp.installScripts=function(...f){return new Promise((a,g)=>{const c=function(){if(0<f.length){const a=document.createElement("script"),b=f.shift();a.type="text/javascript",a.onload=c,a.onerror=g,a.src=b,document.head.appendChild(a),_page_loads.pushScript(a)}else a()};c()})},xApp.installStyles=function(...f){return new Promise((a,g)=>{const c=function(){if(0<f.length){const a=document.createElement("link"),b=f.shift();a.onerror=g,a.href=b,a.rel="stylesheet",document.head.appendChild(a),_page_loads.pushStyle(a),c()}else a()};c()})},xApp.onHashchange=function(b){_hashchange_scripts.push(b),addEventListener("hashchange",b)},xApp.block=function(){let d=document.querySelector(".xapp-overlay");const e=document.body;if(null!=d)d.setAttribute("aria-hidden",!1);else{let a=document.createElement("div");a.innerHTML="<section class=\"xapp-overlay\" aria-hidden=\"false\"><div></div></section>",d=a.firstElementChild,e.appendChild(d),a=null}e.classList.add("xapp-noscroll"),d.scrollTop=0},xApp.unblock=function(){let b=document.querySelector(".xapp-overlay");null!=b&&(b.setAttribute("aria-hidden",!0),document.body.classList.remove("xapp-noscroll"))};function installLoads(l,m,n,c){const b=l.querySelectorAll("link[rel=\"stylesheet\"], style"),d=b.length,e=function(a,b,c){let d,e=!0;if(a.href?(d=document.createElement("link"),d.onload=c,d.onerror=c,d.href=a.href,d.rel=a.rel):a.hasAttribute("data-xapp")?"scoped"==a.getAttribute("data-xapp")&&(e=!1):(d=document.createElement("style"),a.type&&(d.type=a.type),d.textContent=a.innerText),e){if(a.hasAttribute("data-xapp-up")){const b=document.head.querySelectorAll("link[rel=stylesheet]"),c=parseInt(a.getAttribute("data-xapp-up"),10);c<b.length&&0<c?document.head.insertBefore(d,b[b.length-c]):document.head.appendChild(d)}else document.head.appendChild(d);b.pushStyle(d),a.parentNode.removeChild(a)}a.href||c()},g=function(d,a,b){"undefined"==typeof b&&(b=0),d[b](function(){b++,b===d.length?a():g(d,a,b)})},h=function(){const a=document.createEvent("Event");a.initEvent("DOMContentLoaded",!0,!0),document.dispatchEvent(a),c(),l=null},f=function(e,a,b){const c=document.createElement("script");e.type&&(c.type=e.type),e.src?(c.onload=b,c.onerror=b,c.src=e.src):c.textContent=e.innerText,document.head.appendChild(c),a.pushScript(c),e.parentNode.removeChild(e),e.src||b()},i=function(){l.childNodes.forEach(b=>{1==b.nodeType&&"SCRIPT"!=b.nodeName&&m.appendChild(b)});const a=l.querySelectorAll("script"),b=[];[].forEach.call(a,function(c){b.push(function(a){f(c,n,a)})}),0<b.length?g(b,h):(c(),l=null)};if(0<d){let c=0;[].forEach.call(b,function(a){e(a,n,function(){c++,c==d&&i()})})}else i()}xApp.loadPage=function(h,i,b,c){const d={Accept:"text/html"},a=xApp.getCookie("access_token"),e=xApp.basePath+h;null!=a&&(d.Authorization="Bearer "+a),fetch(e,{headers:d}).then(b=>{if(!!b.ok)return b.text();return 401==b.status?xApp.refreshToken(async()=>{d.Authorization="Bearer "+xApp.getCookie("access_token");const b=await fetch(e,{headers:d});return b.text()}).catch(()=>(xApp.pageReff=location.hash,void(location="#!/login"))):void c(null,"")}).then(d=>{const a=document.createElement("div"),e=document.querySelector(i);a.innerHTML=d;let f=null,j=a.firstElementChild;if(j.hasAttribute("id"))f=j.id;else for(;null!=j.nextElementSibling;)if(j=j.nextElementSibling,j.hasAttribute("id")){f=j.id;break}installLoads(a,e,b,function(){c(e,f)})}).catch(()=>{c(null,"")})};const route=function(){let e=location.hash.split("?"),a=e[0].match(/^#!((?:\/[a-zA-Z0-9]+(?:_[a-zA-Z0-9]+)*(?:\-[a-zA-Z0-9]+)*)+)$/),f=null==a?"":a[1];if(""!=f){let g=2==e.length?e[1]:"",a=function(){let c={};if(""!=g&&null!=g.match(/^(([a-zA-Z0-9_]+\=[a-zA-Z0-9_]*)+?(?:\&[a-zA-Z0-9_]+\=[a-zA-Z0-9_]*)*)$/)){let a=g.split("&");a.forEach(a=>{a=a.split("="),c[a[0]]=decodeURI(a[1]||"")})}xApp.query=c};if("undefined"!=typeof xApp.path&&f!==xApp.path||"undefined"==typeof xApp.path){const c=document.querySelector(xApp.appSelector),d=xApp.basePath+xApp.routerBasePath+"/pages"+f;xApp.query={},xApp.reloadPage=function(){const b={Accept:"text/html"},f=xApp.getCookie("access_token");null!=f&&(b.Authorization="Bearer "+f);const c=new Request(d,{headers:b});for(xApp.block();0<_unload_scripts.length;){const b=_unload_scripts.pop();b()}for(;0<_hashchange_scripts.length;){const b=_hashchange_scripts.pop();removeEventListener("hashchange",b)}fetch(c).then(a=>a.ok?a.text():401==a.status?xApp.refreshToken(async()=>{b.Authorization="Bearer "+xApp.getCookie("access_token");const a=await fetch(d,{headers:b}).catch(()=>(xApp.pageReff=location.hash,void(location="#!/login")));return a.text()}).catch(()=>(xApp.pageReff=location.hash,void(location="#!/login"))):a.text()).then(d=>{const f=document.createElement("div");f.innerHTML=d;const b=f.querySelector("[data-layout]");let g="";for(null!=b&&(g=b.dataset.layout),_page_loads.empty();0<_reg_elements.length;){const b=_reg_elements.pop();b.parentNode.removeChild(b)}if(""!=g){const e=function(){const b=document.querySelector(xApp.pageSelector);for(;b.hasChildNodes();)b.removeChild(b.lastChild);installLoads(f,b,_page_loads,function(){a(),xApp.unblock()})};_layout==g?e():fetch(xApp.basePath+xApp.routerBasePath+"/layout/"+g,{headers:{Accept:"text/html"}}).then(b=>b.text()).then(a=>{const b=document.createElement("div");b.innerHTML=a,_layout_loads.empty();const c=document.querySelector(xApp.appSelector);for(;c.hasChildNodes();)c.removeChild(c.lastChild);installLoads(b,c,_layout_loads,e),_layout=g}).catch(b=>{xApp.notifyError(b)})}else{_layout_loads.empty();const b=document.querySelector(xApp.appSelector);for(;b.hasChildNodes();)b.removeChild(b.lastChild);installLoads(f,b,_layout_loads,function(){a(),_layout=null,xApp.unblock()})}}).catch(b=>{xApp.notifyError(b)})},xApp.reloadPage()}else a()}else location="#!/default";xApp.path=f};addEventListener("hashchange",route),route();