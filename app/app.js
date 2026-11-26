// DompetKeluarga — titik masuk aplikasi: perute hash, pemilih bulan,
// dan semua interaksi (tambah/ubah/hapus transaksi, ubah anggaran,
// tambah dana tabungan, buat tujuan, reset data contoh).

import {
  KATEGORI, KATEGORI_PEMASUKAN, muatData, simpanData, resetData, buatId,
} from './data.js';
import { namaBulan } from './format.js';
import {
  renderDashboard, renderTransaksi, renderAnggaran, renderTabungan, renderLaporan,
} from './views.js';

const BULAN_AWAL = '2026-11';
const BULAN_TERSISIP = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];

let data = muatData();
let bulan = BULAN_AWAL;
let filter = { jenis: 'semua', kategori: 'semua', cari: '' };

const app = document.getElementById('app');
const monthSelect = document.getElementById('monthSelect');

for (const b of BULAN_TERSISIP) {
  const opt = document.createElement('option');
  opt.value = b;
  opt.textContent = namaBulan(b);
  monthSelect.appendChild(opt);
}
monthSelect.value = bulan;
monthSelect.addEventListener('change', () => {
  bulan = monthSelect.value;
  render();
});

function rute() {
  const hash = location.hash.replace(/^#\/?/, '');
  return hash.split('/')[0] || 'dashboard';
}

function tandaiNav(aktif) {
  document.querySelectorAll('[data-nav]').forEach((a) => {
    a.classList.toggle('active', a.dataset.nav === aktif);
  });
}

function render() {
  const halaman = rute();
  tandaiNav(halaman);
  let hasil;
  if (halaman === 'transaksi') hasil = renderTransaksi(data, bulan, filter);
  else if (halaman === 'anggaran') hasil = renderAnggaran(data, bulan);
  else if (halaman === 'tabungan') hasil = renderTabungan(data);
  else if (halaman === 'laporan') hasil = renderLaporan(data, bulan);
  else hasil = renderDashboard(data, bulan);
  app.innerHTML = hasil.html;
  hasil.sesudahRender();
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', render);

// --- Penanganan kejadian (delegasi pada #app) ---

function simpanDanRender(pesanEl, pesan) {
  simpanData(data);
  render();
  if (pesanEl) {
    const el = document.getElementById(pesanEl);
    if (el) el.textContent = pesan;
  }
}

app.addEventListener('submit', (e) => {
  const form = e.target;
  e.preventDefault();

  // Tambah transaksi.
  if (form.id === 'formTambah') {
    const fd = new FormData(form);
    const jenis = fd.get('jenis');
    const daftarKategori = jenis === 'masuk' ? KATEGORI_PEMASUKAN : KATEGORI;
    const kategori = daftarKategori.some((k) => k.id === fd.get('kategori')) ? fd.get('kategori') : daftarKategori[0].id;
    data.transaksi.push({
      id: buatId('t'),
      tanggal: fd.get('tanggal'),
      jenis,
      kategori,
      keterangan: String(fd.get('keterangan')).trim(),
      jumlah: Math.max(0, Math.round(Number(fd.get('jumlah')) || 0)),
    });
    simpanData(data);
    render();
    const pesan = document.getElementById('pesanTambah');
    if (pesan) pesan.textContent = 'Transaksi tersimpan.';
    return;
  }

  // Filter transaksi.
  if (form.id === 'formFilter') {
    const fd = new FormData(form);
    filter = {
      jenis: fd.get('jenis') || 'semua',
      kategori: fd.get('kategori') || 'semua',
      cari: String(fd.get('cari') || '').trim(),
    };
    render();
    return;
  }

  // Ubah transaksi (dialog).
  if (form.id === 'formEdit') {
    const fd = new FormData(form);
    const t = data.transaksi.find((x) => x.id === fd.get('id'));
    if (t) {
      const jenis = fd.get('jenis');
      const daftarKategori = jenis === 'masuk' ? KATEGORI_PEMASUKAN : KATEGORI;
      t.tanggal = fd.get('tanggal');
      t.jenis = jenis;
      t.kategori = daftarKategori.some((k) => k.id === fd.get('kategori')) ? fd.get('kategori') : daftarKategori[0].id;
      t.keterangan = String(fd.get('keterangan')).trim();
      t.jumlah = Math.max(0, Math.round(Number(fd.get('jumlah')) || 0));
      simpanData(data);
    }
    document.getElementById('dialogEdit').close();
    render();
    return;
  }

  // Ubah anggaran satu kategori.
  if (form.dataset.formAnggaran) {
    const fd = new FormData(form);
    data.anggaran[form.dataset.formAnggaran] = Math.max(0, Math.round(Number(fd.get('anggaran')) || 0));
    simpanData(data);
    render();
    return;
  }

  // Tambah dana ke satu tujuan tabungan.
  if (form.dataset.formDana) {
    const fd = new FormData(form);
    const g = data.tujuan.find((x) => x.id === form.dataset.formDana);
    if (g) g.terkumpul += Math.max(0, Math.round(Number(fd.get('dana')) || 0));
    simpanData(data);
    render();
    return;
  }

  // Buat tujuan tabungan baru.
  if (form.id === 'formTujuan') {
    const fd = new FormData(form);
    data.tujuan.push({
      id: buatId('g'),
      nama: String(fd.get('nama')).trim(),
      target: Math.max(0, Math.round(Number(fd.get('target')) || 0)),
      terkumpul: 0,
      tenggat: fd.get('tenggat'),
      catatan: String(fd.get('catatan') || '').trim() || 'Tujuan baru keluarga.',
    });
    simpanData(data);
    render();
    const pesan = document.getElementById('pesanTujuan');
    if (pesan) pesan.textContent = 'Tujuan baru dibuat.';
  }
});

app.addEventListener('click', (e) => {
  const tombol = e.target.closest('[data-aksi]');
  if (!tombol) return;
  const aksi = tombol.dataset.aksi;

  if (aksi === 'hapus') {
    const t = data.transaksi.find((x) => x.id === tombol.dataset.id);
    if (t && confirm(`Hapus transaksi "${t.keterangan}" (${t.jumlah.toLocaleString('id-ID')} Rp)?`)) {
      data.transaksi = data.transaksi.filter((x) => x.id !== tombol.dataset.id);
      simpanData(data);
      render();
    }
    return;
  }

  if (aksi === 'edit') {
    const t = data.transaksi.find((x) => x.id === tombol.dataset.id);
    if (!t) return;
    const dialog = document.getElementById('dialogEdit');
    const form = document.getElementById('formEdit');
    form.id.value = t.id;
    form.tanggal.value = t.tanggal;
    form.jenis.value = t.jenis;
    form.jumlah.value = t.jumlah;
    form.keterangan.value = t.keterangan;
    const pilihKategori = document.getElementById('kategoriEdit');
    const daftarKategori = t.jenis === 'masuk' ? KATEGORI_PEMASUKAN : KATEGORI;
    pilihKategori.innerHTML = daftarKategori
      .map((k) => `<option value="${k.id}" ${k.id === t.kategori ? 'selected' : ''}>${k.nama}</option>`)
      .join('');
    dialog.showModal();
    return;
  }

  if (aksi === 'tutup-dialog') {
    document.getElementById('dialogEdit').close();
    return;
  }

  if (aksi === 'reset-filter') {
    filter = { jenis: 'semua', kategori: 'semua', cari: '' };
    render();
  }
});

// Kategori pada form tambah mengikuti jenis yang dipilih.
app.addEventListener('change', (e) => {
  if (e.target.id === 'jenisBaru') {
    const pilih = document.getElementById('kategoriBaru');
    const daftar = e.target.value === 'masuk' ? KATEGORI_PEMASUKAN : KATEGORI;
    pilih.innerHTML = daftar.map((k) => `<option value="${k.id}">${k.nama}</option>`).join('');
  }
  if (e.target.name === 'jenis' && e.target.closest('#formEdit')) {
    const pilih = document.getElementById('kategoriEdit');
    const daftar = e.target.value === 'masuk' ? KATEGORI_PEMASUKAN : KATEGORI;
    pilih.innerHTML = daftar.map((k) => `<option value="${k.id}">${k.nama}</option>`).join('');
  }
});

// Tombol reset data contoh (dipakai dari konsol / tautan kaki halaman).
window.dompetKeluargaReset = () => {
  data = resetData();
  render();
};

render();
