// Form đặt lịch — bản đầu chưa có máy chủ: soạn sẵn tin nhắn, chép vào bộ nhớ rồi mở Messenger.
// Khi CRM có cơ sở dữ liệu thì thay đoạn gửi bằng lệnh ghi thẳng vào "Khách tiềm năng".
(function () {
  var form = document.getElementById('form-dat-lich');
  if (!form) return;
  var bao = document.getElementById('bao-form');
  var MESSENGER = 'https://m.me/ChupAnhChoBeHomestudio';

  function hien(s) { bao.innerHTML = s; bao.classList.add('hien'); }

  // Bấm "Tư vấn gói này" ở bảng giá → index.html?goi=Baby%203#dat-lich: chọn sẵn hạng mục + ghi tên gói.
  var goi = '';
  try { goi = (new URLSearchParams(location.search).get('goi') || '').slice(0, 40); } catch (e) {}
  if (goi) {
    var HANG = [
      [/^(newborn|sơ sinh)/i, 'Newborn'],
      [/^(baby|concept bé|thời trang|concept mầm non)/i, 'Chụp riêng bé'],
      [/^(family|gia đình|mẹ và bé)/i, 'Bé và gia đình'],
      [/^(silver|gold|diamond|không ảnh phóng)/i, 'Đại gia đình'],
      [/./, 'Khác (bầu, thời trang, ảnh thẻ…)']
    ];
    for (var i = 0; i < HANG.length; i++) if (HANG[i][0].test(goi)) { form.hang.value = HANG[i][1]; break; }
    var dauForm = form.querySelector('.dau-form span:not(.so-form)');
    if (dauForm) dauForm.textContent = 'Mẹ đang hỏi gói ' + goi + '. Em gọi lại xác nhận ngày giờ trước khi giữ chỗ.';
  }

  // ── LỊCH TRỐNG (12/11/2026): đọc lịch Google của studio qua Apps Script lich-agent (chỉ Trống/Còn 1/Kín, không có tên khách).
  // Chưa có địa chỉ hoặc gọi hỏng ⇒ vẫn chọn được ngày + giờ, em xác nhận khi gọi lại.
  var LICH_URL = 'https://script.google.com/macros/s/AKfycbwF7bNcWkyWx-J_8gD-ugVWVwJQh_3mpjajljRekjOgZ2f0nVsMAPlFZ-dbhKiZID7z/exec';
  if (location.hostname === 'localhost' && /[?&]lichthu/.test(location.search)) LICH_URL = '_mau/lich-thu.json';
  var daiNgay = document.getElementById('dai-ngay');
  var oNgay = form.querySelector('input[name=ngay]');
  var radioGio = [].slice.call(form.querySelectorAll('input[name=gio]'));
  var TEN_TT = { trong: 'Trống', con1: 'Còn 1 chỗ', kin: 'Kín', qua: 'Đã qua' };
  var lich = null;

  function ngayTuDung(soNgay) {   // dự phòng: tự sinh ngày, không có trạng thái
    var THU = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'], ra = [], d = new Date();
    for (var i = 0; i < soNgay; i++) {
      var t = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
      var iso = t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2);
      ra.push({ d: iso, thu: THU[t.getDay()], gio: null });
    }
    return ra;
  }
  function veNgay(ds) {
    daiNgay.innerHTML = ds.map(function (n, i) {
      var p = n.d.split('-'), het = n.gio && n.trong === 0;
      var daQua = n.gio && Object.keys(n.gio).every(function (k) { return n.gio[k] === 'qua'; });
      var nhan = !n.gio ? '' : daQua ? 'Hết giờ' : het ? 'Kín' : 'Còn ' + n.trong + ' giờ';
      return '<button type="button" class="o-ngay' + (het ? ' het' : '') + '" data-i="' + i + '" aria-pressed="false">' +
        '<span>' + (i === 0 ? 'Hôm nay' : i === 1 ? 'Mai' : n.thu) + '</span><b>' + +p[2] + '</b><small>' + (nhan || 'Th' + +p[1]) + '</small></button>';
    }).join('');
  }
  function chonNgay(i) {
    var n = lich[i];
    oNgay.value = n.d;
    [].forEach.call(daiNgay.children, function (b, j) { b.setAttribute('aria-pressed', j === i); });
    radioGio.forEach(function (r) {
      var tt = n.gio ? n.gio[r.value] : '', nhan = r.nextElementSibling.querySelector('small');
      var khoa = tt === 'kin' || tt === 'qua';
      r.disabled = khoa; if (khoa) r.checked = false;
      r.parentNode.className = tt ? 'tt-' + tt : '';
      nhan.textContent = tt ? TEN_TT[tt] : '';
    });
  }
  daiNgay.addEventListener('click', function (e) {
    var b = e.target.closest('.o-ngay'); if (b) chonNgay(+b.dataset.i);
  });
  function dungLich(ds, coTrangThai) {
    lich = ds; veNgay(ds);
    document.getElementById('chu-thich-lich').hidden = !coTrangThai;
    var dau = 0;
    if (coTrangThai) for (var i = 0; i < ds.length; i++) if (ds[i].trong > 0) { dau = i; break; }
    chonNgay(dau);
  }
  dungLich(ngayTuDung(21), false);
  if (LICH_URL && window.fetch) {
    var hetGio = new Promise(function (_, loi) { setTimeout(function () { loi(new Error('chậm')); }, 9000); });
    Promise.race([fetch(LICH_URL).then(function (r) { return r.json(); }), hetGio]).then(function (kq) {
      if (kq && kq.ngay && kq.ngay.length) dungLich(kq.ngay, true);
    }).catch(function () { /* giữ bản dự phòng */ });
  }

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
      '- Tên: ' + d.ten + '\n- SĐT: ' + sdt + '\n- Muốn chụp: ' + d.hang + (goi ? '\n- Gói quan tâm: ' + goi : '') +
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

// Mở trang kèm #dat-lich / #chon-lich (từ Bảng giá, Album): trình duyệt điện thoại hay nhảy trước khi ảnh và lịch tải xong rồi đứng ở đầu trang ⇒ cuộn lại khi trang tải xong.
window.addEventListener('load', function () {
  var id = location.hash.slice(1), el = id && document.getElementById(id);
  if (el && Math.abs(el.getBoundingClientRect().top) > 150) el.scrollIntoView({ block: 'start', behavior: 'instant' });
});
