import { useState, useEffect } from 'react';
import FormTransaksi from './components/FormTransaksi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const THEMES = {
  emerald: { name: 'Hijau (Emerald)', bgSide: 'bg-emerald-800', border: 'border-emerald-700', btn: 'bg-emerald-600 hover:bg-emerald-700', textAccent: 'text-emerald-300', ring: 'focus:border-emerald-500 focus:ring-emerald-500', grad: 'from-emerald-800 to-emerald-600' },
  indigo: { name: 'Biru (Indigo)', bgSide: 'bg-indigo-800', border: 'border-indigo-700', btn: 'bg-indigo-600 hover:bg-indigo-700', textAccent: 'text-indigo-300', ring: 'focus:border-indigo-500 focus:ring-indigo-500', grad: 'from-indigo-800 to-indigo-600' },
  rose: { name: 'Merah (Rose)', bgSide: 'bg-rose-800', border: 'border-rose-700', btn: 'bg-rose-600 hover:bg-rose-700', textAccent: 'text-rose-300', ring: 'focus:border-rose-500 focus:ring-rose-500', grad: 'from-rose-800 to-rose-600' },
};

const CHART_COLORS = ['#10b981', '#f43f5e', '#3b82f6', '#f59e0b', '#8b5cf6', '#6366f1'];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [themeKey, setThemeKey] = useState(localStorage.getItem('sidanus_theme') || 'emerald');
  const activeTheme = THEMES[themeKey];

  const [credentials, setCredentials] = useState(() => {
    const saved = localStorage.getItem('sidanus_creds');
    return saved ? JSON.parse(saved) : { username: 'danus123', password: 'danus123' };
  });
  const [inputLogin, setInputLogin] = useState({ username: '', password: '' });
  const [inputGantiCreds, setInputGantiCreds] = useState({ username: credentials.username, password: credentials.password });

  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [stats, setStats] = useState({ total_kredit: 0, total_debit: 0, saldo_saat_ini: 0 });
  const [transaksi, setTransaksi] = useState([]);
  const [picList, setPicList] = useState([]); 
  const [namaPjBaru, setNamaPjBaru] = useState('');
  const [waktuLive, setWaktuLive] = useState(new Date());

  const [loginError, setLoginError] = useState('');
  const [notifCreds, setNotifCreds] = useState('');
  const [notifPj, setNotifPj] = useState('');
  const [notifTable, setNotifTable] = useState('');
  const [editTxData, setEditTxData] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => setWaktuLive(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    fetch('http://localhost:3000/api/stats').then(r => r.json()).then(d => setStats(d));
    fetch('http://localhost:3000/api/transaksi').then(r => r.json()).then(d => setTransaksi(d));
    fetch('http://localhost:3000/api/pic').then(r => r.json()).then(d => setPicList(d));
  };

  useEffect(() => { if (isLoggedIn) loadData(); }, [isLoggedIn]);

  const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  
  const formatTanggalDB = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // FORMAT DATA UNTUK GRAFIK
  const dataBar = [{ name: 'Arus Kas Keseluruhan', Pemasukan: stats.total_kredit, Pengeluaran: stats.total_debit }];
  
  const dataPie = transaksi
    .filter(t => t.tipe === 'DEBIT')
    .reduce((acc, curr) => {
      const cat = curr.kategori?.nama || 'Lainnya';
      const existing = acc.find(item => item.name === cat);
      if (existing) existing.value += curr.nominal;
      else acc.push({ name: cat, value: curr.nominal });
      return acc;
    }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (inputLogin.username === credentials.username && inputLogin.password === credentials.password) {
      setLoginError(''); setIsLoggedIn(true); localStorage.setItem('isLoggedIn', 'true');
    } else { setLoginError('Username atau Password salah bro!'); }
  };
  const handleLogout = () => { if(window.confirm('Yakin mau keluar?')) { setIsLoggedIn(false); localStorage.removeItem('isLoggedIn'); setActiveMenu('dashboard'); } };

  const exportExcel = () => {
    const headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'PJ', 'Keterangan', 'Nominal'];
    const rows = [headers.join(',')];
    transaksi.forEach(t => {
      const idStr = `TRX-${t.id.toString().padStart(4, '0')}`;
      rows.push([idStr, t.tanggal.split('T')[0], t.tipe, t.kategori?.nama, t.pj?.nama, `"${t.keterangan || ''}"`, t.nominal].join(','));
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'Laporan_Keuangan_KWU.csv'; a.click();
  };
  const exportPDF = () => window.print();

  const handleHapusTx = async (id) => {
    if(window.confirm('Yakin ingin menghapus transaksi ini?')) {
      await fetch(`http://localhost:3000/api/transaksi/${id}`, { method: 'DELETE' });
      setNotifTable('Data transaksi berhasil dihapus!'); loadData(); setTimeout(() => setNotifTable(''), 3000);
    }
  };

  const handleUpdateCreds = (e) => {
    e.preventDefault(); setCredentials(inputGantiCreds); localStorage.setItem('sidanus_creds', JSON.stringify(inputGantiCreds));
    setNotifCreds('Kredensial Login berhasil diubah.'); setTimeout(() => setNotifCreds(''), 4000);
  };

  const handleTambahPj = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/pic', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nama: namaPjBaru }) });
      if (res.ok) { setNotifPj(`PJ sukses ditambahkan!`); setNamaPjBaru(''); loadData(); setTimeout(() => setNotifPj(''), 4000); }
    } catch (err) { setNotifPj('Gagal nyimpan PJ!'); }
  };

  const handleHapusPj = async (id, nama) => {
    if(window.confirm(`Yakin mau menghapus PJ "${nama}"?`)) {
      await fetch(`http://localhost:3000/api/pic/${id}`, { method: 'DELETE' });
      setNotifPj(`PJ "${nama}" dihapus!`); loadData(); setTimeout(() => setNotifPj(''), 4000);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className={`flex h-screen bg-gray-900 items-center justify-center font-sans`}>
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md">
           <div className="text-center mb-8"><h1 className="text-4xl font-bold text-gray-800 tracking-wider mb-2">Si<span className="text-emerald-500">Danus</span></h1></div>
           {loginError && <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-center rounded-lg font-bold">{loginError}</div>}
           <form onSubmit={handleLogin} className="space-y-4">
             <input type="text" placeholder="Username" required className="w-full p-3 border rounded-xl" onChange={e => setInputLogin({...inputLogin, username: e.target.value})} />
             <input type="password" placeholder="Password" required className="w-full p-3 border rounded-xl" onChange={e => setInputLogin({...inputLogin, password: e.target.value})} />
             <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700">Masuk</button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 print:bg-white print:h-auto">
      <aside className={`w-64 text-white flex flex-col shadow-xl z-10 print:hidden ${activeTheme.bgSide} transition-colors duration-500`}>
        <div className={`h-20 flex items-center justify-center border-b ${activeTheme.border}`}>
          <h1 className="text-2xl font-bold tracking-wider">Si<span className={activeTheme.textAccent}>Danus</span></h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button onClick={() => setActiveMenu('dashboard')} className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition ${activeMenu === 'dashboard' ? 'bg-white/20 shadow-sm' : 'hover:bg-white/10'}`}>Dashboard</button>
          <button onClick={() => setActiveMenu('transparansi')} className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition ${activeMenu === 'transparansi' ? 'bg-white/20 shadow-sm' : 'hover:bg-white/10'}`}>Transparansi</button>
          <button onClick={() => setActiveMenu('pengaturan')} className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition ${activeMenu === 'pengaturan' ? 'bg-white/20 shadow-sm' : 'hover:bg-white/10'}`}>Pengaturan</button>
        </nav>
        <div className={`p-4 border-t ${activeTheme.border}`}><button onClick={handleLogout} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-lg">Logout</button></div>
      </aside>

      <main className="flex-1 overflow-y-auto print:overflow-visible print:w-full">
        <header className="bg-white shadow-sm h-20 flex items-center px-8 sticky top-0 z-10 print:hidden">
          <h2 className="text-xl font-bold text-gray-700 uppercase">{activeMenu} INFEST</h2>
        </header>

        <div className="p-8 print:p-0">
          {/* VIEW DASHBOARD DENGAN GRAFIK */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6 print:hidden">
              <div className={`bg-gradient-to-r text-white p-6 rounded-2xl shadow-md flex justify-between items-center ${activeTheme.grad} transition-colors duration-500`}>
                <div><h3 className="text-sm font-medium mb-1">Waktu Saat Ini</h3><p className="text-xl font-bold">{waktuLive.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
                <div className="text-3xl font-mono font-bold bg-black/20 px-6 py-3 rounded-xl shadow-inner tracking-widest">{waktuLive.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500"><p className="text-sm text-gray-500 font-semibold mb-1">Total Saldo</p><h3 className="text-3xl font-bold">{formatRupiah(stats.saldo_saat_ini)}</h3></div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-emerald-500"><p className="text-sm text-gray-500 font-semibold mb-1">Pemasukan (+)</p><h3 className="text-2xl font-bold text-emerald-600">+{formatRupiah(stats.total_kredit)}</h3></div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-rose-500"><p className="text-sm text-gray-500 font-semibold mb-1">Pengeluaran (-)</p><h3 className="text-2xl font-bold text-rose-600">-{formatRupiah(stats.total_debit)}</h3></div>
              </div>

              {/* AREA GRAFIK RECHARTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                 <div className="bg-white p-6 rounded-2xl shadow-sm h-96 border border-gray-100 flex flex-col">
                    <h4 className="font-bold text-gray-700 mb-4">Grafik Arus Kas (Pemasukan vs Pengeluaran)</h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dataBar} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `Rp${value/1000}k`} />
                        <RechartsTooltip formatter={(value) => formatRupiah(value)} />
                        <Legend />
                        <Bar dataKey="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                 </div>

                 <div className="bg-white p-6 rounded-2xl shadow-sm h-96 border border-gray-100 flex flex-col">
                    <h4 className="font-bold text-gray-700 mb-4">Persentase Pengeluaran per Kategori</h4>
                    {dataPie.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-gray-400 font-medium">Belum ada data pengeluaran</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={dataPie} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                            {dataPie.map((entry, index) => ( <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} /> ))}
                          </Pie>
                          <RechartsTooltip formatter={(value) => formatRupiah(value)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                 </div>
              </div>
            </div>
          )}

          {/* VIEW TRANSPARANSI */}
          {activeMenu === 'transparansi' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block print:w-full">
              
              <div className="lg:col-span-1 print:hidden">
                <FormTransaksi theme={activeTheme} editData={editTxData} onCancelEdit={() => setEditTxData(null)}
                   onSuccess={(aksi) => { setNotifTable(`Transaksi berhasil ${aksi}!`); setEditTxData(null); loadData(); setTimeout(()=>setNotifTable(''),3000); }} 
                />
              </div>

              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 flex flex-col print:shadow-none print:border-0 print:m-0 print:p-0 print:block">
                
                <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center print:hidden">
                  <h4 className="font-bold text-gray-700">Riwayat Transaksi</h4>
                  <div className="flex gap-2">
                    <button onClick={exportPDF} className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold py-2 px-4 rounded-lg">Ekspor PDF</button>
                    <button onClick={exportExcel} className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded-lg">Ekspor Excel</button>
                  </div>
                </div>
                {notifTable && <div className="p-3 bg-blue-50 text-blue-700 text-center text-sm font-bold print:hidden">{notifTable}</div>}

                <div className="hidden print:block text-center pt-4 pb-6 w-full">
                  <h2 className="text-2xl font-extrabold text-gray-900 uppercase tracking-widest">Laporan Transparansi Dana</h2>
                  <h3 className="text-lg font-bold text-gray-700 uppercase">Divisi Kewirausahaan (KWU) - INFEST 2026</h3>
                  <p className="text-sm text-gray-500 mt-1">Dicetak pada: {formatTanggalDB(new Date().toISOString())}</p>
                  <div className="border-b-4 border-gray-900 w-full mt-4 mb-1"></div><div className="border-b-2 border-gray-900 w-full mb-6"></div>
                </div>

                <div className="flex-1 p-4 print:p-0 overflow-x-auto print:overflow-visible">
                  <table className="w-full text-sm text-left text-gray-600 print:border-collapse print:w-full print:border print:border-gray-800">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 print:bg-gray-200">
                      <tr>
                        <th className="px-4 py-3 print:border print:border-gray-800">ID</th>
                        <th className="px-4 py-3 print:border print:border-gray-800">Tanggal</th>
                        <th className="px-4 py-3 print:border print:border-gray-800">Keterangan</th>
                        <th className="px-4 py-3 print:border print:border-gray-800">Kategori</th>
                        <th className="px-4 py-3 print:border print:border-gray-800">PJ</th>
                        <th className="px-4 py-3 print:border print:border-gray-800 text-right">Nominal</th>
                        <th className="px-4 py-3 text-center print:hidden">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transaksi.length === 0 ? ( <tr><td colSpan="7" className="text-center py-8 print:border print:border-gray-800">Belum ada transaksi</td></tr> ) : (
                        transaksi.map((tx) => (
                          <tr key={tx.id} className="border-b hover:bg-gray-50 print:border-b print:border-gray-800">
                            {/* TAMPILAN ID TRANSAKSI */}
                            <td className="px-4 py-3 font-mono font-bold text-gray-500 print:border print:border-gray-800">TRX-{tx.id.toString().padStart(4, '0')}</td>
                            <td className="px-4 py-3 whitespace-nowrap print:border print:border-gray-800">{formatTanggalDB(tx.tanggal)}</td>
                            <td className="px-4 py-3 font-medium text-gray-800 print:border print:border-gray-800">{tx.keterangan || '-'}</td>
                            <td className="px-4 py-3 print:border print:border-gray-800">{tx.kategori?.nama}</td>
                            <td className="px-4 py-3 print:border print:border-gray-800">{tx.pj?.nama}</td>
                            <td className={`px-4 py-3 font-bold whitespace-nowrap text-right print:border print:border-gray-800 ${tx.tipe === 'KREDIT' ? 'text-emerald-600 print:text-gray-900' : 'text-rose-600 print:text-gray-900'}`}>
                              {tx.tipe === 'KREDIT' ? '+' : '-'}{formatRupiah(tx.nominal)}
                            </td>
                            <td className="px-4 py-3 text-center print:hidden whitespace-nowrap">
                              <button onClick={() => setEditTxData(tx)} className="text-blue-500 hover:text-blue-700 font-bold mx-2">Edit</button>
                              <button onClick={() => handleHapusTx(tx.id)} className="text-rose-500 hover:text-rose-700 font-bold mx-2">Hapus</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="hidden print:table-footer-group font-bold text-gray-900 bg-gray-100">
                      <tr><td colSpan="5" className="px-4 py-3 text-right print:border print:border-gray-800">TOTAL PEMASUKAN</td><td className="px-4 py-3 text-right print:border print:border-gray-800">{formatRupiah(stats.total_kredit)}</td></tr>
                      <tr><td colSpan="5" className="px-4 py-3 text-right print:border print:border-gray-800">TOTAL PENGELUARAN</td><td className="px-4 py-3 text-right print:border print:border-gray-800">{formatRupiah(stats.total_debit)}</td></tr>
                      <tr><td colSpan="5" className="px-4 py-3 text-right print:border print:border-gray-800 uppercase">Saldo Akhir</td><td className="px-4 py-3 text-right print:border print:border-gray-800 text-lg">{formatRupiah(stats.saldo_saat_ini)}</td></tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW PENGATURAN */}
          {activeMenu === 'pengaturan' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><h3 className="text-lg font-bold text-gray-700 mb-4">Personalisasi Tema Aplikasi</h3><div className="flex gap-4">{Object.keys(THEMES).map(key => (<button key={key} onClick={() => { setThemeKey(key); localStorage.setItem('sidanus_theme', key); }} className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition ${THEMES[key].btn} ${themeKey === key ? 'ring-4 ring-offset-2 ring-gray-300' : ''}`}>{THEMES[key].name}</button>))}</div></div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><h3 className="text-lg font-bold text-gray-700 mb-2">Kredensial Login</h3><p className="text-sm text-gray-500 mb-4">Ubah username dan password.</p>{notifCreds && <div className="mb-4 p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 text-sm font-semibold">{notifCreds}</div>}<form onSubmit={handleUpdateCreds} className="space-y-4"><div><label className="block text-sm font-medium mb-1">Username Baru</label><input type="text" value={inputGantiCreds.username} onChange={(e) => setInputGantiCreds({...inputGantiCreds, username: e.target.value})} required className={`w-full border-gray-300 rounded-lg p-3 border ${activeTheme.ring}`} /></div><div><label className="block text-sm font-medium mb-1">Password Baru</label><input type="password" value={inputGantiCreds.password} onChange={(e) => setInputGantiCreds({...inputGantiCreds, password: e.target.value})} required className={`w-full border-gray-300 rounded-lg p-3 border ${activeTheme.ring}`} /></div><button type="submit" className={`w-full text-white font-bold py-3 rounded-lg ${activeTheme.btn}`}>Simpan Kredensial</button></form></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit"><h3 className="text-lg font-bold text-gray-700 mb-2">Manajemen Penanggung Jawab (PJ)</h3><p className="text-sm text-gray-500 mb-4">Tambahkan atau hapus nama PJ.</p>{notifPj && <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-700 text-sm font-semibold">{notifPj}</div>}<form onSubmit={handleTambahPj} className="flex gap-4 mb-6"><input type="text" value={namaPjBaru} onChange={(e) => setNamaPjBaru(e.target.value)} placeholder="Nama PJ (cth: Dika)" required className={`flex-1 border-gray-300 rounded-lg p-3 border ${activeTheme.ring}`} /><button type="submit" className={`text-white font-bold py-3 px-6 rounded-lg ${activeTheme.btn}`}>Tambah</button></form><div className="border-t pt-4"><h4 className="text-sm font-bold text-gray-600 mb-3">Daftar PJ Aktif:</h4><ul className="space-y-2 max-h-60 overflow-y-auto">{picList.map(pj => (<li key={pj.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200"><span className="font-medium text-gray-700">{pj.nama}</span><button onClick={() => handleHapusPj(pj.id, pj.nama)} className="text-rose-500 hover:bg-rose-100 text-sm font-bold px-3 py-1 rounded-md transition">Hapus</button></li>))}</ul></div></div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}