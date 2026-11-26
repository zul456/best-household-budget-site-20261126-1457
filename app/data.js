// DompetKeluarga — data dan penyimpanan.
// Semua angka adalah contoh keluarga Prasetyo (Jakarta, November 2026).
// Data tersimpan di localStorage peramban; tidak ada yang dikirim ke server.

export const KATEGORI = [
  { id: 'belanja', nama: 'Belanja Harian', warna: '#1d6b4f' },
  { id: 'makanan', nama: 'Makanan & Minuman', warna: '#d96c2c' },
  { id: 'transport', nama: 'Transportasi', warna: '#2b6cb0' },
  { id: 'tagihan', nama: 'Tagihan & Utilitas', warna: '#6b4fa1' },
  { id: 'pendidikan', nama: 'Pendidikan', warna: '#b98a12' },
  { id: 'kesehatan', nama: 'Kesehatan', warna: '#b3372f' },
  { id: 'hiburan', nama: 'Hiburan', warna: '#0e7c7b' },
  { id: 'pakaian', nama: 'Pakaian', warna: '#8a5a2b' },
  { id: 'lainnya', nama: 'Lainnya', warna: '#5d6b64' },
];

export const KATEGORI_PEMASUKAN = [
  { id: 'gaji', nama: 'Gaji', warna: '#1d6b4f' },
  { id: 'usaha', nama: 'Usaha Sampingan', warna: '#2b6cb0' },
  { id: 'lain-masuk', nama: 'Pemasukan Lain', warna: '#b98a12' },
];

export function namaKategori(id) {
  const semua = [...KATEGORI, ...KATEGORI_PEMASUKAN];
  const ketemu = semua.find((k) => k.id === id);
  return ketemu ? ketemu.nama : id;
}

export function warnaKategori(id) {
  const semua = [...KATEGORI, ...KATEGORI_PEMASUKAN];
  const ketemu = semua.find((k) => k.id === id);
  return ketemu ? ketemu.warna : '#5d6b64';
}

// Anggaran bulanan (November 2026) per kategori pengeluaran.
export const ANGGARAN_AWAL = {
  belanja: 3500000,
  makanan: 2200000,
  transport: 1200000,
  tagihan: 1800000,
  pendidikan: 1500000,
  kesehatan: 600000,
  hiburan: 800000,
  pakaian: 500000,
  lainnya: 400000,
};

// Riwayat bulanan Juni–November 2026 untuk grafik perbandingan.
export const RIWAYAT_BULANAN = [
  { bulan: '2026-06', pemasukan: 18200000, pengeluaran: 12480000 },
  { bulan: '2026-07', pemasukan: 18500000, pengeluaran: 13120000 },
  { bulan: '2026-08', pemasukan: 18900000, pengeluaran: 12850000 },
  { bulan: '2026-09', pemasukan: 18500000, pengeluaran: 13600000 },
  { bulan: '2026-10', pemasukan: 19200000, pengeluaran: 12940000 },
  { bulan: '2026-11', pemasukan: 18500000, pengeluaran: 0 }, // dihitung dari transaksi
];

