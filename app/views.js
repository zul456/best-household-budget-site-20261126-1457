// DompetKeluarga — tampilan tiap halaman (dasbor, transaksi, anggaran,
// tabungan, laporan). Setiap fungsi mengembalikan HTML; app.js memasang
// pendengar kejadian sesudah render.

import { KATEGORI, KATEGORI_PEMASUKAN, RIWAYAT_BULANAN, namaKategori, warnaKategori, ringkasanBulan } from './data.js';
import { formatRp, formatRpSingkat, formatTanggal, namaBulan, namaBulanSingkat, persen, escapeHtml } from './format.js';
import { gambarDonat, gambarBatang } from './charts.js';

function barisTransaksi(t) {
  const tanda = t.jenis === 'masuk' ? '+' : '−';
  return `<tr>
    <td class="nowrap">${formatTanggal(t.tanggal)}</td>
    <td>${escapeHtml(t.keterangan)}</td>
    <td><span class="kategori-chip">${escapeHtml(namaKategori(t.kategori))}</span></td>
    <td class="jumlah ${t.jenis === 'masuk' ? 'masuk' : 'keluar'}">${tanda} ${formatRp(t.jumlah)}</td>
    <td class="nowrap">
      <button class="tombol-kecil" data-aksi="edit" data-id="${t.id}">Ubah</button>
      <button class="tombol-kecil hapus" data-aksi="hapus" data-id="${t.id}">Hapus</button>
    </td>
  </tr>`;
}

function tabelTransaksi(daftar, kosong = 'Belum ada transaksi pada bulan ini.') {
  if (daftar.length === 0) return `<p class="kosong">${kosong}</p>`;
  return `<div class="tabel-gulir"><table>
    <thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th class="jumlah">Jumlah</th><th>Aksi</th></tr></thead>
    <tbody>${daftar.map(barisTransaksi).join('')}</tbody>
  </table></div>`;
}

