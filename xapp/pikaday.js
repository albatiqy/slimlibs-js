import { xApp } from "../xapp.js"

xApp.pikaday = function(selector, config) {
    const defaults = {

        },
        $element = document.querySelector(selector),
        settings = Object.assign(defaults, config),
        libdef = {
            field: $element,
            defaultDate: new Date(),
            setDefaultDate: true,
            format: 'DD/MM/YYYY',
            i18n: {
                previousMonth : 'Bulan Sebelumnya',
                nextMonth     : 'Bulan Selanjutnya',
                months        : ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'],
                weekdays      : ['Ahad','Senin','Selasa','Rabu','Kamis','Jum\'at','Sabtu'],
                weekdaysShort : ['Ahd','Sen','Sel','Rab','Kam','Jum','Sab']
            }
        },
        libsettings = Object.assign(libdef, settings.libSettings)

        /*
        document.querySelectorAll('.pika-single').forEach($v=>{
            $v.remove()
        })
        */

        $element.setAttribute('autocomplete', 'off')

        const ret = new Pikaday(libsettings)
        xApp.onUnload(()=>{
            ret.destroy()
        })
        return ret
}