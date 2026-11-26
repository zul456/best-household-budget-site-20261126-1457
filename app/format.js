// DompetKeluarga — pemformatan angka, tanggal, dan bulan (Rupiah, id-ID).

export function formatRp(nilai) {
  return 'Rp ' + Math.round(nilai).toLocaleString('id-ID');
}

export function formatRpSingkat(nilai) {
  const abs = Math.abs(nilai);
  if (abs >= 1_000_000_000) return 'Rp ' + (nilai / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' M';
  if (abs >= 1_000_000) return 'Rp ' + (nilai / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' jt';
  if (abs >= 1_000) return 'Rp ' + (nilai / 1_000).toLocaleString('id-ID', { maximumFractionDigits: 0 }) + ' rb';
  return formatRp(nilai);
}

export function formatTanggal(iso) {
  const [tahun, bulan, hari] = iso.split('-').map(Number);
  const d = new Date(tahun, bulan - 1, hari);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export function namaBulan(kode) {
  const [tahun, bulan] = kode.split('-');
  return NAMA_BULAN[Number(bulan) - 1] + ' ' + tahun;
}

export function namaBulanSingkat(kode) {
  const bulan = kode.split('-')[1];
  return NAMA_BULAN[Number(bulan) - 1].slice(0, 3);
}

export function persen(bagian, total) {
  if (!total) return 0;
  return Math.round((bagian / total) * 100);
}

export function escapeHtml(teks) {
  return String(teks)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
