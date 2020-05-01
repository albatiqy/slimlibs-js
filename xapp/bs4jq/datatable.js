import { xApp } from "../../xapp.js"
import "../../fetch.js"
import "./dialog.js"
import "./msgbox.js"
import "./toast.js"

xApp.datatable = function(selector, config) {
    const defaults = {
            defaultButtons: true,
            primaryKey: 'id',
            buttons: [],
            callback: function($table) {}
        },
        settings = Object.assign(defaults, config),
        default_buttons = [{
                name: "edit",
                text: "Edit",
                className: "btn btn-primary btn-sm",
                action: function(e, dt, node, config) {
                    xApp.dialog({
                        url: settings.dialogInputUrl + '/' + $element.row({ selected: true }).data()[settings.primaryKey],
                        submitSuccess: function(json) {
                            $element.ajax.reload()
                            xApp.toastSuccess("data berhasil diupdate", "info")
                            if (typeof settings.dialogInputUpdateSuccess == 'function') {
                                settings.dialogInputUpdateSuccess(json) // (json)
                            }
                        }
                    })
                },
                enabled: false
            },
            {
                name: "delete",
                text: "Hapus",
                className: "btn btn-primary btn-sm",
                action: function(e, dt, node, config) {
                    xApp.msgboxDanger("Yakin akan dihapus?", function() {
                        xApp.block()
                        xApp.apiDelete(settings.endPoint + '/' + $element.row({ selected: true }).data()[settings.primaryKey]) //post and put
                            .then(json => {
                                $element.ajax.reload()
                                xApp.unblock()
                                xApp.toastSuccess("data berhasil dihapus", "info")
                            }).catch(error => {
                                xApp.unblock()
                                if (error.constructor.name == 'ResultException') {
                                    switch (error.errType) {
                                        case xApp.errTypes.NOT_EXIST:
                                            xApp.msgboxDangerAlert("data yang akan dihapus tidak ditemukan", "Error")
                                            break
                                    }
                                }
                            })
                    })
                },
                enabled: false
            },
            {
                name: "add",
                text: "Baru",
                className: "btn btn-primary btn-sm",
                action: function(e, dt, node, config) {
                    xApp.dialog({
                        url: settings.dialogInputUrl,
                        submitSuccess: function(json) {
                            $element.ajax.reload()
                            xApp.toastSuccess("data berhasil ditambahkan", "info")
                            if (typeof settings.dialogInputCreateSuccess == 'function') {
                                settings.dialogInputCreateSuccess(json) // (json)
                            }
                        }
                    })
                }
            }
        ]
    let btn_render = []
    if (settings.defaultButtons) {
        btn_render = default_buttons.concat(settings.buttons)
    } else {
        btn_render = settings.buttons
    }
    const tbdef = {
            dom: "<'row'<'col-sm-12 col-md-2'l><'col-sm-12 col-md-4'B><'col-sm-12 col-md-6'f>>" +
                "<'row'<'col-sm-12'tr>>" +
                "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            processing: true,
            serverSide: true,
            select: {
                style: "single",
                blurable: true
            },
            buttons: btn_render,
            ajax: function(data, callback, setting) {
                const params = {
                    length: data.length,
                    page: Math.ceil(data.start / data.length) + 1
                }
                if (data.search.value != "") {
                    params['search'] = encodeURI(data.search.value)
                }
                data.order.forEach((v, k) => {
                    params['orders[' + k + '][dir]'] = v.dir
                    params['orders[' + k + '][column]'] = data.columns[v.column].data
                })
                let z = 0
                data.columns.forEach((v, k) => {
                    if (v.searchable && v.search.value != "") {
                        params['filters[' + z + '][column]'] = v.data
                        params['filters[' + z + '][type]'] = 'like'
                        params['filters[' + z + '][value]'] = encodeURI(v.search.value)
                    }
                    z++
                })

                const q = new URLSearchParams(params).toString()
                xApp.apiGet(settings.endPoint + (q != '' ? '?' + decodeURI(q) : ''))
                    .then(json => {
                        callback({
                            draw: data.draw,
                            recordsTotal: json.recordsTotal,
                            recordsFiltered: json.recordsFiltered,
                            data: json.data
                        })
                    })
            }
        },
        tbsettings = Object.assign(tbdef, settings.libSettings),
        $element = $(selector).DataTable(tbsettings)
    $element.buttons().container().addClass("btn-group")
    $element.on('select deselect draw', function() {
        let selectedRows = $element.rows({ selected: true }).count()
        $element.button("delete:name").enable(selectedRows === 1)
        $element.button("edit:name").enable(selectedRows === 1)
    })
    settings.callback($element)
}