export function renderDashboard(data, bulan) {
  const ringkas = ringkasanBulan(data, bulan);
  const tingkatTabung = ringkas.masuk > 0 ? persen(ringkas.sisa, ringkas.masuk) : 0;

  const peringatan = KATEGORI.map((k) => {
    const terpakai = ringkas.perKategori[k.id] || 0;
    const anggaran = data.anggaran[k.id] || 0;
    const p = persen(terpakai, anggaran);
    return { k, terpakai, anggaran, p };
  }).filter((x) => x.p >= 90);

  const potongan = KATEGORI
    .map((k) => ({ nama: k.nama, nilai: ringkas.perKategori[k.id] || 0, warna: k.warna }))
    .filter((p) => p.nilai > 0)
    .sort((a, b) => b.nilai - a.nilai);

  const riwayat = RIWAYAT_BULANAN.map((r) => ({
    ...r,
    pengeluaran: r.bulan === bulan ? ringkas.keluar : r.pengeluaran,
    pemasukan: r.bulan === bulan ? ringkas.masuk : r.pemasukan,
  }));
  const seriBatang = riwayat.map((r) => ({ label: namaBulanSingkat(r.bulan), nilai: [r.pemasukan, r.pengeluaran] }));

  const terbaru = [...data.transaksi]
    .filter((t) => t.tanggal.startsWith(bulan))
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.id.localeCompare(a.id))
    .slice(0, 6);

  const html = `
  <h1>Dasbor ${escapeHtml(namaBulan(bulan))}</h1>
  <p class="muted">Keluarga Prasetyo · 2 dewasa, 2 anak · Jakarta. Pemasukan bulan ini dari gaji dan usaha sampingan; semua angka dalam Rupiah.</p>

  ${peringatan.length ? `<div class="peringatan ${peringatan.some((x) => x.p >= 100) ? 'bahaya' : ''}" role="alert">
    <h3>⚠ Perhatian anggaran</h3>
    <p>${peringatan.map((x) => `${escapeHtml(x.k.nama)} sudah ${x.p}% dari anggaran (${formatRp(x.terpakai)} dari ${formatRp(x.anggaran)})`).join('; ')}.</p>
    <p><a href="#/anggaran">Lihat anggaran →</a></p>
  </div>` : ''}

  <section class="grid-4" aria-label="Ringkasan bulan ini">
    <div class="stat"><div class="label">Pemasukan</div><div class="angka masuk">${formatRp(ringkas.masuk)}</div><div class="sub">Gaji + usaha sampingan</div></div>
    <div class="stat"><div class="label">Pengeluaran</div><div class="angka keluar">${formatRp(ringkas.keluar)}</div><div class="sub">${ringkas.jumlahTransaksi} transaksi keluar</div></div>
    <div class="stat"><div class="label">Sisa</div><div class="angka sisa">${formatRp(ringkas.sisa)}</div><div class="sub">Bisa ditabung bulan ini</div></div>
    <div class="stat"><div class="label">Tingkat tabungan</div><div class="angka">${tingkatTabung}%</div><div class="sub">Target keluarga: 20% <span class="pita ${tingkatTabung >= 20 ? '' : 'waspada'}">${tingkatTabung >= 20 ? 'Tercapai' : 'Belum tercapai'}</span></div></div>
  </section>

  <div class="grid-2">
    <section class="kartu" aria-label="Pengeluaran per kategori">
      <h2>Ke mana uang pergi?</h2>
      <div class="grafik-wrap">
        <canvas id="donat" width="260" height="260" role="img" aria-label="Diagram donat pengeluaran per kategori"></canvas>
        <ul class="legenda">
          ${potongan.map((p) => `<li><span><span class="titik" style="background:${p.warna}"></span>${escapeHtml(p.nama)}</span><span class="nilai">${formatRpSingkat(p.nilai)}</span></li>`).join('')}
        </ul>
      </div>
      <p class="small muted">Kategori terbesar bulan ini: <strong>${potongan.length ? escapeHtml(potongan[0].nama) : '—'}</strong>${potongan.length ? ` (${formatRp(potongan[0].nilai)}, ${persen(potongan[0].nilai, ringkas.keluar)}% dari pengeluaran)` : ''}.</p>
    </section>

    <section class="kartu" aria-label="Transaksi terbaru">
      <h2>Transaksi terbaru</h2>
      ${tabelTransaksi(terbaru)}
      <p><a href="#/transaksi">Lihat semua transaksi →</a> · <a href="#/transaksi">+ Tambah transaksi</a></p>
    </section>
  </div>

  <section class="kartu" aria-label="Perbandingan enam bulan">
    <h2>Pemasukan vs pengeluaran — 6 bulan terakhir</h2>
    <canvas id="batang" width="640" height="260" role="img" aria-label="Grafik batang pemasukan dan pengeluaran enam bulan terakhir"></canvas>
    <p class="small muted"><span style="color:#1d6b4f">■</span> Pemasukan &nbsp; <span style="color:#d96c2c">■</span> Pengeluaran. Rata-rata pengeluaran 6 bulan: <strong>${formatRp(Math.round(riwayat.reduce((s, r) => s + r.pengeluaran, 0) / riwayat.length))}</strong> per bulan.</p>
  </section>

  <section class="kartu">
    <h2>Anggaran bulan ini — sekilas</h2>
    ${KATEGORI.slice(0, 4).map((k) => {
      const terpakai = ringkas.perKategori[k.id] || 0;
      const anggaran = data.anggaran[k.id] || 0;
      const p = persen(terpakai, anggaran);
      const kelas = p >= 100 ? 'bahaya' : p >= 80 ? 'waspada' : '';
      return `<div class="anggaran-item">
        <div class="anggaran-kepala"><strong>${escapeHtml(k.nama)}</strong><span class="angka">${formatRp(terpakai)} / ${formatRp(anggaran)}</span></div>
        <div class="bilah"><span class="${kelas}" style="width:${Math.min(100, p)}%"></span></div>
        <div class="small muted">${p}% terpakai · sisa ${formatRp(Math.max(0, anggaran - terpakai))}</div>
      </div>`;
    }).join('')}
    <p><a href="#/anggaran">Lihat semua kategori anggaran →</a></p>
  </section>`;

  return {
    html,
    sesudahRender() {
      gambarDonat(document.getElementById('donat'), potongan);
      gambarBatang(document.getElementById('batang'), seriBatang);
    },
  };
}

