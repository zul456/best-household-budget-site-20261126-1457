// DompetKeluarga — grafik kanvas tanpa pustaka: donat dan batang.
// Digambar ulang setiap kali halaman dirender, dengan skala retina.

import { formatRpSingkat } from './format.js';

function siapkanKanvas(canvas, lebarCss, tinggiCss) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(lebarCss * dpr);
  canvas.height = Math.round(tinggiCss * dpr);
  canvas.style.width = lebarCss + 'px';
  canvas.style.height = tinggiCss + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, lebarCss, tinggiCss);
  return ctx;
}

// Donat pengeluaran per kategori. Mengembalikan daftar potongan untuk legenda.
export function gambarDonat(canvas, potongan) {
  const total = potongan.reduce((s, p) => s + p.nilai, 0);
  const ctx = siapkanKanvas(canvas, 260, 260);
  const cx = 130, cy = 130, rLuar = 104, rDalam = 62;
  if (total <= 0) {
    ctx.fillStyle = '#5d6b64';
    ctx.font = '600 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Belum ada pengeluaran', cx, cy);
    return;
  }
  let sudut = -Math.PI / 2;
  for (const p of potongan) {
    const bagian = (p.nilai / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, rLuar, sudut, sudut + bagian);
    ctx.closePath();
    ctx.fillStyle = p.warna;
    ctx.fill();
    sudut += bagian;
  }
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx, cy, rDalam, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#22302a';
  ctx.font = '800 19px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(formatRpSingkat(total), cx, cy - 10);
  ctx.fillStyle = '#5d6b64';
  ctx.font = '600 11px system-ui, sans-serif';
  ctx.fillText('pengeluaran', cx, cy + 8);
  ctx.fillText('bulan ini', cx, cy + 24);
}

// Batang berkelompok: pemasukan vs pengeluaran per bulan.
export function gambarBatang(canvas, seri, lebarCss = 640, tinggiCss = 260) {
  const ctx = siapkanKanvas(canvas, lebarCss, tinggiCss);
  const padKiri = 58, padKanan = 12, padAtas = 14, padBawah = 30;
  const lebarGrafik = lebarCss - padKiri - padKanan;
  const tinggiGrafik = tinggiCss - padAtas - padBawah;
  const maks = Math.max(1, ...seri.flatMap((s) => s.nilai.map((n) => n)));
  const skala = tinggiGrafik / maks;
  const lebarKelompok = lebarGrafik / seri.length;
  const lebarBatang = Math.min(30, (lebarKelompok - 16) / 2);

  // Garis grid dan label sumbu Y.
  ctx.strokeStyle = '#e8efe9';
  ctx.fillStyle = '#5d6b64';
  ctx.font = '11px system-ui, sans-serif';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const nilai = (maks / 4) * i;
    const y = padAtas + tinggiGrafik - nilai * skala;
    ctx.beginPath();
    ctx.moveTo(padKiri, y);
    ctx.lineTo(lebarCss - padKanan, y);
    ctx.stroke();
    ctx.fillText(formatRpSingkat(nilai), padKiri - 6, y + 4);
  }

  // Batang.
  ctx.textAlign = 'center';
  seri.forEach((s, i) => {
    const xKelompok = padKiri + i * lebarKelompok;
    const x0 = xKelompok + (lebarKelompok - lebarBatang * 2 - 4) / 2;
    s.nilai.forEach((n, j) => {
      const tinggi = Math.max(2, n * skala);
      ctx.fillStyle = j === 0 ? '#1d6b4f' : '#d96c2c';
      ctx.beginPath();
      ctx.roundRect(x0 + j * (lebarBatang + 4), padAtas + tinggiGrafik - tinggi, lebarBatang, tinggi, [3, 3, 0, 0]);
      ctx.fill();
    });
    ctx.fillStyle = '#22302a';
    ctx.font = '600 12px system-ui, sans-serif';
    ctx.fillText(s.label, xKelompok + lebarKelompok / 2, tinggiCss - 10);
  });
}

// Bilah kemajuan kecil untuk kartu ringkasan (dipakai di dasbor).
export function gambarSpark(canvas, nilai) {
  const ctx = siapkanKanvas(canvas, 220, 48);
  ctx.strokeStyle = '#dfe7df';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(2, 24);
  ctx.lineTo(218, 24);
  ctx.stroke();
  const maks = Math.max(...nilai, 1);
  ctx.strokeStyle = '#1d6b4f';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  nilai.forEach((n, i) => {
    const x = 2 + (i * 216) / (nilai.length - 1 || 1);
    const y = 44 - (n / maks) * 40;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  const terakhir = nilai[nilai.length - 1];
  const xAkhir = 218;
  const yAkhir = 44 - (terakhir / maks) * 40;
  ctx.fillStyle = '#d96c2c';
  ctx.beginPath();
  ctx.arc(xAkhir, yAkhir, 4, 0, Math.PI * 2);
  ctx.fill();
}
