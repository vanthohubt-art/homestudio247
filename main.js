// Form đặt lịch — bản đầu chưa có máy chủ: soạn sẵn tin nhắn, chép vào bộ nhớ rồi mở Messenger.
// Khi CRM có cơ sở dữ liệu thì thay đoạn gửi bằng lệnh ghi thẳng vào "Khách tiềm năng".
(function () {
  var form = document.getElementById('form-dat-lich');
  if (!form) return;
  var bao = document.getElementById('bao-form');
  var MESSENGER = 'https://m.me/ChupAnhChoBeHomestudio';

  function hien(s) { bao.innerHTML = s; bao.classList.add('hien'); }

  function chep(chu) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(chu).then(function () { return true; }, function () { return false; });
    var t = document.createElement('textarea');
    t.value = chu; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select();
    var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(t);
    return Promise.resolve(ok);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = {};
    new FormData(form).forEach(function (v, k) { d[k] = String(v).trim(); });
    var sdt = d.sdt.replace(/\D/g, '');
    if (!d.ten) { hien('Mẹ điền giúp em tên để em tiện xưng hô ạ.'); form.ten.focus(); return; }
    if (!/^0\d{9}$/.test(sdt)) { hien('Số điện thoại cần đủ 10 số, bắt đầu bằng 0 ạ.'); form.sdt.focus(); return; }
    if (!d.dongy) { hien('Mẹ tích ô đồng ý giúp em để em gọi lại xác nhận lịch ạ.'); form.dongy.focus(); return; }

    var ngay = '';
    if (d.ngay) {
      var p = d.ngay.split('-'), t = new Date(+p[0], +p[1] - 1, +p[2]);
      var THU = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      ngay = THU[t.getDay()] + ' ' + p[2] + '/' + p[1] + '/' + p[0];
    }
    var tin = 'Chào Home Studio, mình muốn giữ lịch chụp:\n' +
      '- Tên: ' + d.ten + '\n- SĐT: ' + sdt + '\n- Muốn chụp: ' + d.hang +
      (d.tuoi ? '\n- Bé: ' + d.tuoi : '') + (ngay ? '\n- Ngày: ' + ngay : '') +
      '\n- Khung giờ: ' + (d.gio || 'chưa chắc, nhờ em tư vấn') +
      (d.ghi ? '\n- Dặn thêm: ' + d.ghi : '');

    chep(tin).then(function (ok) {
      hien(ok
        ? 'Em đã chép sẵn nội dung. Messenger đang mở — mẹ <b>dán vào ô chat rồi gửi</b> là em nhận được ạ.'
        : 'Messenger đang mở. Mẹ nhắn em tên, SĐT ' + sdt + ' và tuổi bé là được ạ.');
      window.open(MESSENGER, '_blank', 'noopener');
    });
  });
})();
