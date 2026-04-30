import { useState, useEffect } from 'react';
import FormTransaksi from './components/FormTransaksi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

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
  const [kategoriList, setKategoriList] = useState([]);
  const [namaKategoriBaru, setNamaKategoriBaru] = useState('');
  
  const [paidPromotes, setPaidPromotes] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [waktuLive, setWaktuLive] = useState(new Date());

  const [loginError, setLoginError] = useState('');
  const [notifCreds, setNotifCreds] = useState('');
  const [notifPj, setNotifPj] = useState('');
  const [notifKategori, setNotifKategori] = useState('');
  const [notifTable, setNotifTable] = useState('');
  const [editTxData, setEditTxData] = useState(null);

  const [formPp, setFormPp] = useState({ nama_pemesan: '', tanggal_mulai: '', tanggal_selesai: '', harga: '' });
  const [editPpData, setEditPpData] = useState(null);
  const [formProp, setFormProp] = useState({ pj_pengantar: '', instansi: '', status: 'Menunggu' });
  const [editPropId, setEditPropId] = useState(null);
  const [editPropData, setEditPropData] = useState(null);
  const [editPropNominal, setEditPropNominal] = useState('');

  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setWaktuLive(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    fetch('http://localhost:3000/api/stats').then((r) => r.json()).then((d) => setStats(d)).catch(()=>null);
    fetch('http://localhost:3000/api/transaksi').then((r) => r.json()).then((d) => setTransaksi(d)).catch(()=>null);
    fetch('http://localhost:3000/api/pic').then((r) => r.json()).then((d) => setPicList(d)).catch(()=>null);
    fetch('http://localhost:3000/api/kategori').then((r) => r.json()).then((d) => setKategoriList(d)).catch(()=>null);
    fetch('http://localhost:3000/api/paid-promote').then((r) => r.json()).then((d) => setPaidPromotes(d)).catch(()=>null);
    fetch('http://localhost:3000/api/proposal').then((r) => r.json()).then((d) => setProposals(d)).catch(()=>null);
  };
  useEffect(() => { if (isLoggedIn) loadData(); }, [isLoggedIn]);

  const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  const formatTanggalDB = (isoString) => isoString ? new Date(isoString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
  const showNotif = (msg) => { setNotifTable(msg); window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => setNotifTable(''), 5000); };

  const getKategoriOtomatis = (tx) => {
    if (tx.kategori?.nama) return tx.kategori.nama;
    if (tx.keterangan?.toLowerCase().includes('paid promote')) return 'Paid Promote (Auto)';
    if (tx.keterangan?.toLowerCase().includes('proposal')) return 'Proposal (Auto)';
    return '-';
  };

  const safeTransaksi = Array.isArray(transaksi) ? transaksi : [];
  const safePicList = Array.isArray(picList) ? picList : [];
  const safeKategoriList = Array.isArray(kategoriList) ? kategoriList : [];
  const safePaidPromotes = Array.isArray(paidPromotes) ? paidPromotes : [];
  const safeProposals = Array.isArray(proposals) ? proposals : [];

  const dataBar = [{ name: 'Arus Kas', Pemasukan: stats.total_kredit || 0, Pengeluaran: stats.total_debit || 0 }];
  const dataPie = safeTransaksi.filter((t) => t.tipe === 'DEBIT').reduce((acc, curr) => {
      const cat = getKategoriOtomatis(curr);
      const existing = acc.find((item) => item.name === cat);
      if (existing) existing.value += curr.nominal;
      else acc.push({ name: cat, value: curr.nominal });
      return acc;
    }, []);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.03) return null; 
    return ( <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontWeight="bold" fontSize="14px">{`${(percent * 100).toFixed(0)}%`}</text> );
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (inputLogin.username === credentials.username && inputLogin.password === credentials.password) { setLoginError(''); setIsLoggedIn(true); localStorage.setItem('isLoggedIn', 'true'); } 
    else { setLoginError('Username atau Password salah bro!'); }
  };
  const handleLogout = () => { if (window.confirm('Yakin mau keluar?')) { setIsLoggedIn(false); localStorage.removeItem('isLoggedIn'); setActiveMenu('dashboard'); } };

  // ==== HANDLERS TRANSPARANSI ====
  const exportExcel = () => {
    const headers = ['ID', 'Tanggal', 'Tipe', 'Keterangan', 'Kategori', 'PJ', 'Nominal'];
    const rows = [headers.join(',')];
    safeTransaksi.forEach((t) => {
      const idStr = `TRX-${t.id.toString().padStart(4, '0')}`;
      const tipeStr = t.tipe === 'KREDIT' ? 'Pemasukan' : 'Pengeluaran';
      rows.push([idStr, t.tanggal.split('T')[0], tipeStr, `"${t.keterangan || ''}"`, getKategoriOtomatis(t), t.pj?.nama || '-', t.nominal].join(','));
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'Laporan_Keuangan_Danus.csv'; a.click();
  };
  const exportPDF = () => window.print();
  const handleHapusTx = async (id) => { if (window.confirm('Yakin ingin menghapus transaksi ini?')) { await fetch(`http://localhost:3000/api/transaksi/${id}`, { method: 'DELETE' }); showNotif('Data transaksi berhasil dihapus!'); loadData(); } };

  // ==== HANDLERS PAID PROMOTE & PROPOSAL ====
  const hitungDurasiHari = (start, end) => { if (!start || !end) return 0; return Math.max(0, Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24))); };
  const submitPp = async (e) => {
    e.preventDefault();
    if (editPpData) { await fetch(`http://localhost:3000/api/paid-promote/${editPpData.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formPp) }); showNotif('Paid Promote berhasil diupdate!'); } 
    else { await fetch('http://localhost:3000/api/paid-promote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formPp) }); showNotif('Paid Promote disimpan! Dana otomatis masuk ke Transparansi!'); }
    setFormPp({ nama_pemesan: '', tanggal_mulai: '', tanggal_selesai: '', harga: '' }); setEditPpData(null); loadData();
  };
  const triggerEditPp = (pp) => { setEditPpData(pp); setFormPp({ nama_pemesan: pp.nama_pemesan, tanggal_mulai: pp.tanggal_mulai.split('T')[0], tanggal_selesai: pp.tanggal_selesai.split('T')[0], harga: pp.harga }); };
  const batalPp = async (id) => { if (window.confirm('Batalkan PP ini? Saldo Transparansi akan ditarik kembali.')) { await fetch(`http://localhost:3000/api/paid-promote/${id}/batal`, { method: 'PUT' }); showNotif('Paid Promote dibatalkan!'); loadData(); } };
  const hapusPp = async (id) => { if (window.confirm('Yakin ingin menghapus Paid Promote ini permanen? Data Transparansi terkait juga akan terhapus.')) { await fetch(`http://localhost:3000/api/paid-promote/${id}`, { method: 'DELETE' }); showNotif('Paid Promote berhasil dihapus!'); loadData(); } };

  const submitProp = async (e) => {
    e.preventDefault();
    if (editPropData) { await fetch(`http://localhost:3000/api/proposal/${editPropData.id}/edit`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formProp) }); showNotif('Data Proposal berhasil diupdate!'); } 
    else { await fetch('http://localhost:3000/api/proposal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formProp) }); showNotif('Proposal berhasil ditambah!'); }
    setFormProp({ pj_pengantar: '', instansi: '', status: 'Menunggu' }); setEditPropData(null); loadData();
  };
  const triggerEditProp = (pr) => { setEditPropData(pr); setFormProp({ pj_pengantar: pr.pj_pengantar, instansi: pr.instansi, status: pr.status }); };
  const updateStatusProp = async (id, status, nominal) => {
    await fetch(`http://localhost:3000/api/proposal/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, nominal_cair: nominal }) });
    setEditPropId(null); setEditPropNominal(''); showNotif(status === 'Dicairkan' ? 'Hore cair! Dana otomatis masuk Transparansi!' : 'Status Proposal diupdate!'); loadData();
  };
  const hapusProp = async (id) => { if (window.confirm('Yakin ingin menghapus Proposal ini permanen? Data Transparansi terkait juga akan terhapus.')) { await fetch(`http://localhost:3000/api/proposal/${id}`, { method: 'DELETE' }); showNotif('Proposal berhasil dihapus!'); loadData(); } };

  // ==== HANDLERS PENGATURAN ====
  const handleUpdateCreds = (e) => { e.preventDefault(); setCredentials(inputGantiCreds); localStorage.setItem('sidanus_creds', JSON.stringify(inputGantiCreds)); setNotifCreds('Kredensial Login berhasil diubah.'); setTimeout(() => setNotifCreds(''), 4000); };
  const handleTambahPj = async (e) => { e.preventDefault(); try { const res = await fetch('http://localhost:3000/api/pic', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nama: namaPjBaru }) }); if (res.ok) { setNotifPj(`PJ sukses ditambahkan!`); setNamaPjBaru(''); loadData(); setTimeout(() => setNotifPj(''), 4000); } } catch (err) { setNotifPj('Gagal nyimpan PJ!'); } };
  const handleHapusPj = async (id, nama) => { if (window.confirm(`Yakin mau menghapus PJ "${nama}"?`)) { await fetch(`http://localhost:3000/api/pic/${id}`, { method: 'DELETE' }); setNotifPj(`PJ "${nama}" dihapus!`); loadData(); setTimeout(() => setNotifPj(''), 4000); } };
  const handleTambahKategori = async (e) => { e.preventDefault(); try { const res = await fetch('http://localhost:3000/api/kategori', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nama: namaKategoriBaru }) }); if (res.ok) { setNotifKategori(`Kategori sukses ditambahkan!`); setNamaKategoriBaru(''); loadData(); setTimeout(() => setNotifKategori(''), 4000); } } catch (err) { setNotifKategori('Gagal nyimpan Kategori!'); } };
  const handleHapusKategori = async (id, nama) => { if (window.confirm(`Yakin mau menghapus Kategori "${nama}"?`)) { await fetch(`http://localhost:3000/api/kategori/${id}`, { method: 'DELETE' }); setNotifKategori(`Kategori "${nama}" dihapus!`); loadData(); setTimeout(() => setNotifKategori(''), 4000); } };

  // ==== HANDLER RESET DATABASE (DANGER ZONE) ====
  const handleFactoryReset = async () => {
    const yakin = window.confirm("PERINGATAN BAHAYA!\n\nApakah kamu yakin ingin MENGHAPUS SEMUA DATA (Transaksi, Paid Promote, Proposal, PJ, Kategori)? Data yang dihapus tidak bisa dikembalikan!");
    if (yakin) {
      const kataSandi = window.prompt("Ketik kata sandi 'RESET' (huruf besar semua) untuk konfirmasi penghapusan seluruh database secara permanen:");
      if (kataSandi === 'RESET') {
        try {
          const res = await fetch('http://localhost:3000/api/reset-database', { method: 'DELETE' });
          if (res.ok) {
            showNotif('✅ DATABASE BERHASIL DICUCI BERSIH! Aplikasi kembali seperti baru. ID mulai dari 001.');
            loadData();
          }
        } catch (error) { alert('Gagal mereset database. Pastikan server nyala.'); }
      } else if (kataSandi !== null) {
        alert('Reset dibatalkan. Kata kunci salah.');
      }
    }
  };


  if (!isLoggedIn) {
    return (
      <div className={`flex h-screen bg-gray-900 items-center justify-center font-sans`}>
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-8"><h1 className="text-4xl font-bold text-gray-800 tracking-wider mb-2">Si<span className="text-emerald-500">Danus</span></h1><p className="text-gray-500 font-medium">Portal Keuangan Danus INFEST</p></div>
          {loginError && <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-center rounded-lg font-bold">{loginError}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="Username" required className="w-full p-3 border rounded-xl" onChange={(e) => setInputLogin({ ...inputLogin, username: e.target.value })} />
            <input type="password" placeholder="Password" required className="w-full p-3 border rounded-xl" onChange={(e) => setInputLogin({ ...inputLogin, password: e.target.value })} />
            <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700">Masuk Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 print:bg-white print:h-auto relative">
      
      {/* ===== MODAL BUKU PANDUAN MANUAL ===== */}
      {showManual && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col transform transition-all">
            <div className={`p-6 border-b flex justify-between items-center text-white rounded-t-2xl ${activeTheme.bgSide}`}>
              <h3 className="text-xl font-bold">📖 Panduan Penggunaan SiDanus</h3>
              <button onClick={() => setShowManual(false)} className="text-white hover:text-rose-300 font-bold text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-gray-700">
              <section>
                <h4 className="font-bold text-lg text-gray-900 border-b pb-2 mb-2">1. Sistem Transparansi (Auto-Sync)</h4>
                <p className="text-sm">SiDanus didesain agar saling terhubung. Jika kamu menginput <strong>Paid Promote</strong> baru atau mengubah status <strong>Proposal</strong> menjadi "Dicairkan", maka uang pemasukan akan <strong>Otomatis Tercatat</strong> di halaman Transparansi. Kamu tidak perlu mengetik manual 2 kali!</p>
              </section>
              <section>
                <h4 className="font-bold text-lg text-gray-900 border-b pb-2 mb-2">2. Mengedit Data & Uang</h4>
                <p className="text-sm">Jika kamu mengedit harga Paid Promote atau mengedit pencairan Proposal, tenang saja, sistem juga akan secara cerdas <strong>Memperbarui Saldo di Transparansi</strong> secara otomatis mengikuti data yang baru.</p>
              </section>
              <section>
                <h4 className="font-bold text-lg text-gray-900 border-b pb-2 mb-2">3. Menu Pengaturan Master Data</h4>
                <p className="text-sm">Sebelum memakai menu utama, disarankan untuk masuk ke <strong>Pengaturan</strong> terlebih dahulu. Daftarkan nama anak-anak divisi Danus ke form <em>Penanggung Jawab (PJ)</em>, dan buat <em>Kategori Pengeluaran/Pemasukan</em>. Data ini nantinya akan muncul di Dropdown Form Transaksi.</p>
              </section>
              <section className="bg-rose-50 border border-rose-200 p-5 rounded-xl">
                <h4 className="font-extrabold text-lg text-rose-700 mb-2 flex items-center gap-2">⚠️ Cara Cuci Gudang / Reset Database</h4>
                <p className="text-sm mb-3">Jika masa <i>testing</i> aplikasi sudah selesai dan kamu ingin menghapus semua kuitansi agar nomor ID (TRX, PROP, PP) bersih kembali ke 001 untuk digunakan pada hari-H INFEST, cukup masuk ke menu <b>Pengaturan</b>, lalu cari tombol merah <b>"Hapus Semua Data & Kembalikan ke Awal (001)"</b> di bagian paling bawah. Masukkan kata sandi rahasia "RESET", dan SiDanus akan bersih seperti baru lahir!</p>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className={`w-64 text-white flex flex-col shadow-xl z-10 print:hidden ${activeTheme.bgSide} transition-colors duration-500`}>
        <div className={`h-20 flex items-center justify-center border-b ${activeTheme.border}`}><h1 className="text-2xl font-bold tracking-wider">Si<span className={activeTheme.textAccent}>Danus</span></h1></div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {['dashboard', 'transparansi', 'paid promote', 'proposal', 'pengaturan'].map((menu) => (
            <button key={menu} onClick={() => setActiveMenu(menu)} className={`w-full text-left px-4 py-3 rounded-lg font-semibold uppercase text-sm transition ${ activeMenu === menu ? 'bg-white/20 shadow-sm' : 'hover:bg-white/10' }`}>{menu}</button>
          ))}
        </nav>
        <div className={`p-4 border-t ${activeTheme.border}`}><button onClick={handleLogout} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-lg">Logout</button></div>
      </aside>

      <main className="flex-1 overflow-y-auto print:overflow-visible print:w-full">
        {/* HEADER DENGAN TOMBOL PANDUAN (?) */}
        <header className="bg-white shadow-sm h-20 flex items-center px-8 sticky top-0 z-10 print:hidden justify-between">
          <h2 className="text-xl font-bold text-gray-700 uppercase">{activeMenu}</h2>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowManual(true)} className="bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors h-10 w-10 rounded-full font-extrabold text-xl flex items-center justify-center shadow-sm" title="Panduan Penggunaan">?</button>
            <div className="font-bold text-gray-500 uppercase border-l-2 pl-4">Divisi Danus INFEST</div>
          </div>
        </header>

        <div className="p-8 print:p-0">
          {notifTable && <div className="mb-6 p-4 bg-emerald-100 text-emerald-800 font-bold rounded-xl shadow-sm print:hidden border border-emerald-200">{notifTable}</div>}

          {/* === DASHBOARD === */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6 print:hidden">
              <div className={`bg-gradient-to-r text-white p-6 rounded-2xl shadow-md flex justify-between items-center ${activeTheme.grad} transition-colors duration-500`}><div><h3 className="text-sm font-medium mb-1">Waktu Saat Ini</h3><p className="text-xl font-bold">{waktuLive.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', })}</p></div><div className="text-3xl font-mono font-bold bg-black/20 px-6 py-3 rounded-xl shadow-inner tracking-widest">{waktuLive.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', })} WIB</div></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500"><p className="text-sm text-gray-500 font-semibold mb-1">Total Saldo Danus</p><h3 className="text-3xl font-bold">{formatRupiah(stats.saldo_saat_ini)}</h3></div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-emerald-500"><p className="text-sm text-gray-500 font-semibold mb-1">Pemasukan (+)</p><h3 className="text-2xl font-bold text-emerald-600">+{formatRupiah(stats.total_kredit)}</h3></div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-rose-500"><p className="text-sm text-gray-500 font-semibold mb-1">Pengeluaran (-)</p><h3 className="text-2xl font-bold text-rose-600">-{formatRupiah(stats.total_debit)}</h3></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm h-96 border border-gray-100 flex flex-col"><h4 className="font-bold text-gray-700 mb-4">Grafik Arus Kas (Pemasukan vs Pengeluaran)</h4><ResponsiveContainer width="100%" height="100%"><BarChart data={dataBar} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis tickFormatter={(value) => `Rp${value / 1000}k`} /><RechartsTooltip formatter={(value) => formatRupiah(value)} /><Legend /><Bar dataKey="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} /><Bar dataKey="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
                <div className="bg-white p-6 rounded-2xl shadow-sm h-96 border border-gray-100 flex flex-col"><h4 className="font-bold text-gray-700 mb-4">Persentase Pengeluaran per Kategori</h4>{dataPie.length === 0 ? (<div className="flex-1 flex items-center justify-center text-gray-400 font-medium">Belum ada data pengeluaran</div>) : (<ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={dataPie} cx="50%" cy="50%" labelLine={false} label={renderCustomizedLabel} outerRadius={120} fill="#8884d8" dataKey="value">
                        {dataPie.map((entry, index) => (<Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => formatRupiah(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>)}</div>
              </div>
            </div>
          )}

          {/* === TRANSPARANSI === */}
          {activeMenu === 'transparansi' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block print:w-full">
              <div className="lg:col-span-1 print:hidden">
                <FormTransaksi theme={activeTheme} editData={editTxData} onCancelEdit={() => setEditTxData(null)} onSuccess={(aksi) => { showNotif(`Transaksi manual berhasil ${aksi}!`); setEditTxData(null); loadData(); }} picList={safePicList} kategoriList={safeKategoriList} />
              </div>
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 flex flex-col print:shadow-none print:border-0 print:m-0 print:p-0 print:block">
                <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center print:hidden"><h4 className="font-bold text-gray-700">Riwayat Transaksi Utama</h4><div className="flex gap-2"><button onClick={exportPDF} className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold py-2 px-4 rounded-lg">Ekspor PDF</button><button onClick={exportExcel} className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded-lg">Ekspor Excel</button></div></div>
                <div className="hidden print:block text-center pt-4 pb-6 w-full"><h2 className="text-2xl font-extrabold text-gray-900 uppercase tracking-widest">Laporan Transparansi Dana</h2><h3 className="text-lg font-bold text-gray-700 uppercase">Divisi Danus - INFEST 2026</h3><p className="text-sm text-gray-500 mt-1">Dicetak pada: {formatTanggalDB(new Date().toISOString())}</p><div className="border-b-4 border-gray-900 w-full mt-4 mb-1"></div><div className="border-b-2 border-gray-900 w-full mb-6"></div></div>
                <div className="flex-1 p-4 print:p-0 overflow-x-auto print:overflow-visible">
                  <table className="w-full text-sm text-left text-gray-600 print:border-collapse print:w-full print:border print:border-gray-800">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 print:bg-gray-200">
                      <tr>
                        <th className="px-4 py-3 print:border print:border-gray-800">ID</th>
                        <th className="px-4 py-3 print:border print:border-gray-800">Tanggal</th>
                        <th className="px-4 py-3 print:border print:border-gray-800">Tipe</th> 
                        <th className="px-4 py-3 print:border print:border-gray-800">Keterangan</th>
                        <th className="px-4 py-3 print:border print:border-gray-800">Kategori</th>
                        <th className="px-4 py-3 print:border print:border-gray-800">PJ</th>
                        <th className="px-4 py-3 print:border print:border-gray-800 text-right">Nominal</th>
                        <th className="px-4 py-3 text-center print:hidden">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {safeTransaksi.length === 0 ? ( <tr><td colSpan="8" className="text-center py-8 print:border print:border-gray-800">Belum ada transaksi</td></tr> ) : (
                        safeTransaksi.map((tx) => (
                          <tr key={tx.id} className="border-b hover:bg-gray-50 print:border-b print:border-gray-800">
                            <td className="px-4 py-3 font-mono font-bold text-gray-500 print:border print:border-gray-800">TRX-{tx.id.toString().padStart(4, '0')}</td>
                            <td className="px-4 py-3 whitespace-nowrap print:border print:border-gray-800">{formatTanggalDB(tx.tanggal)}</td>
                            <td className={`px-4 py-3 font-bold print:border print:border-gray-800 ${tx.tipe === 'KREDIT' ? 'text-emerald-600 print:text-gray-900' : 'text-rose-600 print:text-gray-900'}`}>{tx.tipe === 'KREDIT' ? 'Pemasukan' : 'Pengeluaran'}</td>
                            <td className="px-4 py-3 font-medium text-gray-800 print:border print:border-gray-800">{tx.keterangan || '-'}</td>
                            <td className="px-4 py-3 font-bold text-gray-800 print:border print:border-gray-800">{getKategoriOtomatis(tx)}</td>
                            <td className="px-4 py-3 print:border print:border-gray-800">{tx.pj?.nama || '-'}</td>
                            <td className={`px-4 py-3 font-bold whitespace-nowrap text-right print:border print:border-gray-800 ${tx.tipe === 'KREDIT' ? 'text-emerald-600 print:text-gray-900' : 'text-rose-600 print:text-gray-900'}`}>{tx.tipe === 'KREDIT' ? '+' : '-'}{formatRupiah(tx.nominal)}</td>
                            <td className="px-4 py-3 text-center print:hidden whitespace-nowrap"><button onClick={() => setEditTxData(tx)} className="text-blue-500 hover:text-blue-700 font-bold mx-2">Edit</button><button onClick={() => handleHapusTx(tx.id)} className="text-rose-500 hover:text-rose-700 font-bold mx-2">Hapus</button></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="hidden print:table-footer-group font-bold text-gray-900 bg-gray-100">
                      <tr><td colSpan="6" className="px-4 py-3 text-right print:border print:border-gray-800">TOTAL PEMASUKAN</td><td className="px-4 py-3 text-right print:border print:border-gray-800">{formatRupiah(stats.total_kredit)}</td></tr>
                      <tr><td colSpan="6" className="px-4 py-3 text-right print:border print:border-gray-800">TOTAL PENGELUARAN</td><td className="px-4 py-3 text-right print:border print:border-gray-800">{formatRupiah(stats.total_debit)}</td></tr>
                      <tr><td colSpan="6" className="px-4 py-3 text-right print:border print:border-gray-800 uppercase">Saldo Akhir</td><td className="px-4 py-3 text-right print:border print:border-gray-800 text-lg">{formatRupiah(stats.saldo_saat_ini)}</td></tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* === PAID PROMOTE === */}
          {activeMenu === 'paid promote' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm h-fit border border-gray-100">
                <h3 className="text-lg font-bold mb-4">{editPpData ? 'Edit Paid Promote' : 'Input Paid Promote'}</h3>
                <form onSubmit={submitPp} className="space-y-4">
                  <div><label className="text-sm font-medium mb-1 block">Nama Pemesan</label><input type="text" value={formPp.nama_pemesan} onChange={(e) => setFormPp({ ...formPp, nama_pemesan: e.target.value })} required className={`w-full p-2 border rounded-lg ${activeTheme.ring}`} /></div>
                  <div className="flex gap-2">
                    <div className="flex-1"><label className="text-sm font-medium mb-1 block">Mulai</label><input type="date" value={formPp.tanggal_mulai} onChange={(e) => setFormPp({ ...formPp, tanggal_mulai: e.target.value })} required className={`w-full p-2 border rounded-lg ${activeTheme.ring}`} /></div>
                    <div className="flex-1"><label className="text-sm font-medium mb-1 block">Selesai</label><input type="date" value={formPp.tanggal_selesai} onChange={(e) => setFormPp({ ...formPp, tanggal_selesai: e.target.value })} required className={`w-full p-2 border rounded-lg ${activeTheme.ring}`} /></div>
                  </div>
                  <div className="text-sm text-gray-500 font-bold text-right">Durasi: {hitungDurasiHari(formPp.tanggal_mulai, formPp.tanggal_selesai)} Hari</div>
                  <div><label className="text-sm font-medium mb-1 block">Harga (Rp)</label><input type="number" value={formPp.harga} onChange={(e) => setFormPp({ ...formPp, harga: e.target.value })} required className={`w-full p-2 border rounded-lg ${activeTheme.ring}`} /></div>
                  <div className="flex gap-2">
                    <button type="submit" className={`flex-1 text-white font-bold py-3 rounded-lg ${ editPpData ? 'bg-orange-500 hover:bg-orange-600' : activeTheme.btn }`}>{editPpData ? 'Update PP' : 'Simpan PP'}</button>
                    {editPpData && (<button type="button" onClick={() => { setEditPpData(null); setFormPp({ nama_pemesan: '', tanggal_mulai: '', tanggal_selesai: '', harga: '' }); }} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-lg">Batal</button>)}
                  </div>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col border border-gray-100">
                <div className="px-6 py-4 border-b bg-gray-50"><h4 className="font-bold text-gray-700">Riwayat Paid Promote</h4></div>
                <div className="flex-1 p-4 overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-xs uppercase"><tr><th className="p-3">ID</th><th className="p-3">Pemesan</th><th className="p-3">Durasi</th><th className="p-3">Harga</th><th className="p-3">Status</th><th className="p-3 text-center">Aksi</th></tr></thead>
                    <tbody>
                      {safePaidPromotes.length === 0 ? ( <tr><td colSpan="6" className="text-center py-8 text-gray-500">Belum ada PP</td></tr> ) : (
                        safePaidPromotes.map((pp) => {
                          const isExpired = new Date() > new Date(pp.tanggal_selesai);
                          const statusVisual = pp.status === 'Dibatalkan' ? 'bg-rose-100 text-rose-700' : isExpired ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700';
                          const statusText = pp.status === 'Dibatalkan' ? 'Dibatalkan' : isExpired ? 'Selesai' : 'Aktif';
                          return (
                            <tr key={pp.id} className="border-b hover:bg-gray-50">
                              <td className="p-3 font-mono font-bold text-gray-500">PP-{pp.id.toString().padStart(3, '0')}</td><td className="p-3 font-bold">{pp.nama_pemesan}</td><td className="p-3">{hitungDurasiHari(pp.tanggal_mulai, pp.tanggal_selesai)} Hari</td><td className="p-3 font-bold text-emerald-600">{formatRupiah(pp.harga)}</td><td className="p-3"><span className={`px-2 py-1 rounded-md text-xs font-bold ${statusVisual}`}>{statusText}</span></td>
                              <td className="p-3 text-center whitespace-nowrap">
                                {pp.status !== 'Dibatalkan' && (<button onClick={() => batalPp(pp.id)} className="text-blue-500 font-bold text-xs hover:underline mx-1">Batalkan</button>)}
                                <button onClick={() => triggerEditPp(pp)} className="text-orange-500 text-xs font-bold hover:underline mx-1">Edit</button>
                                <button onClick={() => hapusPp(pp.id)} className="text-rose-500 text-xs font-bold hover:underline mx-1">Hapus</button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* === PROPOSAL === */}
          {activeMenu === 'proposal' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm h-fit border border-gray-100">
                <h3 className="text-lg font-bold mb-4">{editPropData ? 'Edit Data Proposal' : 'Input Proposal'}</h3>
                <form onSubmit={submitProp} className="space-y-4">
                  <div><label className="text-sm font-medium mb-1 block">PJ Pengantar (Manual)</label><input type="text" value={formProp.pj_pengantar} onChange={(e) => setFormProp({ ...formProp, pj_pengantar: e.target.value })} required className={`w-full p-2 border rounded-lg ${activeTheme.ring}`} /></div>
                  <div><label className="text-sm font-medium mb-1 block">Instansi Tujuan</label><input type="text" value={formProp.instansi} onChange={(e) => setFormProp({ ...formProp, instansi: e.target.value })} required className={`w-full p-2 border rounded-lg ${activeTheme.ring}`} /></div>
                  <div className="flex gap-2">
                    <button type="submit" className={`flex-1 text-white font-bold py-3 rounded-lg ${ editPropData ? 'bg-orange-500 hover:bg-orange-600' : activeTheme.btn }`}>{editPropData ? 'Update Proposal' : 'Simpan Proposal'}</button>
                    {editPropData && (<button type="button" onClick={() => { setEditPropData(null); setFormProp({ pj_pengantar: '', instansi: '', status: 'Menunggu' }); }} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-lg">Batal</button>)}
                  </div>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm flex flex-col border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50"><h4 className="font-bold text-gray-700">Riwayat Proposal</h4></div>
                <div className="flex-1 p-4 overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-xs uppercase"><tr><th className="p-3">ID</th><th className="p-3">PJ Pengantar</th><th className="p-3">Instansi</th><th className="p-3">Status</th><th className="p-3">Cair</th><th className="p-3 text-center">Aksi</th></tr></thead>
                    <tbody>
                      {safeProposals.length === 0 ? ( <tr><td colSpan="6" className="text-center py-8 text-gray-500">Belum ada proposal</td></tr> ) : (
                        safeProposals.map((pr) => (
                          <tr key={pr.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-mono font-bold text-gray-500">PROP-{pr.id.toString().padStart(3, '0')}</td><td className="p-3">{pr.pj_pengantar}</td><td className="p-3 font-bold">{pr.instansi}</td>
                            <td className="p-3">
                              {editPropId === pr.id ? (
                                <select value={pr.status} onChange={(e) => { if (e.target.value !== 'Dicairkan') updateStatusProp(pr.id, e.target.value, null); else setEditPropId(pr.id); }} className="p-2 border rounded-md text-xs font-bold shadow-sm">
                                  <option value="Menunggu">Menunggu</option><option value="Diterima">Diterima</option><option value="Ditolak">Ditolak</option><option value="Dicairkan">Dicairkan</option>
                                </select>
                              ) : ( <span className={`px-2 py-1 rounded-md text-xs font-bold ${ pr.status === 'Dicairkan' ? 'bg-emerald-100 text-emerald-700' : pr.status === 'Ditolak' ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700' }`}>{pr.status}</span> )}
                            </td>
                            <td className="p-3">
                              {editPropId === pr.id ? (
                                <div className="flex gap-2 items-center"><input type="number" placeholder="Nominal Rp" value={editPropNominal} onChange={(e) => setEditPropNominal(e.target.value)} className="w-24 p-1 text-xs border rounded-md" /><button onClick={() => updateStatusProp(pr.id, 'Dicairkan', editPropNominal)} className="bg-emerald-500 text-white px-3 py-1 text-xs rounded-md font-bold">OK</button></div>
                              ) : ( <span className="font-bold text-emerald-600">{pr.nominal_cair ? formatRupiah(pr.nominal_cair) : '-'}</span> )}
                            </td>
                            <td className="p-3 text-center whitespace-nowrap">
                              {editPropId === pr.id ? ( <button onClick={() => { setEditPropId(null); setEditPropNominal(''); }} className="text-gray-500 text-xs font-bold hover:underline mx-1">Batal</button> ) : ( pr.status !== 'Dicairkan' && ( <button onClick={() => setEditPropId(pr.id)} className="text-blue-500 text-xs font-bold hover:underline mx-1">Status</button> ) )}
                              <button onClick={() => triggerEditProp(pr)} className="text-orange-500 text-xs font-bold hover:underline mx-1">Edit</button><button onClick={() => hapusProp(pr.id)} className="text-rose-500 text-xs font-bold hover:underline mx-1">Hapus</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* === PENGATURAN === */}
          {activeMenu === 'pengaturan' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><h3 className="text-lg font-bold text-gray-700 mb-4">Personalisasi Tema Aplikasi</h3><div className="flex gap-4">{Object.keys(THEMES).map((key) => (<button key={key} onClick={() => { setThemeKey(key); localStorage.setItem('sidanus_theme', key); }} className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition ${THEMES[key].btn} ${themeKey === key ? 'ring-4 ring-offset-2 ring-gray-300' : ''}`}>{THEMES[key].name}</button>))}</div></div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><h3 className="text-lg font-bold text-gray-700 mb-2">Kredensial Login</h3><p className="text-sm text-gray-500 mb-4">Ubah username dan password untuk mengakses SiDanus.</p>{notifCreds && ( <div className="mb-4 p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 text-sm font-semibold">{notifCreds}</div> )}<form onSubmit={handleUpdateCreds} className="space-y-4"><div><label className="block text-sm font-medium mb-1">Username Baru</label><input type="text" value={inputGantiCreds.username} onChange={(e) => setInputGantiCreds({ ...inputGantiCreds, username: e.target.value })} required className={`w-full border-gray-300 rounded-lg p-3 border ${activeTheme.ring}`} /></div><div><label className="block text-sm font-medium mb-1">Password Baru</label><input type="password" value={inputGantiCreds.password} onChange={(e) => setInputGantiCreds({ ...inputGantiCreds, password: e.target.value })} required className={`w-full border-gray-300 rounded-lg p-3 border ${activeTheme.ring}`} /></div><button type="submit" className={`w-full text-white font-bold py-3 rounded-lg ${activeTheme.btn}`}>Simpan Kredensial</button></form></div>
              </div>

              <div className="space-y-6">
                {/* MANAJEMEN PJ */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                  <h3 className="text-lg font-bold text-gray-700 mb-2">Manajemen Penanggung Jawab (PJ)</h3>
                  <p className="text-sm text-gray-500 mb-4">Tambahkan atau hapus nama PJ.</p>
                  {notifPj && ( <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-700 text-sm font-semibold">{notifPj}</div> )}
                  <form onSubmit={handleTambahPj} className="flex gap-4 mb-6">
                    <input type="text" value={namaPjBaru} onChange={(e) => setNamaPjBaru(e.target.value)} placeholder="Nama PJ (cth: Dika)" required className={`flex-1 border-gray-300 rounded-lg p-3 border ${activeTheme.ring}`} />
                    <button type="submit" className={`text-white font-bold py-3 px-6 rounded-lg ${activeTheme.btn}`}>Tambah</button>
                  </form>
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-bold text-gray-600 mb-3">Daftar PJ Aktif:</h4>
                    <ul className="space-y-2 max-h-48 overflow-y-auto">
                      {safePicList.map((pj) => (
                        <li key={pj.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200"><span className="font-medium text-gray-700">{pj.nama}</span><button onClick={() => handleHapusPj(pj.id, pj.nama)} className="text-rose-500 hover:bg-rose-100 text-sm font-bold px-3 py-1 rounded-md transition">Hapus</button></li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* MANAJEMEN KATEGORI BARU */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                  <h3 className="text-lg font-bold text-gray-700 mb-2">Manajemen Kategori Transaksi</h3>
                  <p className="text-sm text-gray-500 mb-4">Atur dropdown kategori form transaksi utama.</p>
                  {notifKategori && ( <div className="mb-4 p-3 bg-purple-50 border-l-4 border-purple-500 text-purple-700 text-sm font-semibold">{notifKategori}</div> )}
                  <form onSubmit={handleTambahKategori} className="flex gap-4 mb-6">
                    <input type="text" value={namaKategoriBaru} onChange={(e) => setNamaKategoriBaru(e.target.value)} placeholder="Kategori (cth: Konsumsi)" required className={`flex-1 border-gray-300 rounded-lg p-3 border ${activeTheme.ring}`} />
                    <button type="submit" className={`text-white font-bold py-3 px-6 rounded-lg ${activeTheme.btn}`}>Tambah</button>
                  </form>
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-bold text-gray-600 mb-3">Kategori Tersedia:</h4>
                    <ul className="space-y-2 max-h-48 overflow-y-auto">
                      {safeKategoriList.map((kat) => (
                        <li key={kat.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200"><span className="font-medium text-gray-700">{kat.nama}</span><button onClick={() => handleHapusKategori(kat.id, kat.nama)} className="text-rose-500 hover:bg-rose-100 text-sm font-bold px-3 py-1 rounded-md transition">Hapus</button></li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* DANGER ZONE: FACTORY RESET */}
                <div className="bg-rose-50 p-6 rounded-2xl shadow-sm border-2 border-rose-200 h-fit mt-8">
                  <h3 className="text-xl font-extrabold text-rose-700 mb-2 flex items-center gap-2">⚠️ DANGER ZONE (Zona Berbahaya)</h3>
                  <p className="text-sm text-rose-800 mb-4 font-medium">Fitur ini digunakan untuk <strong className="bg-rose-200 px-1 rounded">menghapus bersih</strong> seluruh data saat ini (Kuitansi, Proposal, Paid Promote, PJ, Kategori) untuk kembali ke titik awal (ID 001). Biasanya dipakai ketika aplikasi mau di-deploy resmi ke panitia.</p>
                  <button onClick={handleFactoryReset} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-xl text-lg shadow-md transition-all hover:scale-[1.02]">
                    HAPUS SEMUA DATA & KEMBALIKAN KE AWAL (001)
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}