import { xApp } from "../xapp.js"
import "../fetch.js"

xApp.handsontable = function(selector, config) {
    const defaults = {
            primaryKey: null,
            pageSize: 50
        },
        $element = document.querySelector(selector),
        settings = Object.assign(defaults, config),
        libdef = {
            data: [],
            minSpareRows: 1,
            rowHeaders: false,
            outsideClickDeselects: false,
            fillHandle: false,
            manualColumnResize: true,
            afterChange: function (change, source) {
                if (source === 'loadData' || source === 'update1') {
                    return //don't save this change
                }
                const rows = [],
                    rowsz = {}
                for (const i in change) {
                    if (rows.indexOf(change[i][0]) === -1) {
                        rows.push(change[i][0])
                        rowsz[change[i][0]] = {}
                    }
                    rowsz[change[i][0]][change[i][1]] = change[i][3]
                }
                const dta = []
                for (const i in rowsz) {
                    const atc = hot.getSourceDataAtRow(i)
                    if ('undefined' == typeof atc[settings.primaryKey]) {
                        rowsz[i][settings.primaryKey] = null
                    } else {
                        rowsz[i][settings.primaryKey] = atc[settings.primaryKey]
                    }
                    rowsz[i]['index_ref'] = i
                    dta.push(rowsz[i])
                }
                xApp.apiPost(settings.updateEndPoint, dta)
                .then(json => {
                    //console.log(json)
                }).catch(error => {
                })
            }
        },
        libsettings = Object.assign(libdef, settings.libSettings),
        layout =
`<div class="row justify-content-end">
    <div class="col-xs-8 col-sm-6 col-md-4 text-right">
        <form data-xapp="ht-search">
        <input type="search" class="form-control input-sm" placeholder="Cari">
        <button type="submit" class="d-none"></button>
        </form>
    </div>
</div>
<div class="row mt-3">
<div class="col-xs-12 col-sm-12">
    <div class="" data-xapp="ht-table">
    </div>
</div>
</div>
<div class="row justify-content-end">
    <div class="col-xs-12 col-sm-8 col-md-6 text-right">

    </div>
</div>
`,
        $htContainer = document.createElement('div')

        $element.insertAdjacentHTML('beforeEnd', layout)
        $element.querySelector('[data-xapp="ht-table"]').appendChild($htContainer)

        const $searchForm = $element.querySelector('[data-xapp="ht-search"]'),
        $searchInput = $searchForm.querySelector('input'),
        doRequest = function(params) {
            const q = {
                    length: settings.pageSize,
                    page: params.page
                }
            if ($searchInput.value!='') {
                q['search'] = encodeURI($searchInput.value)
            }

            params['sorters'].forEach((v, k) => {
                q['orders[' + k + '][dir]'] = v.dir
                q['orders[' + k + '][column]'] = v.field
            })
            /*
            let z = 0
            data.columns.forEach((v, k) => {
                if (v.searchable && v.search.value != "") {
                    params['filters[' + z + '][column]'] = v.data
                    params['filters[' + z + '][type]'] = 'like'
                    params['filters[' + z + '][value]'] = encodeURI(v.search.value)
                }
                z++
            })
            */
            const p = new URLSearchParams(q).toString()

            xApp.apiGet(settings.loadEndPoint + (p != '' ? '?' + decodeURI(p) : ''))
            .then(json => {
                hot.loadData(json.data)

/*

                callback({
                    draw: data.draw,
                    recordsTotal: json.recordsTotal,
                    recordsFiltered: json.recordsFiltered,
                    data: json.data
                })

                    last_page: Math.ceil(json.recordsFiltered / params.size), //json.pageCount
                    data: json.data

*/

            })
            .catch(e=>{
            })
        },
        hot = new Handsontable($htContainer, libsettings)

        $searchForm.addEventListener('submit', e=>{
            e.preventDefault()
            doRequest({page: 1, sorters: []})
        })

        doRequest({page: 1, sorters: []})
        return hot

}