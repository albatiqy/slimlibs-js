import { xApp } from "../xapp.js"
import "../fetch.js"

xApp.tabulator = function(selector, config) {
    const defaults = {
            inputPath: xApp.path + '/input/',
            deleteEndPoint: this.endPoint,
            deleteError: function(e) {
                if (e.constructor.name == 'ResultException') {
                    switch (e.errType) {
                        case xApp.errTypes.NOT_EXIST:
                            alert("data yang akan dihapus tidak ditemukan", "Error")
                            break
                    }
                }
            },
            deleteConfirm: function(id) {
                return confirm("Yakin akan dihapus?")
            },
        },
        $container = document.querySelector(selector),
        $editBtn = $container.querySelector('[data-tb="btnEdit"]'),
        $deleteBtn = $container.querySelector('[data-tb="btnDelete"]'),
        $fSearch = $container.querySelector('[data-tb="frmSearch"]'),
        $search = ($fSearch!=null?$fSearch.querySelector('input[type="text"]'):null),
        $tb = $container.querySelector('.tb'),
        settings = Object.assign(defaults, config),
        controller = new AbortController(),
        signal = controller.signal,
        tbdef = {
            index: 'id',
            layout: "fitData",
            ajaxURL: settings.endPoint,
            ajaxParams: {},
            ajaxConfig: {
                method: "GET",
                signal: signal
            },
            ajaxFiltering: true,
            ajaxSorting: true,
            ajaxRequestFunc: async function(url, config, params) {
                const q = {
                        length: params.size,
                        page: params.page
                    }
                if ($search!=null) {
                    if ($search.value!='') {
                        q['search'] = encodeURI($search.value)
                    }
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
                let json = null;
                try {
                    json = await xApp.apiGet(url + (p != '' ? '?' + decodeURI(p) : ''))
                    return {
                        last_page: Math.ceil(json.recordsFiltered / params.size), //json.pageCount
                        data: json.data
                    }
                } catch (e) {
                    xApp.notifyError(e)
                }
            },
            pagination: "remote",
            paginationSize: 20,
            placeholder: "No Data Set",
            ajaxError: function(resp) {},
            selectable: false
        },
        tbsettings = Object.assign(tbdef, settings.libSettings),
        table = new Tabulator($tb, tbsettings),
        setOnSelect = function (b) {
            $container.querySelectorAll('[data-tb-onselect="1"]').forEach($v=>{
                switch ($v.nodeName) {
                    case 'INPUT':
                    case 'BUTTON':
                        if (b) {
                            $v.removeAttribute('disabled')
                            $v.classList.remove('disabled')
                        } else {
                            $v.setAttribute('disabled', '')
                            $v.classList.add('disabled')
                        }
                        break
                    case 'A':
                        if (b) {
                            $v.classList.remove('disabled')
                        } else {
                            $v.classList.add('disabled')
                        }
                }
            })
        }
    table.options['rowSelectionChanged'] = function(data, rows) {
        setOnSelect(data.length > 0)
    }
    setOnSelect(false)
    if ($editBtn!=null) {
        $editBtn.addEventListener('click', function(e) {
            e.preventDefault()
            location = '#!' + settings.inputPath + table.getSelectedRows()[0].getData()[tbsettings.index]
        })
    }
    if ($deleteBtn!=null) {
        $deleteBtn.addEventListener('click', function(e) {
            e.preventDefault()
            const id = table.getSelectedRows()[0].getData()[tbsettings.index]
            if (settings.deleteConfirm(id)) {
                xApp.apiDelete(settings.deleteEndPoint + '/' + id, {}) //post and put
                .then(json => {
                    table.replaceData()
                }).catch(error => {
                    settings.deleteError(error)
                })
            }
        })
    }
    if ($search!=null) {
        $fSearch.addEventListener('submit', function(e){
            e.preventDefault()
            table.replaceData()
        })
    }
    return table
}