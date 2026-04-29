import { useState, useEffect } from 'react';
import FormTransaksi from './components/FormTransaksi';

function App() {
  // ==== STATE LOGIN & KREDENSIAL ====
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [credentials, setCredentials] = useState(() => {
    const saved = localStorage.getItem('sidanus_creds');
    return saved ? JSON.parse(saved) : { username: 'danus123', password: 'danus123' };
  });
  
  const [inputLogin, setInputLogin] = useState({ username: '', password: '' });
  const [inputGantiCreds, setInputGantiCreds] = useState({ username: credentials.username, password: credentials.password });

  // ==== STATE NOTIFIKASI DALAM KOTAK (PENGGANTI ALERT) ====
  const [loginError, setLoginError] = useState('');
  const [notifCreds, setNotifCreds] = useState('');
  const [notifPj, setNotifPj] = useState('');

  // ==== STATE APLIKASI ====
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [stats, setStats] = useState({ total_kredit: 0, total_debit: 0, saldo_saat_ini: 0 });
  const [transaksi, setTransaksi] = useState([]);
  const [namaPjBaru, setNamaPjBaru] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      fetch('http://localhost:3000/api/stats')
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.error("Gagal load stats:", err));

      fetch('http://localhost:3000/api/transaksi')
        .then(res => res.json())
        .then(data => setTransaksi(data))
        .catch(err => console.error("Gagal load transaksi:", err));
    }
  }, [isLoggedIn]);

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  // ==== HANDLER LOGIN ====
  const handleLogin = (e) => {
    e.preventDefault();
    if (inputLogin.username === credentials.username && inputLogin.password === credentials.password) {
      setLoginError('');
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
    } else {
      // Tampilkan error di dalam kotak login
      setLoginError('Username atau Password salah bro!');
    }
  };

  const handleLogout = () => {
    if(window.confirm('Yakin mau keluar dari SiDanus?')) {
      setIsLoggedIn(false);
      localStorage.removeItem('isLoggedIn');
      setActiveMenu('dashboard');
      setLoginError(''); // Reset pesan error
    }
  };

  // ==== HANDLER PENGATURAN ====
const handleTambahPj = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/pic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: namaPjBaru })
      });

      if (response.ok) {
        setNotifPj(`PJ "${namaPjBaru}" sukses tersimpan di database!`);
        setNamaPjBaru('');
        setTimeout(() => setNotifPj(''), 4000);
      }
    } catch (error) {
      setNotifPj('Gagal nyimpan PJ baru, cek koneksi backend!');
      setTimeout(() => setNotifPj(''), 4000);
    }
  };
  const handleUpdateCreds = (e) => {
    e.preventDefault();
    setCredentials(inputGantiCreds);
    localStorage.setItem('sidanus_creds', JSON.stringify(inputGantiCreds));
    // Tampilkan notifikasi sukses di dalam kotak Kredensial
    setNotifCreds('Mantap! Username & Password berhasil diubah.');
    setTimeout(() => setNotifCreds(''), 4000); // Hilang otomatis setelah 4 detik
  };

  // ==========================================
  // VIEW 1: HALAMAN LOGIN
  // ==========================================
  if (!isLoggedIn) {
    return (
      <div className="flex h-screen bg-emerald-900 items-center justify-center font-sans">
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border-t-8 border-emerald-500">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 tracking-wider mb-2">Si<span className="text-emerald-500">Danus</span></h1>
            <p className="text-gray-500 font-medium">Portal Keuangan INFEST</p>
          </div>

          {/* Kotak Pesan Error Login */}
          {loginError && (
            <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-r-lg text-sm font-semibold text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
              <input 
                type="text" 
                required 
                className="w-full border-gray-300 bg-gray-50 rounded-xl p-3 border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition" 
                placeholder="Masukkan username"
                onChange={e => setInputLogin({...inputLogin, username: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input 
                type="password" 
                required 
                className="w-full border-gray-300 bg-gray-50 rounded-xl p-3 border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition" 
                placeholder="Masukkan password"
                onChange={e => setInputLogin({...inputLogin, password: e.target.value})} 
              />
            </div>
            <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 active:bg-emerald-800 transition mt-4 shadow-lg shadow-emerald-600/30">
              Masuk Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: HALAMAN UTAMA (Sudah Login)
  // ==========================================
  return (
    <div className="flex h-screen bg-green-50 font-sans text-gray-800">
      
      {/* Sidebar Kiri */}
      <aside className="w-64 bg-emerald-800 text-white flex flex-col shadow-xl z-10">
        <div className="h-20 flex items-center justify-center border-b border-emerald-700">
          <h1 className="text-2xl font-bold tracking-wider">Si<span className="text-emerald-300">Danus</span></h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button onClick={() => setActiveMenu('dashboard')} className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition ${activeMenu === 'dashboard' ? 'bg-emerald-700 shadow-sm' : 'hover:bg-emerald-700/50'}`}>Dashboard</button>
          <button onClick={() => setActiveMenu('transparansi')} className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition ${activeMenu === 'transparansi' ? 'bg-emerald-700 shadow-sm' : 'hover:bg-emerald-700/50'}`}>Transparansi</button>
          <button onClick={() => setActiveMenu('pengaturan')} className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition ${activeMenu === 'pengaturan' ? 'bg-emerald-700 shadow-sm' : 'hover:bg-emerald-700/50'}`}>Pengaturan</button>
        </nav>
        <div className="p-4 border-t border-emerald-700">
          <button onClick={handleLogout} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-lg transition shadow-sm">
            Keluar (Logout)
          </button>
        </div>
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
          
          {/* TAMPILAN: DASHBOARD */}
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

          {/* TAMPILAN: TRANSPARANSI */}
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

          {/* TAMPILAN: PENGATURAN */}
          {activeMenu === 'pengaturan' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card 1: Ganti Password */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-700 mb-2">Kredensial Login</h3>
                <p className="text-sm text-gray-500 mb-4">Ubah username dan password untuk mengakses SiDanus.</p>
                
                {notifCreds && (
                  <div className="mb-4 p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 text-sm font-semibold">
                    {notifCreds}
                  </div>
                )}

                <form onSubmit={handleUpdateCreds} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Username Baru</label>
                    <input 
                      type="text" 
                      value={inputGantiCreds.username}
                      onChange={(e) => setInputGantiCreds({...inputGantiCreds, username: e.target.value})}
                      required
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-3 border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Password Baru</label>
                    <input 
                      type="password" 
                      value={inputGantiCreds.password}
                      onChange={(e) => setInputGantiCreds({...inputGantiCreds, password: e.target.value})}
                      required
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-3 border"
                    />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition mt-2">
                    Simpan Perubahan Login
                  </button>
                </form>
              </div>

              {/* Card 2: Tambah PJ */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                <h3 className="text-lg font-bold text-gray-700 mb-2">Manajemen Penanggung Jawab (PJ)</h3>
                <p className="text-sm text-gray-500 mb-4">Tambahkan nama penanggung jawab baru ke dalam sistem.</p>
                
                {notifPj && (
                  <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-700 text-sm font-semibold">
                    {notifPj}
                  </div>
                )}

                <form onSubmit={handleTambahPj} className="flex flex-col gap-4">
                  <input 
                    type="text" 
                    value={namaPjBaru}
                    onChange={(e) => setNamaPjBaru(e.target.value)}
                    placeholder="Masukkan nama PJ (contoh: Dika)" 
                    required
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-3 border"
                  />
                  <button type="submit" className="bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-700 transition">
                    Tambah PJ
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;