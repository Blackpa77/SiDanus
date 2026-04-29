import FormTransaksi from './components/FormTransaksi';
import { useState, useEffect } from 'react';

function App() {
  const [stats, setStats] = useState({ total_kredit: 0, total_debit: 0, saldo_saat_ini: 0 });
  const [transaksi, setTransaksi] = useState([]);

  // Mengambil data dari Backend saat komponen dimuat
  useEffect(() => {
    fetch('http://localhost:3000/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Gagal load stats:", err));

    fetch('http://localhost:3000/api/transaksi')
      .then(res => res.json())
      .then(data => setTransaksi(data))
      .catch(err => console.error("Gagal load transaksi:", err));
  }, []);

  // Format angka ke Rupiah
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="flex h-screen bg-green-50 font-sans text-gray-800">
      
      {/* Sidebar Kiri */}
      <aside className="w-64 bg-emerald-800 text-white flex flex-col shadow-xl z-10">
        <div className="h-20 flex items-center justify-center border-b border-emerald-700">
          <h1 className="text-2xl font-bold tracking-wider">Si<span className="text-emerald-300">Danus</span></h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <a href="#" className="block px-4 py-3 bg-emerald-700 rounded-lg font-semibold shadow-sm">Dashboard</a>
          <a href="#" className="block px-4 py-3 rounded-lg hover:bg-emerald-700 transition">Input Transaksi</a>
        </nav>
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 overflow-y-auto">
        {/* Header Atas */}
        <header className="bg-white shadow-sm h-20 flex items-center justify-between px-8">
          <h2 className="text-xl font-bold text-gray-700">Dashboard Keuangan INFEST</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500">Divisi KWU</span>
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-800 font-bold border-2 border-emerald-500">KWU</div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Kartu Saldo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
              <p className="text-sm text-gray-500 font-semibold mb-1">Total Saldo Tersedia</p>
              <h3 className="text-3xl font-bold text-gray-800">{formatRupiah(stats.saldo_saat_ini)}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-emerald-500">
              <p className="text-sm text-gray-500 font-semibold mb-1">Total Pemasukan (Kredit)</p>
              <h3 className="text-2xl font-bold text-emerald-600">+{formatRupiah(stats.total_kredit)}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-rose-500">
              <p className="text-sm text-gray-500 font-semibold mb-1">Total Pengeluaran (Debit)</p>
              <h3 className="text-2xl font-bold text-rose-600">-{formatRupiah(stats.total_debit)}</h3>
            </div>
          </div>

          {/* Area Bawah: Form Input & Placeholder Tabel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Sisi Kiri: Form Input Transaksi */}
            <div className="lg:col-span-1">
              <FormTransaksi />
            </div>

            {/* Sisi Kanan: Area Tabel & Grafik */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden p-6 border border-gray-100 flex flex-col items-center justify-center">
              <h4 className="font-bold text-gray-700 mb-2">Belum Ada Transaksi</h4>
              <p className="text-gray-500 text-sm">Tabel riwayat dan grafik akan muncul di sini setelah ada data kas yang diinput.</p>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

export default App;