function transaksiAwal() {
  // id, tanggal (YYYY-MM-DD), jenis, kategori, keterangan, jumlah (Rp)
  return [
    { id: 't01', tanggal: '2026-11-01', jenis: 'masuk', kategori: 'gaji', keterangan: 'Gaji bulanan — Andi Prasetyo', jumlah: 15000000 },
    { id: 't02', tanggal: '2026-11-02', jenis: 'masuk', kategori: 'usaha', keterangan: 'Order katering akhir pekan', jumlah: 1250000 },
    { id: 't03', tanggal: '2026-11-02', jenis: 'keluar', kategori: 'belanja', keterangan: 'Belanja mingguan — pasar & supermarket', jumlah: 685000 },
    { id: 't04', tanggal: '2026-11-03', jenis: 'keluar', kategori: 'transport', keterangan: 'Bensin motor (2x isi)', jumlah: 120000 },
    { id: 't05', tanggal: '2026-11-03', jenis: 'keluar', kategori: 'makanan', keterangan: 'Makan siang keluarga di luar', jumlah: 185000 },
    { id: 't06', tanggal: '2026-11-04', jenis: 'keluar', kategori: 'pendidikan', keterangan: 'Les matematika Dimas', jumlah: 450000 },
    { id: 't07', tanggal: '2026-11-05', jenis: 'keluar', kategori: 'tagihan', keterangan: 'Listrik PLN', jumlah: 512000 },
    { id: 't08', tanggal: '2026-11-05', jenis: 'keluar', kategori: 'tagihan', keterangan: 'Internet & TV kabel', jumlah: 385000 },
    { id: 't09', tanggal: '2026-11-06', jenis: 'keluar', kategori: 'belanja', keterangan: 'Beras 10 kg & minyak goreng', jumlah: 248000 },
    { id: 't10', tanggal: '2026-11-07', jenis: 'keluar', kategori: 'hiburan', keterangan: 'Nonton bioskop berempat', jumlah: 320000 },
    { id: 't11', tanggal: '2026-11-08', jenis: 'keluar', kategori: 'makanan', keterangan: 'Pesan antar makan malam', jumlah: 142000 },
    { id: 't12', tanggal: '2026-11-09', jenis: 'keluar', kategori: 'transport', keterangan: 'Tol & parkir', jumlah: 96000 },
    { id: 't13', tanggal: '2026-11-10', jenis: 'keluar', kategori: 'kesehatan', keterangan: 'Vitamin & obat flu', jumlah: 178000 },
    { id: 't14', tanggal: '2026-11-11', jenis: 'keluar', kategori: 'belanja', keterangan: 'Belanja mingguan — sayur & buah', jumlah: 592000 },
    { id: 't15', tanggal: '2026-11-12', jenis: 'keluar', kategori: 'pakaian', keterangan: 'Seragam sekolah Sinta', jumlah: 275000 },
    { id: 't16', tanggal: '2026-11-13', jenis: 'keluar', kategori: 'makanan', keterangan: 'Kopi & camilan kantor', jumlah: 89000 },
    { id: 't17', tanggal: '2026-11-14', jenis: 'keluar', kategori: 'transport', keterangan: 'Servis motor berkala', jumlah: 340000 },
    { id: 't18', tanggal: '2026-11-15', jenis: 'masuk', kategori: 'usaha', keterangan: 'Jualan kue pesanan tetangga', jumlah: 850000 },
    { id: 't19', tanggal: '2026-11-16', jenis: 'keluar', kategori: 'pendidikan', keterangan: 'Buku & alat tulis anak', jumlah: 210000 },
    { id: 't20', tanggal: '2026-11-17', jenis: 'keluar', kategori: 'tagihan', keterangan: 'Air PDAM', jumlah: 168000 },
    { id: 't21', tanggal: '2026-11-18', jenis: 'keluar', kategori: 'belanja', keterangan: 'Belanja mingguan — lauk & bumbu', jumlah: 634000 },
    { id: 't22', tanggal: '2026-11-19', jenis: 'keluar', kategori: 'makanan', keterangan: 'Makan malam ulang tahun Ibu', jumlah: 465000 },
    { id: 't23', tanggal: '2026-11-20', jenis: 'keluar', kategori: 'hiburan', keterangan: 'Langganan streaming keluarga', jumlah: 149000 },
    { id: 't24', tanggal: '2026-11-21', jenis: 'keluar', kategori: 'transport', keterangan: 'Bensin motor', jumlah: 60000 },
    { id: 't25', tanggal: '2026-11-22', jenis: 'keluar', kategori: 'kesehatan', keterangan: 'Periksa gigi Sinta', jumlah: 250000 },
    { id: 't26', tanggal: '2026-11-23', jenis: 'keluar', kategori: 'belanja', keterangan: 'Belanja mingguan — kebutuhan dapur', jumlah: 571000 },
    { id: 't27', tanggal: '2026-11-24', jenis: 'keluar', kategori: 'makanan', keterangan: 'Jajan anak sekolah (seminggu)', jumlah: 175000 },
    { id: 't28', tanggal: '2026-11-25', jenis: 'keluar', kategori: 'lainnya', keterangan: 'Iuran RT & kebersihan', jumlah: 75000 },
    { id: 't29', tanggal: '2026-11-26', jenis: 'keluar', kategori: 'tagihan', keterangan: 'Pulsa & paket data keluarga', jumlah: 220000 },
    { id: 't30', tanggal: '2026-11-15', jenis: 'masuk', kategori: 'usaha', keterangan: 'Jasa desain logo tetangga', jumlah: 1400000 },
  ];
}

function tujuanAwal() {
  return [
    { id: 'g1', nama: 'Dana Darurat', target: 30000000, terkumpul: 18400000, tenggat: '2027-06-30', catatan: 'Untuk 3 bulan biaya hidup bila ada hal tak terduga.' },
    { id: 'g2', nama: 'Liburan Keluarga ke Yogyakarta', target: 8000000, terkumpul: 3200000, tenggat: '2027-01-15', catatan: 'Tiket kereta, hotel 3 malam, dan jajan selama liburan.' },
    { id: 'g3', nama: 'DP Motor Baru', target: 12000000, terkumpul: 5750000, tenggat: '2027-03-31', catatan: 'Ganti motor lama yang sudah 9 tahun.' },
    { id: 'g4', nama: 'Pendidikan Anak', target: 20000000, terkumpul: 11200000, tenggat: '2027-12-31', catatan: 'Tabungan masuk SMP Dimas tahun depan.' },
  ];
}

const KUNCI = 'dompetkeluarga-v1';

export function muatData() {
  try {
    const mentah = localStorage.getItem(KUNCI);
    if (mentah) {
      const data = JSON.parse(mentah);
      if (Array.isArray(data.transaksi) && data.anggaran && Array.isArray(data.tujuan)) return data;
    }
  } catch {
    // localStorage rusak atau tidak tersedia: mulai dari data contoh.
  }
  return { transaksi: transaksiAwal(), anggaran: { ...ANGGARAN_AWAL }, tujuan: tujuanAwal() };
}

export function simpanData(data) {
  try {
    localStorage.setItem(KUNCI, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function resetData() {
  const data = { transaksi: transaksiAwal(), anggaran: { ...ANGGARAN_AWAL }, tujuan: tujuanAwal() };
  simpanData(data);
  return data;
}

export function buatId(prefix) {
  return prefix + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36);
}

// Ringkasan satu bulan: total masuk, keluar, dan pengeluaran per kategori.
export function ringkasanBulan(data, bulan) {
  const masuk = data.transaksi
    .filter((t) => t.jenis === 'masuk' && t.tanggal.startsWith(bulan))
    .reduce((s, t) => s + t.jumlah, 0);
  const keluarList = data.transaksi.filter((t) => t.jenis === 'keluar' && t.tanggal.startsWith(bulan));
  const keluar = keluarList.reduce((s, t) => s + t.jumlah, 0);
  const perKategori = {};
  for (const t of keluarList) perKategori[t.kategori] = (perKategori[t.kategori] || 0) + t.jumlah;
  return { masuk, keluar, sisa: masuk - keluar, perKategori, jumlahTransaksi: keluarList.length };
}
