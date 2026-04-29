import { useState, useEffect } from 'react';
import FormTransaksi from './components/FormTransaksi';

function App() {
  // State untuk Navigasi Menu
  const [activeMenu, setActiveMenu] = useState('dashboard');

  // State untuk Data
  const [stats, setStats] = useState({ total_kredit: 0, total_debit: 0, saldo_saat_ini: 0 });
  const [transaksi, setTransaksi] = useState([]);
  
  // State untuk Tambah PJ Baru (Menu Pengaturan)
  const [namaPjBaru, setNamaPjBaru] = useState('');

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

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  // Handler Tambah PJ Baru
  const handleTambahPj = (e) => {
    e.preventDefault();
    // Nanti disambungkan ke API POST
    alert(`Panitia "${namaPjBaru}" siap ditambahkan ke database! (Integrasi API menyusul)`);
    setNamaPjBaru('');
  };

  return (
    <div className="flex h-screen bg-green-50 font-sans text-gray-800">
      
      {/* Sidebar Kiri */}
      <aside className="w-64 bg-emerald-800 text-white flex flex-col shadow-xl z-10">
        <div className="h-20 flex items-center justify-center border-b border-emerald-700">
          <h1 className="text-2xl font-bold tracking-wider">Si<span className="text-emerald-300">Danus</span></h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button 
            onClick={() => setActiveMenu('dashboard')}
            className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition ${activeMenu === 'dashboard' ? 'bg-emerald-700 shadow-sm' : 'hover:bg-emerald-700/50'}`}>
            Dashboard
          </button>
          <button 
            onClick={() => setActiveMenu('transparansi')}
            className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition ${activeMenu === 'transparansi' ? 'bg-emerald-700 shadow-sm' : 'hover:bg-emerald-700/50'}`}>
            Transparansi
          </button>
          <button 
            onClick={() => setActiveMenu('pengaturan')}
            className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition ${activeMenu === 'pengaturan' ? 'bg-emerald-700 shadow-sm' : 'hover:bg-emerald-700/50'}`}>
            Pengaturan
          </button>
        </nav>
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm h-20 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-700 uppercase tracking-wide">
            {activeMenu === 'dashboard' && 'Dashboard Keuangan INFEST'}
            {activeMenu === 'transparansi' && 'Manajemen Transparansi'}
            {activeMenu === 'pengaturan' && 'Pengaturan Sistem'}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500">Divisi KWU</span>
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-800 font-bold border-2 border-emerald-500">KWU</div>
          </div>
        </header>

        <div className="p-8">
          
          {/* ================= VIEW: DASHBOARD ================= */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6">
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

              {/* Tempat Grafik (Sesuai Permintaan) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-2xl shadow-sm h-80 flex flex-col items-center justify-center border border-dashed border-gray-300">
                    <h4 className="font-bold text-gray-400">Area Grafik Arus Kas (Bar Chart)</h4>
                 </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm h-80 flex flex-col items-center justify-center border border-dashed border-gray-300">
                    <h4 className="font-bold text-gray-400">Area Persentase Pengeluaran (Pie Chart)</h4>
                 </div>
              </div>
            </div>
          )}


          {/* ================= VIEW: TRANSPARANSI ================= */}
          {activeMenu === 'transparansi' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <FormTransaksi />
              </div>
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 flex flex-col">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <h4 className="font-bold text-gray-700">Tabel Riwayat Transaksi</h4>
                </div>
                <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                  <p className="text-gray-500 text-sm">Belum ada data transaksi yang tersimpan.</p>
                </div>
              </div>
            </div>
          )}


          {/* ================= VIEW: PENGATURAN ================= */}
          {activeMenu === 'pengaturan' && (
            <div className="max-w-2xl bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-700 mb-4">Manajemen Penanggung Jawab (PIC)</h3>
              <p className="text-sm text-gray-500 mb-6">Tambahkan nama panitia baru agar muncul di pilihan Dropdown saat menginput transaksi.</p>
              
              <form onSubmit={handleTambahPj} className="flex gap-4">
                <input 
                  type="text" 
                  value={namaPjBaru}
                  onChange={(e) => setNamaPjBaru(e.target.value)}
                  placeholder="Masukkan nama panitia (contoh: Dika)" 
                  required
                  className="flex-1 border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-3 border"
                />
                <button type="submit" className="bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-700 transition">
                  Tambah PIC
                </button>
              </form>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;