function opsiKategori(terpilih, daftar) {
  return daftar.map((k) => `<option value="${k.id}" ${k.id === terpilih ? 'selected' : ''}>${escapeHtml(k.nama)}</option>`).join('');
}

export function renderTransaksi(data, bulan, filter) {
  let daftar = [...data.transaksi].filter((t) => t.tanggal.startsWith(bulan));
  if (filter.jenis !== 'semua') daftar = daftar.filter((t) => t.jenis === filter.jenis);
  if (filter.kategori !== 'semua') daftar = daftar.filter((t) => t.kategori === filter.kategori);
  if (filter.cari) {
    const q = filter.cari.toLowerCase();
    daftar = daftar.filter((t) => t.keterangan.toLowerCase().includes(q));
  }
  daftar.sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.id.localeCompare(a.id));
  const totalMasuk = daftar.filter((t) => t.jenis === 'masuk').reduce((s, t) => s + t.jumlah, 0);
  const totalKeluar = daftar.filter((t) => t.jenis === 'keluar').reduce((s, t) => s + t.jumlah, 0);

  const html = `
  <h1>Transaksi — ${escapeHtml(namaBulan(bulan))}</h1>
  <p class="muted">Semua pemasukan dan pengeluaran keluarga pada bulan ini. Tambah, ubah, atau hapus — dasbor, anggaran, dan laporan ikut berubah.</p>

  <section class="kartu" aria-label="Tambah transaksi">
    <h2>Tambah transaksi</h2>
    <form id="formTambah">
      <div class="baris-3">
        <label><span>Tanggal</span><input type="date" name="tanggal" value="${bulan}-26" required></label>
        <label><span>Jenis</span>
          <select name="jenis" id="jenisBaru">
            <option value="keluar">Pengeluaran</option>
            <option value="masuk">Pemasukan</option>
          </select>
        </label>
        <label><span>Jumlah (Rp)</span><input type="number" name="jumlah" min="1000" step="1000" placeholder="contoh: 150000" required></label>
      </div>
      <div class="baris">
        <label><span>Kategori</span><select name="kategori" id="kategoriBaru">${opsiKategori('belanja', KATEGORI)}</select></label>
        <label><span>Keterangan</span><input type="text" name="keterangan" maxlength="120" placeholder="contoh: Belanja mingguan di pasar" required></label>
      </div>
      <div class="aksi-form">
        <button class="tombol" type="submit">Simpan transaksi</button>
        <span class="pesan" id="pesanTambah" role="status"></span>
      </div>
    </form>
  </section>

  <section class="kartu" aria-label="Daftar transaksi">
    <h2>Daftar transaksi <span class="muted small">(${daftar.length} transaksi)</span></h2>
    <form class="filter" id="formFilter">
      <label><span>Jenis</span>
        <select name="jenis">
          <option value="semua" ${filter.jenis === 'semua' ? 'selected' : ''}>Semua</option>
          <option value="masuk" ${filter.jenis === 'masuk' ? 'selected' : ''}>Pemasukan</option>
          <option value="keluar" ${filter.jenis === 'keluar' ? 'selected' : ''}>Pengeluaran</option>
        </select>
      </label>
      <label><span>Kategori</span>
        <select name="kategori">
          <option value="semua">Semua kategori</option>
          ${[...KATEGORI, ...KATEGORI_PEMASUKAN].map((k) => `<option value="${k.id}" ${filter.kategori === k.id ? 'selected' : ''}>${escapeHtml(k.nama)}</option>`).join('')}
        </select>
      </label>
      <label><span>Cari keterangan</span><input type="search" name="cari" value="${escapeHtml(filter.cari)}" placeholder="contoh: pasar"></label>
      <button class="tombol sekunder" type="submit">Terapkan filter</button>
      <button class="tombol sekunder" type="button" data-aksi="reset-filter">Bersihkan</button>
    </form>
    <p class="small">Hasil filter — pemasukan <strong class="jumlah masuk">${formatRp(totalMasuk)}</strong> · pengeluaran <strong class="jumlah keluar">${formatRp(totalKeluar)}</strong></p>
    ${tabelTransaksi(daftar, 'Tidak ada transaksi yang cocok dengan filter ini.')}
  </section>

  <dialog id="dialogEdit" aria-label="Ubah transaksi">
    <h2>Ubah transaksi</h2>
    <form id="formEdit" method="dialog">
      <input type="hidden" name="id">
      <div class="baris-3">
        <label><span>Tanggal</span><input type="date" name="tanggal" required></label>
        <label><span>Jenis</span><select name="jenis"><option value="keluar">Pengeluaran</option><option value="masuk">Pemasukan</option></select></label>
        <label><span>Jumlah (Rp)</span><input type="number" name="jumlah" min="1000" step="1000" required></label>
      </div>
      <div class="baris">
        <label><span>Kategori</span><select name="kategori" id="kategoriEdit"></select></label>
        <label><span>Keterangan</span><input type="text" name="keterangan" maxlength="120" required></label>
      </div>
      <div class="aksi-form">
        <button class="tombol" type="submit">Simpan perubahan</button>
        <button class="tombol sekunder" type="button" data-aksi="tutup-dialog">Batal</button>
      </div>
    </form>
  </dialog>`;

  return { html, sesudahRender() {} };
}

