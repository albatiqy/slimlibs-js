import { xApp } from "../xapp.js"

const INPUT_FORMAT = 'YYYY-MM-DD HH:mm:ss',
    $bulan = ["","Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"],
    $hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu"];

xApp.dateRangeFormat = function($date1, $date2, $separator = null, $input_format = null) {
    if ($separator == null) {
        $separator = ' s.d. ';
    }
    if ($input_format == null) {
        $input_format = INPUT_FORMAT;
    }
    if (!$date1||!$date2) {
        if (!$date2) {
            $date2 = $date1;
        } else {
            $date1 = $date2;
        }
    }
    const $src_mulai = moment($date1, INPUT_FORMAT),
    $src_selesai = moment($date2, INPUT_FORMAT);
    if ($src_mulai > $src_selesai) {
        let $tmp = $src_selesai;
        $src_selesai = $src_mulai;
        $src_mulai = $tmp;
    }
    const $arr_mulai = [$src_mulai.format("D"), $src_mulai.format("M"), $src_mulai.format("YYYY")],
    $arr_selesai = [$src_selesai.format("D"), $src_selesai.format("M"), $src_selesai.format("YYYY")];
    let $rentang_tanggal = '';
    if ($arr_mulai[2] != $arr_selesai[2])
        $rentang_tanggal = $arr_mulai[0]+' '+$bulan[$arr_mulai[1]]+' '+$arr_mulai[2]+$separator+$arr_selesai[0]+' '+$bulan[$arr_selesai[1]]+' '+$arr_selesai[2];
    else if ($arr_mulai[1] != $arr_selesai[1])
        $rentang_tanggal = $arr_mulai[0]+' '+$bulan[$arr_mulai[1]]+$separator+$arr_selesai[0]+' '+$bulan[$arr_selesai[1]]+' '+$arr_selesai[2];
    else if ($arr_mulai[0] != $arr_selesai[0])
        $rentang_tanggal = $arr_mulai[0]+$separator+$arr_selesai[0]+' '+$bulan[$arr_selesai[1]]+' '+$arr_selesai[2];
    else
        $rentang_tanggal = $arr_selesai[0]+' '+$bulan[$arr_selesai[1]]+' '+$arr_selesai[2];
    return $rentang_tanggal;
}

xApp.timeRangeFormat = function($date1, $date2, $input_format = null) {
    if ($input_format == null) {
        $input_format = INPUT_FORMAT;
    }
    if (!$date1||!$date2) {
        if (!$date2) {
            $date2 = $date1;
        } else {
            $date1 = $date2;
        }
    }
    const $src_mulai = moment($date1, INPUT_FORMAT),
    $src_selesai = moment($date2, INPUT_FORMAT);
    if ($src_selesai < $src_mulai) {
        let $tmp = $src_mulai;
        $src_mulai = $src_selesai;
        $src_selesai = $tmp;
    }
    const $arr_mulai = [$src_mulai.format("D"), $src_mulai.format("M"), $src_mulai.format("YYYY")],
    $arr_selesai = [$src_selesai.format("D"), $src_selesai.format("M"), $src_selesai.format("YYYY")];
    let $rentang_tanggal = '';
    if ($src_mulai.format("YYYY-M-D")==$src_selesai.format("YYYY-M-D")) {
        if ($src_mulai.format("HH:mm")==$src_selesai.format("HH:mm")) {
            $rentang_tanggal = $hari[$src_mulai.format("e")]+' '+$arr_mulai[0]+' '+$bulan[$arr_mulai[1]]+' '+$arr_mulai[2]+', pukul '+$src_selesai.format("HH:mm")+' WIB';
        } else {
            $rentang_tanggal = $hari[$src_mulai.format("e")]+' '+$arr_mulai[0]+' '+$bulan[$arr_mulai[1]]+' '+$arr_mulai[2]+', pukul '+$src_mulai.format("HH:mm")+' s.d. '+$src_selesai.format("HH:mm")+' WIB';
        }
    } else {
        $rentang_tanggal = $hari[$src_mulai.format("e")]+' '+$arr_mulai[0]+' '+$bulan[$arr_mulai[1]]+' '+$arr_mulai[2]+' pukul '+$src_mulai.format("HH:mm")+' WIB s.d. '+$hari[$src_selesai.format("e")]+' '+$arr_selesai[0]+' '+$bulan[$arr_selesai[1]]+' '+$arr_selesai[2]+' pukul '+$src_selesai.format("HH:mm")+' WIB';
    }
    return $rentang_tanggal;
}
