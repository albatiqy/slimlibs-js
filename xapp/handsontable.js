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
                    if (json.data.results.length > 0) {
                        let err = '<ul>'
                        const invalidCells = []
                        json.data.results.forEach((v,k)=>{
                            const index_ref=parseInt(v.index_ref, 10)
                            for (const x in v.errors) {
                                v.errors[x].forEach((v1,k1)=>{
                                    err += '<li>baris ke ' + (index_ref + 1) + ': ' + v1 + '</li>'
                                })
                            }
                            if (Object.keys(v.errors).length > 0) {
                                const cp = hot.getCellMetaAtRow(index_ref)
                                cp.forEach((v1)=>{
                                    v1.valid = false
                                    invalidCells.push(v1)
                                })
                            }
                            var hupd = hot.getSourceDataAtRow(index_ref)
                            for (const y in v.updates) {
                                if (isNaN(hot.propToCol(y))) {
                                    hupd[y] = v.updates[y]
                                } else {
                                    hot.setDataAtRowProp(index_ref, y, v.updates[y], 'update1')
                                }
                            }
                        })
                        err += '</ul>'
                        hot.render()
                        /*
                        invalidCells.forEach(v1=>{
                            v1.valid = true
                        })
                        */
                    }
                }).catch(error => {
                })
            }
        },
        libsettings = Object.assign(libdef, settings.libSettings),
        layout =
`<div class="row justify-content-end">
    <div class="col">
    <label class="badge badge-danger d-none" data-xapp="ht-errors">error</label>
    </div>
    <div class="col-xs-8 col-sm-6 col-md-4 text-right">
        <form data-xapp="ht-search">
        <input type="search" class="form-control input-sm" placeholder="Cari">
        <button type="submit" class="d-none"></button>
        </form>
    </div>
</div>
<div class="table-responsive scroll-container mt-3" data-xapp="ht-table">
</div>
<div class="row justify-content-end">
    <div class="col-xs-12 col-sm-8 col-md-6 mt-3" data-xapp="ht-paging">
    </div>
</div>
`,
        $htContainer = document.createElement('div')

        $element.insertAdjacentHTML('beforeEnd', layout)
        $element.querySelector('[data-xapp="ht-table"]').appendChild($htContainer)

        const $searchForm = $element.querySelector('[data-xapp="ht-search"]'),
        $pagingContainer = $element.querySelector('[data-xapp="ht-paging"]'),
        $searchInput = $searchForm.querySelector('input'),
        createPaging = function(current, lastPage) {
/*
            `<ul class="pagination">
            <li class="page-item">
                <a class="page-link" href="#" aria-label="Previous">
                    <span aria-hidden="true">«</span>
                    <span class="sr-only">Previous</span>
                </a>
            </li>
            <li class="page-item"><a class="page-link" href="#">1</a></li>
            <li class="page-item active"><a class="page-link" href="#">2</a></li>
            <li class="page-item"><a class="page-link" href="#">3</a></li>
            <li class="page-item">
                <a class="page-link" href="#" aria-label="Next">
                    <span aria-hidden="true">»</span>
                    <span class="sr-only">Next</span>
                </a>
            </li>
        </ul>`
*/
            if ($pagingContainer.firstElementChild!=null) {
                $pagingContainer.firstElementChild.remove()
            }
            $pagingContainer.innerHTML = '<ul class="pagination float-right"></ul>'
            for (let z=1;z<=lastPage;z++) {
                let $ln = document.createElement('div')
                if (current==z) {
                    $ln.innerHTML = '<li class="page-item active"><a class="page-link" href="javascript:;">'+z+'</a></li>'
                    $ln = $ln.firstElementChild
                } else {
                    $ln.innerHTML = '<li class="page-item"><a class="page-link" href="javascript:;">'+z+'</a></li>'
                    $ln = $ln.firstElementChild
                    $ln.firstElementChild.addEventListener('click', e=>{
                        e.preventDefault()
                        doRequest({page: z, sorters: []})
                    })
                }
                $pagingContainer.firstElementChild.appendChild($ln)
            }
        },
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
                createPaging(params.page, Math.ceil(json.recordsFiltered / settings.pageSize))

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
        xApp.onUnload(() => {
            hot.destroy()
        })
        return hot
}