export function renderAnggaran(data, bulan) {
  const ringkas = ringkasanBulan(data, bulan);
  const totalAnggaran = Object.values(data.anggaran).reduce((s, v) => s + v, 0);
  const totalTerpakai = Object.values(ringkas.perKategori).reduce((s, v) => s + v, 0);

  const html = `
  <h1>Anggaran — ${escapeHtml(namaBulan(bulan))}</h1>
  <p class="muted">Batas belanja tiap kategori untuk bulan ini. Ubah angkanya kapan saja — bilah kemajuan langsung mengikuti pengeluaran yang sudah tercatat.</p>

  <section class="grid-4" aria-label="Ringkasan anggaran">
    <div class="stat"><div class="label">Total anggaran</div><div class="angka">${formatRp(totalAnggaran)}</div><div class="sub">Semua kategori</div></div>
    <div class="stat"><div class="label">Sudah terpakai</div><div class="angka keluar">${formatRp(totalTerpakai)}</div><div class="sub">${persen(totalTerpakai, totalAnggaran)}% dari anggaran</div></div>
    <div class="stat"><div class="label">Sisa anggaran</div><div class="angka sisa">${formatRp(Math.max(0, totalAnggaran - totalTerpakai))}</div><div class="sub">Untuk sisa bulan ini</div></div>
    <div class="stat"><div class="label">Kategori lewat batas</div><div class="angka">${KATEGORI.filter((k) => (ringkas.perKategori[k.id] || 0) > (data.anggaran[k.id] || 0)).length}</div><div class="sub">dari ${KATEGORI.length} kategori</div></div>
  </section>

  <section class="kartu" aria-label="Anggaran per kategori">
    <h2>Anggaran per kategori</h2>
    ${KATEGORI.map((k) => {
      const terpakai = ringkas.perKategori[k.id] || 0;
      const anggaran = data.anggaran[k.id] || 0;
      const p = persen(terpakai, anggaran);
      const kelas = p >= 100 ? 'bahaya' : p >= 80 ? 'waspada' : '';
      const status = p >= 100 ? `<span class="pita bahaya">Lewat ${formatRp(terpakai - anggaran)}</span>` : p >= 80 ? `<span class="pita waspada">Hampir habis</span>` : `<span class="pita">Aman</span>`;
      return `<div class="anggaran-item">
        <div class="anggaran-kepala">
          <strong><span class="titik" style="display:inline-block;width:11px;height:11px;border-radius:3px;background:${k.warna};margin-right:7px"></span>${escapeHtml(k.nama)}</strong>
          <span class="angka">${formatRp(terpakai)} / ${formatRp(anggaran)} · ${p}%</span>
        </div>
        <div class="bilah"><span class="${kelas}" style="width:${Math.min(100, p)}%"></span></div>
        <div class="small muted">Sisa ${formatRp(Math.max(0, anggaran - terpakai))} ${status}</div>
        <form class="tambah-dana" data-form-anggaran="${k.id}">
          <label class="small" style="margin:0"><span class="small">Ubah anggaran (Rp)</span>
          <input type="number" name="anggaran" min="0" step="50000" value="${anggaran}" required></label>
          <button class="tombol sekunder" type="submit">Simpan</button>
        </form>
      </div>`;
    }).join('')}
  </section>

  <section class="kartu tips" aria-label="Cara memakai anggaran">
    <h2>Cara keluarga ini memakai anggaran</h2>
    <ul>
      <li><strong>Aturan 50/30/20:</strong> sekitar 50% pemasukan untuk kebutuhan, 30% untuk keinginan, 20% ditabung. Bulan ini keluarga Prasetyo menabung ${persen(ringkas.sisa, ringkas.masuk)}% dari pemasukan.</li>
      <li><strong>Belanja harian</strong> adalah pos terbesar — belanja seminggu sekali di pasar membantu menahan angka ini.</li>
      <li>Bila satu kategori lewat batas, kurangi pos <strong>Hiburan</strong> atau <strong>Lainnya</strong> dulu sebelum menyentuh <strong>Tagihan</strong>.</li>
    </ul>
  </section>`;

  return { html, sesudahRender() {} };
}

