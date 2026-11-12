// Trang Album ảnh — dữ liệu ở album/du-lieu.js (sinh bởi sinh-album.py).
// Địa chỉ bo-anh.html#so-sinh-gai mở thẳng một album, gửi link cho khách được.
(function () {
  var A = window.ALBUM || [];
  var $ = function (id) { return document.getElementById(id); };
  var luoiAlbum = $('luoi-album'), luoiAnh = $('luoi-anh'), ds = $('ds-album'), tim = $('tim');
  var nhomDangChon = 'Tất cả', dangXem = null, viTri = 0;
  var tong = A.reduce(function (s, a) { return s + a.anh.length; }, 0);

  function bo(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase(); }
  function src(a, t) { return 'album/' + a.ma + '/' + t[0]; }
  function hop(a) {
    var q = bo(tim.value.trim());
    return (nhomDangChon === 'Tất cả' || a.nhom === nhomDangChon) && (!q || bo(a.ten).indexOf(q) >= 0);
  }

  // nhóm lọc
  var NHOM = ['Tất cả'];
  A.forEach(function (a) { if (NHOM.indexOf(a.nhom) < 0) NHOM.push(a.nhom); });
  $('loc-nhom').innerHTML = NHOM.map(function (n) {
    return '<button role="tab" data-nhom="' + n + '"' + (n === 'Tất cả' ? ' aria-selected="true"' : '') + '>' + n + '</button>';
  }).join('');
  $('loc-nhom').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    nhomDangChon = b.dataset.nhom;
    [].forEach.call(this.children, function (x) { x.setAttribute('aria-selected', x === b); });
    if (dangXem) location.hash = ''; else ve();
  });
  tim.addEventListener('input', function () { if (dangXem) location.hash = ''; else ve(); });

  function ve() {
    var hien = A.filter(hop);
    ds.innerHTML = hien.map(function (a) {
      return '<li><a href="#' + a.ma + '"' + (dangXem === a ? ' aria-current="true"' : '') + '><span>' + a.ten + '</span><small>' + a.anh.length + '</small></a></li>';
    }).join('') || '<li class="trong">Chưa có album khớp.</li>';
    if (dangXem) return;
    $('ten-album').textContent = 'Tất cả album';
    $('so-anh').textContent = tong + ' ảnh';
    $('nut-lui').hidden = true; $('nut-tu-van').hidden = true;
    luoiAnh.hidden = true; luoiAlbum.hidden = false;
    luoiAlbum.innerHTML = hien.map(function (a) {
      var bia = a.anh.slice(0, 1);
      return '<a class="the-album" href="#' + a.ma + '"><div class="ghep g' + bia.length + '">' +
        bia.map(function (t) { return '<img loading="lazy" src="' + src(a, t) + '" alt="">'; }).join('') +
        '</div><div class="nhan-album"><b>' + a.ten + '</b><span>' + a.anh.length + ' ảnh</span></div></a>';
    }).join('') || '<p class="trong">Chưa có album khớp. Mẹ thử từ khác ạ.</p>';
  }

  function moAlbum(a) {
    dangXem = a; ve();
    $('ten-album').textContent = a.ten;
    $('so-anh').textContent = a.anh.length + ' ảnh';
    $('nut-lui').hidden = false;
    var tv = $('nut-tu-van'); tv.hidden = false;
    tv.href = 'index.html?goi=' + encodeURIComponent(a.ten) + '#dat-lich';
    luoiAlbum.hidden = true; luoiAnh.hidden = false;
    luoiAnh.innerHTML = a.anh.map(function (t, i) {
      return '<button class="o-anh" data-i="' + i + '" style="aspect-ratio:' + t[1] + '/' + t[2] + '"><img loading="lazy" src="' + src(a, t) + '" alt="' + a.ten + ' – ảnh ' + (i + 1) + '"></button>';
    }).join('');
    document.title = a.ten + ' – Album Home Studio';
  }

  function theoHash() {
    var ma = decodeURIComponent(location.hash.slice(1));
    var a = A.find(function (x) { return x.ma === ma; });
    if (a) { moAlbum(a); if (window.scrollY > $('album').offsetTop) $('album').scrollIntoView(); }
    else { dangXem = null; document.title = 'Album ảnh mẫu – Home Studio Yên Viên'; ve(); }
  }
  window.addEventListener('hashchange', theoHash);
  $('nut-lui').addEventListener('click', function () { location.hash = ''; });

  // xem ảnh to
  var xa = $('xem-anh'), img = $('xa-anh');
  function hienAnh(i) {
    viTri = (i + dangXem.anh.length) % dangXem.anh.length;
    img.src = src(dangXem, dangXem.anh[viTri]);
    img.alt = dangXem.ten + ' – ảnh ' + (viTri + 1);
    $('xa-dem').textContent = (viTri + 1) + ' / ' + dangXem.anh.length;
  }
  luoiAnh.addEventListener('click', function (e) {
    var b = e.target.closest('.o-anh'); if (!b) return;
    hienAnh(+b.dataset.i); xa.hidden = false; document.body.style.overflow = 'hidden';
  });
  function dong() { xa.hidden = true; img.removeAttribute('src'); document.body.style.overflow = ''; }
  $('xa-dong').onclick = dong;
  $('xa-lui').onclick = function () { hienAnh(viTri - 1); };
  $('xa-toi').onclick = function () { hienAnh(viTri + 1); };
  xa.addEventListener('click', function (e) { if (e.target === xa) dong(); });
  document.addEventListener('keydown', function (e) {
    if (xa.hidden) return;
    if (e.key === 'Escape') dong();
    if (e.key === 'ArrowLeft') hienAnh(viTri - 1);
    if (e.key === 'ArrowRight') hienAnh(viTri + 1);
  });
  var x0 = null;
  xa.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  xa.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var d = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(d) > 40) hienAnh(viTri + (d < 0 ? 1 : -1));
  });

  theoHash();
})();