export function renderTabungan(data) {
  const totalTerkumpul = data.tujuan.reduce((s, g) => s + g.terkumpul, 0);
  const totalTarget = data.tujuan.reduce((s, g) => s + g.target, 0);

  const html = `
  <h1>Tabungan &amp; Tujuan Keluarga</h1>
  <p class="muted">Empat tujuan yang sedang dikejar Keluarga Prasetyo. Tambah dana kapan saja — kemajuan langsung tercatat.</p>

  <section class="grid-4" aria-label="Ringkasan tabungan">
    <div class="stat"><div class="label">Total terkumpul</div><div class="angka masuk">${formatRp(totalTerkumpul)}</div><div class="sub">Semua tujuan</div></div>
    <div class="stat"><div class="label">Total target</div><div class="angka">${formatRp(totalTarget)}</div><div class="sub">Semua tujuan</div></div>
    <div class="stat"><div class="label">Kemajuan keseluruhan</div><div class="angka">${persen(totalTerkumpul, totalTarget)}%</div><div class="sub">Dari seluruh target</div></div>
    <div class="stat"><div class="label">Tujuan tercapai</div><div class="angka">${data.tujuan.filter((g) => g.terkumpul >= g.target).length}</div><div class="sub">dari ${data.tujuan.length} tujuan</div></div>
  </section>

  <div class="grid-2-sama">
  ${data.tujuan.map((g) => {
    const p = persen(g.terkumpul, g.target);
    const tercapai = g.terkumpul >= g.target;
    return `<section class="tujuan" aria-label="${escapeHtml(g.nama)}">
      <div class="tujuan-kepala">
        <strong>${escapeHtml(g.nama)}</strong>
        <span class="target">Target ${formatRp(g.target)} · tenggat ${formatTanggal(g.tenggat)}</span>
      </div>
      <div class="bilah"><span class="${tercapai ? '' : ''}" style="width:${Math.min(100, p)}%"></span></div>
      <p><span class="sisa-target">${formatRp(g.terkumpul)}</span> terkumpul (${p}%) · kurang ${formatRp(Math.max(0, g.target - g.terkumpul))} ${tercapai ? '· <span class="pita">Tercapai 🎉</span>' : ''}</p>
      <p class="small muted">${escapeHtml(g.catatan)}</p>
      ${tercapai ? '' : `<form class="tambah-dana" data-form-dana="${g.id}">
        <label class="small" style="margin:0"><span class="small">Tambah dana (Rp)</span>
        <input type="number" name="dana" min="1000" step="1000" placeholder="contoh: 250000" required></label>
        <button class="tombol sekunder" type="submit">Tambah</button>
      </form>`}
    </section>`;
  }).join('')}
  </div>

  <section class="kartu" aria-label="Buat tujuan baru">
    <h2>Buat tujuan tabungan baru</h2>
    <form id="formTujuan">
      <div class="baris-3">
        <label><span>Nama tujuan</span><input type="text" name="nama" maxlength="80" placeholder="contoh: Renovasi dapur" required></label>
        <label><span>Target (Rp)</span><input type="number" name="target" min="100000" step="50000" placeholder="contoh: 5000000" required></label>
        <label><span>Tenggat</span><input type="date" name="tenggat" value="2027-06-30" required></label>
      </div>
      <label><span>Catatan (opsional)</span><input type="text" name="catatan" maxlength="160" placeholder="Untuk apa tabungan ini?"></label>
      <div class="aksi-form">
        <button class="tombol" type="submit">Buat tujuan</button>
        <span class="pesan" id="pesanTujuan" role="status"></span>
      </div>
    </form>
  </section>`;

  return { html, sesudahRender() {} };
}

export function renderLaporan(data, bulan) {
  const ringkas = ringkasanBulan(data, bulan);
  const riwayat = RIWAYAT_BULANAN.map((r) => ({
    ...r,
    pengeluaran: r.bulan === bulan ? ringkas.keluar : r.pengeluaran,
    pemasukan: r.bulan === bulan ? ringkas.masuk : r.pemasukan,
  }));
  const potongan = KATEGORI
    .map((k) => ({ nama: k.nama, nilai: ringkas.perKategori[k.id] || 0, warna: k.warna }))
    .filter((p) => p.nilai > 0)
    .sort((a, b) => b.nilai - a.nilai);
  const terbesar = potongan[0];
  const lewatBatas = KATEGORI.filter((k) => (ringkas.perKategori[k.id] || 0) > (data.anggaran[k.id] || 0));
  const rataKeluar = Math.round(riwayat.reduce((s, r) => s + r.pengeluaran, 0) / riwayat.length);
  const rataTabung = Math.round(riwayat.reduce((s, r) => s + (r.pemasukan - r.pengeluaran), 0) / riwayat.length);

  const html = `
  <h1>Laporan — ${escapeHtml(namaBulan(bulan))}</h1>
  <p class="muted">Ringkasan enam bulan terakhir dan rincian bulan ini, supaya keluarga bisa melihat pola dan memutuskan langkah berikutnya.</p>

  <section class="grid-4" aria-label="Ringkasan enam bulan">
    <div class="stat"><div class="label">Rata-rata pemasukan</div><div class="angka masuk">${formatRp(Math.round(riwayat.reduce((s, r) => s + r.pemasukan, 0) / riwayat.length))}</div><div class="sub">Per bulan, 6 bulan terakhir</div></div>
    <div class="stat"><div class="label">Rata-rata pengeluaran</div><div class="angka keluar">${formatRp(rataKeluar)}</div><div class="sub">Per bulan, 6 bulan terakhir</div></div>
    <div class="stat"><div class="label">Rata-rata ditabung</div><div class="angka sisa">${formatRp(rataTabung)}</div><div class="sub">Per bulan, 6 bulan terakhir</div></div>
    <div class="stat"><div class="label">Bulan paling hemat</div><div class="angka">${escapeHtml(namaBulanSingkat(riwayat.reduce((a, b) => (b.pengeluaran < a.pengeluaran ? b : a)).bulan))}</div><div class="sub">Pengeluaran terendah: ${formatRp(Math.min(...riwayat.map((r) => r.pengeluaran)))}</div></div>
  </section>

  <section class="kartu" aria-label="Perbandingan bulanan">
    <h2>Perbandingan bulanan</h2>
    <div class="tabel-gulir"><table>
      <thead><tr><th>Bulan</th><th class="jumlah">Pemasukan</th><th class="jumlah">Pengeluaran</th><th class="jumlah">Ditabung</th><th class="jumlah">Tingkat tabungan</th></tr></thead>
      <tbody>
      ${[...riwayat].reverse().map((r) => {
        const tabung = r.pemasukan - r.pengeluaran;
        return `<tr>
          <td><strong>${escapeHtml(namaBulan(r.bulan))}</strong>${r.bulan === bulan ? ' <span class="pita">Bulan ini</span>' : ''}</td>
          <td class="jumlah masuk">${formatRp(r.pemasukan)}</td>
          <td class="jumlah keluar">${formatRp(r.pengeluaran)}</td>
          <td class="jumlah">${formatRp(tabung)}</td>
          <td class="jumlah">${persen(tabung, r.pemasukan)}%</td>
        </tr>`;
      }).join('')}
      </tbody>
    </table></div>
  </section>

  <div class="grid-2">
    <section class="kartu" aria-label="Rincian kategori bulan ini">
      <h2>Rincian pengeluaran — ${escapeHtml(namaBulan(bulan))}</h2>
      <div class="tabel-gulir"><table>
        <thead><tr><th>Kategori</th><th class="jumlah">Jumlah</th><th class="jumlah">Bagian</th></tr></thead>
        <tbody>
        ${potongan.map((p) => `<tr><td><span class="titik" style="display:inline-block;width:11px;height:11px;border-radius:3px;background:${p.warna};margin-right:7px"></span>${escapeHtml(p.nama)}</td><td class="jumlah">${formatRp(p.nilai)}</td><td class="jumlah">${persen(p.nilai, ringkas.keluar)}%</td></tr>`).join('')}
        <tr><td><strong>Total</strong></td><td class="jumlah"><strong>${formatRp(ringkas.keluar)}</strong></td><td class="jumlah"><strong>100%</strong></td></tr>
        </tbody>
      </table></div>
    </section>

    <section class="kartu tips" aria-label="Kesimpulan dan saran">
      <h2>Apa yang bisa dilakukan?</h2>
      <ul>
        <li><strong>Pos terbesar:</strong> ${terbesar ? `${escapeHtml(terbesar.nama)} (${formatRp(terbesar.nilai)}, ${persen(terbesar.nilai, ringkas.keluar)}% dari pengeluaran)` : 'belum ada pengeluaran'}. ${terbesar && terbesar.nama === 'Belanja Harian' ? 'Belanja seminggu sekali dan buat daftar belanja sebelum ke pasar.' : 'Periksa lagi rincian pos ini di halaman Transaksi.'}</li>
        <li><strong>Anggaran lewat batas:</strong> ${lewatBatas.length ? lewatBatas.map((k) => escapeHtml(k.nama)).join(', ') + ' — pindahkan dana dari pos Hiburan atau tunggu bulan depan.' : 'tidak ada kategori yang lewat batas bulan ini. Bagus!'}</li>
        <li><strong>Tabungan:</strong> keluarga menabung rata-rata ${formatRp(rataTabung)} per bulan dalam 6 bulan terakhir. Dengan laju ini, Dana Darurat (${formatRp(30000000)}) tercapai sekitar ${Math.max(1, Math.ceil((30000000 - 18400000) / Math.max(1, rataTabung)))} bulan lagi.</li>
        <li><strong>Langkah kecil minggu ini:</strong> masak 2 kali lebih banyak di rumah daripada pesan antar — penghematan sekitar ${formatRp(300000)} sebulan.</li>
      </ul>
      <p><a href="#/transaksi">Periksa transaksi →</a> · <a href="#/anggaran">Atur anggaran →</a></p>
    </section>
  </div>`;

  return { html, sesudahRender() {} };
}
