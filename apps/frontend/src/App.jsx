import { useState, useEffect } from 'react';
import FormTransaksi from './components/FormTransaksi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const THEMES = {
  emerald: { name: 'Hijau (Emerald)', bgSide: 'bg-emerald-800', border: 'border-emerald-700', btn: 'bg-emerald-600 hover:bg-emerald-700', textAccent: 'text-emerald-300', ring: 'focus:border-emerald-500 focus:ring-emerald-500', grad: 'from-emerald-800 to-emerald-600', bgMain: 'bg-gray-50', bgCard: 'bg-white', textMain: 'text-gray-800', textMuted: 'text-gray-500', borderCard: 'border-gray-100', bgTable: 'bg-gray-100' },
  indigo: { name: 'Biru (Indigo)', bgSide: 'bg-indigo-800', border: 'border-indigo-700', btn: 'bg-indigo-600 hover:bg-indigo-700', textAccent: 'text-indigo-300', ring: 'focus:border-indigo-500 focus:ring-indigo-500', grad: 'from-indigo-800 to-indigo-600', bgMain: 'bg-gray-50', bgCard: 'bg-white', textMain: 'text-gray-800', textMuted: 'text-gray-500', borderCard: 'border-gray-100', bgTable: 'bg-gray-100' },
  rose: { name: 'Merah (Rose)', bgSide: 'bg-rose-800', border: 'border-rose-700', btn: 'bg-rose-600 hover:bg-rose-700', textAccent: 'text-rose-300', ring: 'focus:border-rose-500 focus:ring-rose-500', grad: 'from-rose-800 to-rose-600', bgMain: 'bg-gray-50', bgCard: 'bg-white', textMain: 'text-gray-800', textMuted: 'text-gray-500', borderCard: 'border-gray-100', bgTable: 'bg-gray-100' },
  sunset: { name: 'Senja (Sunset)', bgSide: 'bg-amber-700', border: 'border-amber-600', btn: 'bg-amber-500 hover:bg-amber-600', textAccent: 'text-amber-200', ring: 'focus:border-amber-400 focus:ring-amber-400', grad: 'from-amber-700 to-orange-500', bgMain: 'bg-orange-50', bgCard: 'bg-white', textMain: 'text-gray-800', textMuted: 'text-gray-500', borderCard: 'border-orange-100', bgTable: 'bg-orange-100' },
  ocean: { name: 'Samudra (Ocean)', bgSide: 'bg-cyan-800', border: 'border-cyan-700', btn: 'bg-cyan-600 hover:bg-cyan-700', textAccent: 'text-cyan-200', ring: 'focus:border-cyan-500 focus:ring-cyan-500', grad: 'from-cyan-800 to-blue-600', bgMain: 'bg-slate-50', bgCard: 'bg-white', textMain: 'text-slate-800', textMuted: 'text-slate-500', borderCard: 'border-slate-200', bgTable: 'bg-slate-100' },
  dark: { name: 'Gelap (Dark Mode)', bgSide: 'bg-gray-950', border: 'border-gray-800', btn: 'bg-indigo-600 hover:bg-indigo-500', textAccent: 'text-indigo-400', ring: 'focus:border-indigo-500 focus:ring-indigo-500', grad: 'from-gray-900 to-gray-800', bgMain: 'bg-gray-900', bgCard: 'bg-gray-800', textMain: 'text-gray-100', textMuted: 'text-gray-400', borderCard: 'border-gray-700', bgTable: 'bg-gray-700' },
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
  
  const [sysInfo, setSysInfo] = useState({ size_bytes: 0, limit_bytes: 524288000 });
  
  const [targetPendapatan, setTargetPendapatan] = useState(() => {
    return parseInt(localStorage.getItem('sidanus_target') || '10000000', 10);
  });
  const [inputTarget, setInputTarget] = useState(targetPendapatan);

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
  const [modal, setModal] = useState({ isOpen: false, type: 'confirm', title: '', message: '', placeholder: '', expectedText: '', confirmText: 'OK', isDanger: false, onConfirm: null });
  const [modalInput, setModalInput] = useState('');

  useEffect(() => {
    const interval = setInterval(() => setWaktuLive(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    fetch('http://localhost:3000/api/stats').then((r) => r.json()).then((d) => setStats(d)).catch(()=>null);
    fetch('http://localhost:3000/api/transaksi').then((r) => r.json()).then((d) => setTransaksi(d)).catch(()=>null);
    fetch('http://localhost:3000/api/sysinfo').then((r) => r.json()).then((d) => setSysInfo(d)).catch(()=>null);
    fetch('http://localhost:3000/api/pic').then((r) => r.json()).then((d) => setPicList(d)).catch(()=>null);
    fetch('http://localhost:3000/api/kategori').then((r) => r.json()).then((d) => setKategoriList(d)).catch(()=>null);
    fetch('http://localhost:3000/api/paid-promote').then((r) => r.json()).then((d) => setPaidPromotes(d)).catch(()=>null);
    fetch('http://localhost:3000/api/proposal').then((r) => r.json()).then((d) => setProposals(d)).catch(()=>null);
  };
  useEffect(() => { if (isLoggedIn) loadData(); }, [isLoggedIn]);

  const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  const formatTanggalDB = (isoString) => isoString ? new Date(isoString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
  const showNotif = (msg) => { setNotifTable(msg); window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => setNotifTable(''), 5000); };

  const openModal = (config) => { setModal({ ...config, isOpen: true }); setModalInput(''); };
  const closeModal = () => setModal({ ...modal, isOpen: false });

  // BUG FIX SAKTI: Mencegah Layar Putih karena `keterangan` null
  const getKategoriOtomatis = (tx) => {
    if (tx?.kategori?.nama) return tx.kategori.nama;
    const ket = tx?.keterangan?.toLowerCase() || ''; // Fallback string kosong, anti crash!
    if (ket.includes('paid promote')) return 'Paid Promote (Auto)';
    if (ket.includes('proposal')) return 'Proposal (Auto)';
    return '-';
  };

  const safeTransaksi = Array.isArray(transaksi) ? transaksi : [];
  const safePicList = Array.isArray(picList) ? picList : [];
  const safeKategoriList = Array.isArray(kategoriList) ? kategoriList : [];
  const safePaidPromotes = Array.isArray(paidPromotes) ? paidPromotes : [];
  const safeProposals = Array.isArray(proposals) ? proposals : [];

  const dataBar = [{ name: 'Arus Kas', Pemasukan: stats?.total_kredit || 0, Pengeluaran: stats?.total_debit || 0 }];
  const dataPie = safeTransaksi.filter((t) => t?.tipe === 'DEBIT').reduce((acc, curr) => {
      const cat = getKategoriOtomatis(curr);
      const existing = acc.find((item) => item.name === cat);
      if (existing) existing.value += curr?.nominal || 0;
      else acc.push({ name: cat, value: curr?.nominal || 0 });
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

  const persentaseTarget = targetPendapatan > 0 ? ((stats?.total_kredit || 0) / targetPendapatan) * 100 : 0;
  const bulatTarget = Math.min(100, Math.floor(persentaseTarget));
  let teksTarget = ""; let warnaTarget = "";
  if (bulatTarget < 25) { teksTarget = "Wah masih jauh ni dari target 🥲"; warnaTarget = "bg-rose-500 text-rose-500"; }
  else if (bulatTarget >= 25 && bulatTarget < 50) { teksTarget = "Ayo semangat carinya, masih di bawah setengah! 💪"; warnaTarget = "bg-orange-500 text-orange-500"; }
  else if (bulatTarget >= 50 && bulatTarget < 75) { teksTarget = "Oke udah setengah semangat! 🔥"; warnaTarget = "bg-blue-500 text-blue-500"; }
  else if (bulatTarget >= 75 && bulatTarget < 100) { teksTarget = "Dikit lagi tercapai ayo! 🚀"; warnaTarget = "bg-emerald-400 text-emerald-500"; }
  else { teksTarget = "YES, TARGETMU TERCAPAI, SELAMAT LPJ MU AKAN WANGI! 🎉"; warnaTarget = "bg-emerald-600 text-emerald-600"; }

  const mbUsed = ((sysInfo?.size_bytes || 0) / (1024 * 1024)).toFixed(3);
  const mbLimit = ((sysInfo?.limit_bytes || 524288000) / (1024 * 1024)).toFixed(0);
  const persentaseDb = Math.min(100, ((sysInfo?.size_bytes || 0) / (sysInfo?.limit_bytes || 524288000)) * 100);

  const handleLogin = (e) => {
    e.preventDefault();
    if (inputLogin.username === credentials.username && inputLogin.password === credentials.password) { setLoginError(''); setIsLoggedIn(true); localStorage.setItem('isLoggedIn', 'true'); } 
    else { setLoginError('Username atau Password salah bro!'); }
  };

  const handleLogout = () => { 
    openModal({
      type: 'confirm', title: 'Konfirmasi Logout', message: 'Yakin mau keluar dari aplikasi SiDanus?', confirmText: 'Keluar', isDanger: true,
      onConfirm: () => { setIsLoggedIn(false); localStorage.removeItem('isLoggedIn'); setActiveMenu('dashboard'); }
    });
  };

  const exportExcel = () => {
    const headers = ['ID', 'Tanggal', 'Tipe', 'Keterangan', 'Kategori', 'PJ', 'Nominal'];
    const rows = [headers.join(',')];
    safeTransaksi.forEach((t) => {
      const idStr = `TRX-${(t?.id || 0).toString().padStart(4, '0')}`;
      const tipeStr = t?.tipe === 'KREDIT' ? 'Pemasukan' : 'Pengeluaran';
      rows.push([idStr, t?.tanggal?.split('T')[0] || '-', tipeStr, `"${t?.keterangan || ''}"`, getKategoriOtomatis(t), t?.pj?.nama || '-', t?.nominal || 0].join(','));
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'Laporan_Keuangan_Danus.csv'; a.click();
  };
  const exportPDF = () => window.print();

  const handleHapusTx = (id) => { 
    openModal({
      type: 'confirm', title: 'Hapus Transaksi', message: 'Yakin ingin menghapus transaksi ini? Data akan hilang permanen.', confirmText: 'Hapus', isDanger: true,
      onConfirm: async () => { await fetch(`http://localhost:3000/api/transaksi/${id}`, { method: 'DELETE' }); showNotif('✅ Data transaksi berhasil dihapus!'); loadData(); }
    });
  };

  const hitungDurasiHari = (start, end) => { if (!start || !end) return 0; return Math.max(0, Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24))); };
  const submitPp = async (e) => {
    e.preventDefault();
    if (editPpData) { await fetch(`http://localhost:3000/api/paid-promote/${editPpData.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formPp) }); showNotif('✅ Paid Promote berhasil diupdate!'); } 
    else { await fetch('http://localhost:3000/api/paid-promote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formPp) }); showNotif('✅ Paid Promote disimpan! Dana otomatis masuk ke Transparansi!'); }
    setFormPp({ nama_pemesan: '', tanggal_mulai: '', tanggal_selesai: '', harga: '' }); setEditPpData(null); loadData();
  };
  
  // FIX Edit Error: Handle jika tanggal tidak ada 'T'-nya (Meskipun jarang)
  const triggerEditPp = (pp) => { 
    setEditPpData(pp); 
    setFormPp({ 
      nama_pemesan: pp?.nama_pemesan || '', 
      tanggal_mulai: pp?.tanggal_mulai ? String(pp.tanggal_mulai).split('T')[0] : '', 
      tanggal_selesai: pp?.tanggal_selesai ? String(pp.tanggal_selesai).split('T')[0] : '', 
      harga: pp?.harga || '' 
    }); 
  };
  
  const batalPp = (id) => { 
    openModal({
      type: 'confirm', title: 'Batalkan Paid Promote', message: 'Batalkan PP ini? Saldo otomatis akan ditarik kembali dari Transparansi.', confirmText: 'Batalkan PP', isDanger: true,
      onConfirm: async () => { await fetch(`http://localhost:3000/api/paid-promote/${id}/batal`, { method: 'PUT' }); showNotif('✅ Paid Promote dibatalkan!'); loadData(); }
    });
  };
  
  const hapusPp = (id) => { 
    openModal({
      type: 'confirm', title: 'Hapus Permanen PP', message: 'Yakin ingin menghapus Paid Promote ini permanen? Data Transparansi terkait juga akan terhapus.', confirmText: 'Hapus Permanen', isDanger: true,
      onConfirm: async () => { await fetch(`http://localhost:3000/api/paid-promote/${id}`, { method: 'DELETE' }); showNotif('✅ Paid Promote berhasil dihapus!'); loadData(); }
    });
  };

  const submitProp = async (e) => {
    e.preventDefault();
    if (editPropData) { await fetch(`http://localhost:3000/api/proposal/${editPropData.id}/edit`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formProp) }); showNotif('✅ Data Proposal berhasil diupdate!'); } 
    else { await fetch('http://localhost:3000/api/proposal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formProp) }); showNotif('✅ Proposal berhasil ditambah!'); }
    setFormProp({ pj_pengantar: '', instansi: '', status: 'Menunggu' }); setEditPropData(null); loadData();
  };
  const triggerEditProp = (pr) => { setEditPropData(pr); setFormProp({ pj_pengantar: pr?.pj_pengantar || '', instansi: pr?.instansi || '', status: pr?.status || 'Menunggu' }); };
  const updateStatusProp = async (id, status, nominal) => {
    await fetch(`http://localhost:3000/api/proposal/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, nominal_cair: nominal }) });
    setEditPropId(null); setEditPropNominal(''); showNotif(status === 'Dicairkan' ? '✅ Hore cair! Dana otomatis masuk Transparansi!' : '✅ Status Proposal diupdate!'); loadData();
  };
  
  const hapusProp = (id) => { 
    openModal({
      type: 'confirm', title: 'Hapus Permanen Proposal', message: 'Yakin ingin menghapus Proposal ini permanen? Data Transparansi terkait juga akan terhapus.', confirmText: 'Hapus Permanen', isDanger: true,
      onConfirm: async () => { await fetch(`http://localhost:3000/api/proposal/${id}`, { method: 'DELETE' }); showNotif('✅ Proposal berhasil dihapus!'); loadData(); }
    });
  };

  const handleUpdateCreds = (e) => { e.preventDefault(); setCredentials(inputGantiCreds); localStorage.setItem('sidanus_creds', JSON.stringify(inputGantiCreds)); setNotifCreds('✅ Kredensial Login berhasil diubah.'); setTimeout(() => setNotifCreds(''), 4000); };
  const handleUpdateTarget = (e) => { e.preventDefault(); setTargetPendapatan(inputTarget); localStorage.setItem('sidanus_target', inputTarget.toString()); showNotif('✅ Target Pendapatan berhasil diubah!'); window.scrollTo(0,0); };

  const handleTambahPj = async (e) => { e.preventDefault(); try { const res = await fetch('http://localhost:3000/api/pic', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nama: namaPjBaru }) }); if (res.ok) { setNotifPj(`✅ PJ sukses ditambahkan!`); setNamaPjBaru(''); loadData(); setTimeout(() => setNotifPj(''), 4000); } } catch (err) { setNotifPj('❌ Gagal nyimpan PJ!'); } };
  const handleHapusPj = (id, nama) => { 
    openModal({
      type: 'confirm', title: 'Hapus Penanggung Jawab', message: `Yakin mau menghapus PJ bernama "${nama}" dari sistem?`, confirmText: 'Hapus PJ', isDanger: true,
      onConfirm: async () => { await fetch(`http://localhost:3000/api/pic/${id}`, { method: 'DELETE' }); setNotifPj(`✅ PJ "${nama}" dihapus!`); loadData(); setTimeout(() => setNotifPj(''), 4000); }
    });
  };

  const handleTambahKategori = async (e) => { e.preventDefault(); try { const res = await fetch('http://localhost:3000/api/kategori', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nama: namaKategoriBaru }) }); if (res.ok) { setNotifKategori(`✅ Kategori sukses ditambahkan!`); setNamaKategoriBaru(''); loadData(); setTimeout(() => setNotifKategori(''), 4000); } } catch (err) { setNotifKategori('❌ Gagal nyimpan Kategori!'); } };
  const handleHapusKategori = (id, nama) => { 
    openModal({
      type: 'confirm', title: 'Hapus Kategori', message: `Yakin mau menghapus Kategori "${nama}" dari daftar?`, confirmText: 'Hapus Kategori', isDanger: true,
      onConfirm: async () => { await fetch(`http://localhost:3000/api/kategori/${id}`, { method: 'DELETE' }); setNotifKategori(`✅ Kategori "${nama}" dihapus!`); loadData(); setTimeout(() => setNotifKategori(''), 4000); }
    });
  };

  const handleFactoryReset = () => {
    openModal({
      type: 'prompt',
      title: 'DANGER ZONE: Cuci Gudang',
      message: 'PERINGATAN BAHAYA! Tindakan ini akan menghapus SELURUH DATA tanpa sisa untuk kembali ke ID 001. Jika yakin, ketik kata sandi di bawah ini:',
      placeholder: 'Ketik RESET disini...',
      expectedText: 'RESET',
      confirmText: 'Hapus Semua Data',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch('http://localhost:3000/api/reset-database', { method: 'DELETE' });
          if (res.ok) {
            showNotif('✅ DATABASE BERHASIL DICUCI BERSIH! Aplikasi kembali seperti baru. ID mulai dari 001.');
            loadData();
          }
        } catch (error) { showNotif('❌ Gagal mereset database. Pastikan server menyala.'); }
      }
    });
  };

  if (!isLoggedIn) {
    return (
      <div className={`flex h-screen items-center justify-center font-sans ${themeKey==='dark'?'bg-black':'bg-gray-900'}`}>
        <div className={`${activeTheme.bgCard} p-10 rounded-3xl shadow-2xl w-full max-w-md border ${activeTheme.borderCard}`}>
          <div className="text-center mb-8"><h1 className={`text-4xl font-bold tracking-wider mb-2 ${activeTheme.textMain}`}>Si<span className={activeTheme.textAccent.replace('text-','text-').replace('-200','-500').replace('-300','-500')}>Danus</span></h1><p className={`${activeTheme.textMuted} font-medium`}>Portal Keuangan Danus INFEST</p></div>
          {loginError && <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-center rounded-lg font-bold border border-rose-200">{loginError}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="Username" required className={`w-full p-3 border rounded-xl ${activeTheme.bgMain} ${activeTheme.textMain} ${activeTheme.borderCard}`} onChange={(e) => setInputLogin({ ...inputLogin, username: e.target.value })} />
            <input type="password" placeholder="Password" required className={`w-full p-3 border rounded-xl ${activeTheme.bgMain} ${activeTheme.textMain} ${activeTheme.borderCard}`} onChange={(e) => setInputLogin({ ...inputLogin, password: e.target.value })} />
            <button type="submit" className={`w-full text-white font-bold py-4 rounded-xl shadow-md ${activeTheme.btn}`}>Masuk Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen font-sans print:bg-white print:h-auto relative ${activeTheme.bgMain} transition-colors duration-500`}>
      
      {/* ===== POPUP ALERT & CONFIRM KEREN ===== */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden transition-opacity">
          <div className={`${activeTheme.bgCard} rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 transition-transform border ${activeTheme.borderCard}`}>
            <div className={`p-5 flex items-center gap-3 text-white ${modal.isDanger ? 'bg-rose-600' : activeTheme.bgSide}`}>
              <span className="text-2xl">{modal.isDanger ? '⚠️' : '🔔'}</span>
              <h3 className="font-bold text-lg">{modal.title}</h3>
            </div>
            <div className="p-6">
              <p className={`${activeTheme.textMain} mb-5 leading-relaxed font-medium`}>{modal.message}</p>
              
              {modal.type === 'prompt' && (
                <input type="text" placeholder={modal.placeholder} value={modalInput} onChange={(e) => setModalInput(e.target.value)} className={`w-full p-4 border-2 rounded-xl focus:outline-none text-center font-bold tracking-widest uppercase transition-colors ${activeTheme.bgMain} ${activeTheme.textMain} ${modalInput === modal.expectedText ? 'border-emerald-500 text-emerald-600' : `${activeTheme.borderCard} ${activeTheme.ring}`}`} autoFocus />
              )}
            </div>
            <div className={`p-4 border-t flex justify-end gap-3 ${activeTheme.bgMain} ${activeTheme.borderCard}`}>
              <button onClick={closeModal} className={`px-5 py-2.5 font-bold rounded-xl transition ${activeTheme.textMuted} hover:${activeTheme.bgCard}`}>Batal</button>
              <button onClick={() => { if (modal.type === 'prompt' && modalInput !== modal.expectedText) { showNotif('❌ Kata sandi tidak cocok! Proses dibatalkan.'); return; } modal.onConfirm(); closeModal(); }} className={`px-5 py-2.5 font-bold text-white rounded-xl transition shadow-md ${modal.isDanger ? 'bg-rose-600 hover:bg-rose-700' : activeTheme.btn}`}>
                {modal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL BUKU PANDUAN MANUAL ===== */}
      {showManual && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden">
          <div className={`${activeTheme.bgCard} rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col transform transition-all border ${activeTheme.borderCard}`}>
            <div className={`p-6 flex justify-between items-center text-white rounded-t-2xl ${activeTheme.bgSide}`}>
              <h3 className="text-xl font-bold">📖 Panduan Penggunaan SiDanus</h3>
              <button onClick={() => setShowManual(false)} className="text-white hover:text-rose-300 font-bold text-2xl leading-none">&times;</button>
            </div>
            <div className={`p-6 overflow-y-auto flex-1 space-y-6 ${activeTheme.textMain}`}>
              <section>
                <h4 className={`font-bold text-lg border-b pb-2 mb-2 ${activeTheme.borderCard}`}>1. Sistem Transparansi (Auto-Sync)</h4>
                <p className={`text-sm ${activeTheme.textMuted}`}>SiDanus didesain agar saling terhubung. Jika kamu menginput <strong>Paid Promote</strong> baru atau mengubah status <strong>Proposal</strong> menjadi "Dicairkan", maka uang pemasukan akan <strong>Otomatis Tercatat</strong> di halaman Transparansi. Kamu tidak perlu mengetik manual 2 kali!</p>
              </section>
              <section>
                <h4 className={`font-bold text-lg border-b pb-2 mb-2 ${activeTheme.borderCard}`}>2. Mengedit Data & Uang</h4>
                <p className={`text-sm ${activeTheme.textMuted}`}>Jika kamu mengedit harga Paid Promote atau mengedit pencairan Proposal, tenang saja, sistem juga akan secara cerdas <strong>Memperbarui Saldo di Transparansi</strong> secara otomatis mengikuti data yang baru.</p>
              </section>
              <section>
                <h4 className={`font-bold text-lg border-b pb-2 mb-2 ${activeTheme.borderCard}`}>3. Menu Pengaturan Master Data</h4>
                <p className={`text-sm ${activeTheme.textMuted}`}>Sebelum memakai menu utama, disarankan untuk masuk ke <strong>Pengaturan</strong> terlebih dahulu. Daftarkan nama anak-anak divisi Danus ke form <em>Penanggung Jawab (PJ)</em>, tetapkan <em>Target Pendapatan</em>, dan buat <em>Kategori Pengeluaran/Pemasukan</em>.</p>
              </section>
              <section className="bg-rose-50/10 border border-rose-500/30 p-5 rounded-xl">
                <h4 className="font-extrabold text-lg text-rose-500 mb-2 flex items-center gap-2">⚠️ Cara Cuci Gudang / Reset Database</h4>
                <p className={`text-sm mb-3 ${activeTheme.textMuted}`}>Jika masa <i>testing</i> aplikasi sudah selesai dan kamu ingin menghapus semua kuitansi agar nomor ID (TRX, PROP, PP) bersih kembali ke 001 untuk digunakan pada hari-H INFEST, cukup masuk ke menu <b>Pengaturan</b>, lalu cari tombol merah <b>"Hapus Semua Data (RESET 001)"</b> di bagian paling bawah. Masukkan kata sandi rahasia "RESET", dan SiDanus akan bersih seperti baru lahir!</p>
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
        <header className={`${activeTheme.bgCard} shadow-sm h-20 flex items-center px-8 sticky top-0 z-10 print:hidden justify-between border-b ${activeTheme.borderCard} transition-colors duration-500`}>
          <h2 className={`text-xl font-bold uppercase ${activeTheme.textMain}`}>{activeMenu}</h2>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowManual(true)} className={`bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors h-10 w-10 rounded-full font-extrabold text-xl flex items-center justify-center shadow-sm`} title="Panduan Penggunaan">?</button>
            <div className={`font-bold uppercase border-l-2 pl-4 ${activeTheme.textMuted} ${activeTheme.borderCard}`}>Divisi Danus INFEST</div>
          </div>
        </header>

        <div className="p-8 print:p-0">
          {notifTable && (
            <div className={`mb-6 p-4 font-bold rounded-xl shadow-sm print:hidden border transition-all ${notifTable.includes('❌') ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'}`}>
              {notifTable}
            </div>
          )}

          {/* === DASHBOARD === */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6 print:hidden">
              <div className={`bg-gradient-to-r text-white p-6 rounded-2xl shadow-md flex justify-between items-center ${activeTheme.grad} transition-colors duration-500`}><div><h3 className="text-sm font-medium mb-1">Waktu Saat Ini</h3><p className="text-xl font-bold">{waktuLive.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', })}</p></div><div className="text-3xl font-mono font-bold bg-black/20 px-6 py-3 rounded-xl shadow-inner tracking-widest">{waktuLive.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', })} WIB</div></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`${activeTheme.bgCard} p-6 rounded-2xl shadow-sm border-l-4 border-blue-500 ${activeTheme.borderCard}`}><p className={`text-sm font-semibold mb-1 ${activeTheme.textMuted}`}>Total Saldo Danus</p><h3 className={`text-3xl font-bold ${activeTheme.textMain}`}>{formatRupiah(stats?.saldo_saat_ini || 0)}</h3></div>
                <div className={`${activeTheme.bgCard} p-6 rounded-2xl shadow-sm border-l-4 border-emerald-500 ${activeTheme.borderCard}`}><p className={`text-sm font-semibold mb-1 ${activeTheme.textMuted}`}>Pemasukan (+)</p><h3 className="text-2xl font-bold text-emerald-500">+{formatRupiah(stats?.total_kredit || 0)}</h3></div>
                <div className={`${activeTheme.bgCard} p-6 rounded-2xl shadow-sm border-l-4 border-rose-500 ${activeTheme.borderCard}`}><p className={`text-sm font-semibold mb-1 ${activeTheme.textMuted}`}>Pengeluaran (-)</p><h3 className="text-2xl font-bold text-rose-500">-{formatRupiah(stats?.total_debit || 0)}</h3></div>
              </div>

              {/* ===== TARGET PENDAPATAN ===== */}
              <div className={`${activeTheme.bgCard} p-6 rounded-2xl shadow-sm border ${activeTheme.borderCard} transition-colors`}>
                <h4 className={`font-bold ${activeTheme.textMain} mb-3 flex items-center gap-2`}>🎯 Target Pendapatan: <span className="text-emerald-500">{formatRupiah(targetPendapatan)}</span></h4>
                <div className={`w-full rounded-full h-5 mb-2 overflow-hidden ${activeTheme.bgMain}`}>
                  <div className={`${warnaTarget.split(' ')[0]} h-5 rounded-full transition-all duration-1000 flex items-center justify-end px-2 text-xs font-bold text-white shadow-inner`} style={{ width: `${bulatTarget}%`, minWidth: bulatTarget > 5 ? '2rem' : '0' }}>
                    {bulatTarget > 5 && `${bulatTarget}%`}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className={`text-sm font-bold ${activeTheme.textMuted}`}>{formatRupiah(stats?.total_kredit || 0)} Terkumpul</span>
                  <span className={`text-sm font-bold ${warnaTarget.split(' ')[1]}`}>{teksTarget}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className={`${activeTheme.bgCard} p-6 rounded-2xl shadow-sm h-96 border ${activeTheme.borderCard} flex flex-col`}><h4 className={`font-bold mb-4 ${activeTheme.textMain}`}>Grafik Arus Kas</h4><ResponsiveContainer width="100%" height="100%"><BarChart data={dataBar} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} /><XAxis dataKey="name" stroke={themeKey==='dark'?'#9ca3af':'#4b5563'} /><YAxis stroke={themeKey==='dark'?'#9ca3af':'#4b5563'} tickFormatter={(value) => `Rp${value / 1000}k`} /><RechartsTooltip formatter={(value) => formatRupiah(value)} contentStyle={{backgroundColor: themeKey==='dark'?'#1f2937':'#fff', border: 'none', borderRadius: '8px'}} /><Legend /><Bar dataKey="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} /><Bar dataKey="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
                <div className={`${activeTheme.bgCard} p-6 rounded-2xl shadow-sm h-96 border ${activeTheme.borderCard} flex flex-col`}><h4 className={`font-bold mb-4 ${activeTheme.textMain}`}>Persentase Pengeluaran per Kategori</h4>{dataPie.length === 0 ? (<div className={`flex-1 flex items-center justify-center font-medium ${activeTheme.textMuted}`}>Belum ada data pengeluaran</div>) : (<ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={dataPie} cx="50%" cy="50%" labelLine={false} label={renderCustomizedLabel} outerRadius={120} fill="#8884d8" dataKey="value" stroke="none">
                        {dataPie.map((entry, index) => (<Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => formatRupiah(value)} contentStyle={{backgroundColor: themeKey==='dark'?'#1f2937':'#fff', border: 'none', borderRadius: '8px'}} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>)}</div>
              </div>

              {/* ===== INDIKATOR DATABASE STORAGE ===== */}
              <div className={`${activeTheme.bgCard} p-5 rounded-2xl shadow-sm border ${activeTheme.borderCard} flex items-center gap-6 transition-colors`}>
                <div className={`p-4 rounded-xl ${activeTheme.bgMain} ${activeTheme.textMain} text-2xl`}>☁️</div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <h4 className={`font-bold text-sm ${activeTheme.textMain}`}>Penggunaan Kapasitas Database (Supabase Cloud)</h4>
                    <span className={`text-xs font-bold ${activeTheme.textMuted}`}>{mbUsed} MB / {mbLimit} MB ({persentaseDb.toFixed(4)}%)</span>
                  </div>
                  <div className={`w-full rounded-full h-2 overflow-hidden ${activeTheme.bgMain}`}>
                    <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.max(persentaseDb, 1)}%` }}></div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* === TRANSPARANSI === */}
          {activeMenu === 'transparansi' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:block print:w-full">
              <div className="lg:col-span-1 print:hidden">
                <FormTransaksi theme={activeTheme} editData={editTxData} onCancelEdit={() => setEditTxData(null)} onSuccess={(aksi) => { showNotif(`✅ Transaksi manual berhasil ${aksi}!`); setEditTxData(null); loadData(); }} picList={safePicList} kategoriList={safeKategoriList} />
              </div>
              <div className={`lg:col-span-2 ${activeTheme.bgCard} rounded-2xl shadow-sm overflow-hidden border ${activeTheme.borderCard} flex flex-col print:shadow-none print:border-0 print:m-0 print:p-0 print:block transition-colors`}>
                <div className={`px-6 py-4 border-b ${activeTheme.bgMain} flex justify-between items-center print:hidden ${activeTheme.borderCard}`}><h4 className={`font-bold ${activeTheme.textMain}`}>Riwayat Transaksi Utama</h4><div className="flex gap-2"><button onClick={exportPDF} className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold py-2 px-4 rounded-lg shadow-sm">Ekspor PDF</button><button onClick={exportExcel} className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 px-4 rounded-lg shadow-sm">Ekspor Excel</button></div></div>
                <div className="hidden print:block text-center pt-4 pb-6 w-full"><h2 className="text-2xl font-extrabold text-gray-900 uppercase tracking-widest">Laporan Transparansi Dana</h2><h3 className="text-lg font-bold text-gray-700 uppercase">Divisi Danus - INFEST 2026</h3><p className="text-sm text-gray-500 mt-1">Dicetak pada: {formatTanggalDB(new Date().toISOString())}</p><div className="border-b-4 border-gray-900 w-full mt-4 mb-1"></div><div className="border-b-2 border-gray-900 w-full mb-6"></div></div>
                <div className="flex-1 p-4 print:p-0 overflow-x-auto print:overflow-visible">
                  <table className={`w-full text-sm text-left print:border-collapse print:w-full print:border print:border-gray-800 ${activeTheme.textMain}`}>
                    <thead className={`text-xs uppercase print:bg-gray-200 ${activeTheme.bgTable} ${activeTheme.textMuted}`}>
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
                      {safeTransaksi.length === 0 ? ( <tr><td colSpan="8" className={`text-center py-8 print:border print:border-gray-800 ${activeTheme.textMuted}`}>Belum ada transaksi</td></tr> ) : (
                        safeTransaksi.map((tx) => (
                          <tr key={tx?.id || Math.random()} className={`border-b print:border-b print:border-gray-800 hover:${activeTheme.bgMain} ${activeTheme.borderCard}`}>
                            <td className={`px-4 py-3 font-mono font-bold print:border print:border-gray-800 ${activeTheme.textMuted}`}>TRX-{tx?.id?.toString().padStart(4, '0') || '0000'}</td>
                            <td className="px-4 py-3 whitespace-nowrap print:border print:border-gray-800">{formatTanggalDB(tx?.tanggal)}</td>
                            <td className={`px-4 py-3 font-bold print:border print:border-gray-800 ${tx?.tipe === 'KREDIT' ? 'text-emerald-500 print:text-gray-900' : 'text-rose-500 print:text-gray-900'}`}>{tx?.tipe === 'KREDIT' ? 'Pemasukan' : 'Pengeluaran'}</td>
                            <td className="px-4 py-3 font-medium print:border print:border-gray-800">{tx?.keterangan || '-'}</td>
                            <td className="px-4 py-3 font-bold print:border print:border-gray-800">{getKategoriOtomatis(tx)}</td>
                            <td className="px-4 py-3 print:border print:border-gray-800">{tx?.pj?.nama || '-'}</td>
                            <td className={`px-4 py-3 font-bold whitespace-nowrap text-right print:border print:border-gray-800 ${tx?.tipe === 'KREDIT' ? 'text-emerald-500 print:text-gray-900' : 'text-rose-500 print:text-gray-900'}`}>{tx?.tipe === 'KREDIT' ? '+' : '-'}{formatRupiah(tx?.nominal || 0)}</td>
                            <td className="px-4 py-3 text-center print:hidden whitespace-nowrap"><button onClick={() => setEditTxData(tx)} className="text-blue-500 hover:text-blue-400 font-bold mx-2">Edit</button><button onClick={() => handleHapusTx(tx.id)} className="text-rose-500 hover:text-rose-400 font-bold mx-2">Hapus</button></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="hidden print:table-footer-group font-bold text-gray-900 bg-gray-100">
                      <tr><td colSpan="6" className="px-4 py-3 text-right print:border print:border-gray-800">TOTAL PEMASUKAN</td><td className="px-4 py-3 text-right print:border print:border-gray-800">{formatRupiah(stats?.total_kredit || 0)}</td></tr>
                      <tr><td colSpan="6" className="px-4 py-3 text-right print:border print:border-gray-800">TOTAL PENGELUARAN</td><td className="px-4 py-3 text-right print:border print:border-gray-800">{formatRupiah(stats?.total_debit || 0)}</td></tr>
                      <tr><td colSpan="6" className="px-4 py-3 text-right print:border print:border-gray-800 uppercase">Saldo Akhir</td><td className="px-4 py-3 text-right print:border print:border-gray-800 text-lg">{formatRupiah(stats?.saldo_saat_ini || 0)}</td></tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* === PAID PROMOTE === */}
          {activeMenu === 'paid promote' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`lg:col-span-1 ${activeTheme.bgCard} p-6 rounded-2xl shadow-sm h-fit border ${activeTheme.borderCard} transition-colors`}>
                <h3 className={`text-lg font-bold mb-4 ${activeTheme.textMain}`}>{editPpData ? 'Edit Paid Promote' : 'Input Paid Promote'}</h3>
                <form onSubmit={submitPp} className="space-y-4">
                  <div><label className={`text-sm font-medium mb-1 block ${activeTheme.textMain}`}>Nama Pemesan</label><input type="text" value={formPp.nama_pemesan} onChange={(e) => setFormPp({ ...formPp, nama_pemesan: e.target.value })} required className={`w-full p-2 border rounded-lg ${activeTheme.ring} ${activeTheme.bgMain} ${activeTheme.textMain} ${activeTheme.borderCard}`} /></div>
                  <div className="flex gap-2">
                    <div className="flex-1"><label className={`text-sm font-medium mb-1 block ${activeTheme.textMain}`}>Mulai</label><input type="date" value={formPp.tanggal_mulai} onChange={(e) => setFormPp({ ...formPp, tanggal_mulai: e.target.value })} required className={`w-full p-2 border rounded-lg ${activeTheme.ring} ${activeTheme.bgMain} ${activeTheme.textMain} ${activeTheme.borderCard}`} /></div>
                    <div className="flex-1"><label className={`text-sm font-medium mb-1 block ${activeTheme.textMain}`}>Selesai</label><input type="date" value={formPp.tanggal_selesai} onChange={(e) => setFormPp({ ...formPp, tanggal_selesai: e.target.value })} required className={`w-full p-2 border rounded-lg ${activeTheme.ring} ${activeTheme.bgMain} ${activeTheme.textMain} ${activeTheme.borderCard}`} /></div>
                  </div>
                  <div className={`text-sm font-bold text-right ${activeTheme.textMuted}`}>Durasi: {hitungDurasiHari(formPp.tanggal_mulai, formPp.tanggal_selesai)} Hari</div>
                  <div><label className={`text-sm font-medium mb-1 block ${activeTheme.textMain}`}>Harga (Rp)</label><input type="number" value={formPp.harga} onChange={(e) => setFormPp({ ...formPp, harga: e.target.value })} required className={`w-full p-2 border rounded-lg ${activeTheme.ring} ${activeTheme.bgMain} ${activeTheme.textMain} ${activeTheme.borderCard}`} /></div>
                  <div className="flex gap-2">
                    <button type="submit" className={`flex-1 text-white font-bold py-3 rounded-lg shadow-sm ${ editPpData ? 'bg-orange-500 hover:bg-orange-600' : activeTheme.btn }`}>{editPpData ? 'Update PP' : 'Simpan PP'}</button>
                    {editPpData && (<button type="button" onClick={() => { setEditPpData(null); setFormPp({ nama_pemesan: '', tanggal_mulai: '', tanggal_selesai: '', harga: '' }); }} className={`font-bold py-3 px-4 rounded-lg ${activeTheme.bgMain} ${activeTheme.textMain} border ${activeTheme.borderCard}`}>Batal</button>)}
                  </div>
                </form>
              </div>

              <div className={`lg:col-span-2 ${activeTheme.bgCard} rounded-2xl shadow-sm overflow-hidden flex flex-col border ${activeTheme.borderCard} transition-colors`}>
                <div className={`px-6 py-4 border-b ${activeTheme.bgMain} ${activeTheme.borderCard}`}><h4 className={`font-bold ${activeTheme.textMain}`}>Riwayat Paid Promote</h4></div>
                <div className="flex-1 p-4 overflow-x-auto">
                  <table className={`w-full text-sm text-left ${activeTheme.textMain}`}>
                    <thead className={`text-xs uppercase ${activeTheme.bgTable} ${activeTheme.textMuted}`}><tr><th className="p-3">ID</th><th className="p-3">Pemesan</th><th className="p-3">Durasi</th><th className="p-3">Harga</th><th className="p-3">Status</th><th className="p-3 text-center">Aksi</th></tr></thead>
                    <tbody>
                      {safePaidPromotes.length === 0 ? ( <tr><td colSpan="6" className={`text-center py-8 ${activeTheme.textMuted}`}>Belum ada PP</td></tr> ) : (
                        safePaidPromotes.map((pp) => {
                          const startStr = pp?.tanggal_mulai || '';
                          const endStr = pp?.tanggal_selesai || '';
                          const isExpired = new Date() > new Date(endStr);
                          const statusVisual = pp?.status === 'Dibatalkan' ? 'bg-rose-500/20 text-rose-500' : isExpired ? 'bg-blue-500/20 text-blue-500' : 'bg-emerald-500/20 text-emerald-500';
                          const statusText = pp?.status === 'Dibatalkan' ? 'Dibatalkan' : isExpired ? 'Selesai' : 'Aktif';
                          return (
                            <tr key={pp?.id || Math.random()} className={`border-b hover:${activeTheme.bgMain} ${activeTheme.borderCard}`}>
                              <td className={`p-3 font-mono font-bold ${activeTheme.textMuted}`}>PP-{(pp?.id || 0).toString().padStart(3, '0')}</td><td className="p-3 font-bold">{pp?.nama_pemesan || '-'}</td><td className="p-3">{hitungDurasiHari(startStr, endStr)} Hari</td><td className="p-3 font-bold text-emerald-500">{formatRupiah(pp?.harga || 0)}</td><td className="p-3"><span className={`px-2 py-1 rounded-md text-xs font-bold ${statusVisual}`}>{statusText}</span></td>
                              <td className="p-3 text-center whitespace-nowrap">
                                {pp?.status !== 'Dibatalkan' && (<button onClick={() => batalPp(pp.id)} className="text-blue-500 hover:text-blue-400 font-bold text-xs hover:underline mx-1">Batalkan</button>)}
                                <button onClick={() => triggerEditPp(pp)} className="text-orange-500 hover:text-orange-400 text-xs font-bold hover:underline mx-1">Edit</button>
                                <button onClick={() => hapusPp(pp.id)} className="text-rose-500 hover:text-rose-400 text-xs font-bold hover:underline mx-1">Hapus</button>
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
              <div className={`lg:col-span-1 ${activeTheme.bgCard} p-6 rounded-2xl shadow-sm h-fit border ${activeTheme.borderCard} transition-colors`}>
                <h3 className={`text-lg font-bold mb-4 ${activeTheme.textMain}`}>{editPropData ? 'Edit Data Proposal' : 'Input Proposal'}</h3>
                <form onSubmit={submitProp} className="space-y-4">
                  <div><label className={`text-sm font-medium mb-1 block ${activeTheme.textMain}`}>PJ Pengantar (Manual)</label><input type="text" value={formProp.pj_pengantar} onChange={(e) => setFormProp({ ...formProp, pj_pengantar: e.target.value })} required className={`w-full p-2 border rounded-lg ${activeTheme.ring} ${activeTheme.bgMain} ${activeTheme.textMain} ${activeTheme.borderCard}`} /></div>
                  <div><label className={`text-sm font-medium mb-1 block ${activeTheme.textMain}`}>Instansi Tujuan</label><input type="text" value={formProp.instansi} onChange={(e) => setFormProp({ ...formProp, instansi: e.target.value })} required className={`w-full p-2 border rounded-lg ${activeTheme.ring} ${activeTheme.bgMain} ${activeTheme.textMain} ${activeTheme.borderCard}`} /></div>
                  <div className="flex gap-2">
                    <button type="submit" className={`flex-1 text-white font-bold py-3 rounded-lg shadow-sm ${ editPropData ? 'bg-orange-500 hover:bg-orange-600' : activeTheme.btn }`}>{editPropData ? 'Update Proposal' : 'Simpan Proposal'}</button>
                    {editPropData && (<button type="button" onClick={() => { setEditPropData(null); setFormProp({ pj_pengantar: '', instansi: '', status: 'Menunggu' }); }} className={`font-bold py-3 px-4 rounded-lg ${activeTheme.bgMain} ${activeTheme.textMain} border ${activeTheme.borderCard}`}>Batal</button>)}
                  </div>
                </form>
              </div>

              <div className={`lg:col-span-2 ${activeTheme.bgCard} rounded-2xl shadow-sm flex flex-col border ${activeTheme.borderCard} overflow-hidden transition-colors`}>
                <div className={`px-6 py-4 border-b ${activeTheme.bgMain} ${activeTheme.borderCard}`}><h4 className={`font-bold ${activeTheme.textMain}`}>Riwayat Proposal</h4></div>
                <div className="flex-1 p-4 overflow-x-auto">
                  <table className={`w-full text-sm text-left ${activeTheme.textMain}`}>
                    <thead className={`text-xs uppercase ${activeTheme.bgTable} ${activeTheme.textMuted}`}><tr><th className="p-3">ID</th><th className="p-3">PJ Pengantar</th><th className="p-3">Instansi</th><th className="p-3">Status</th><th className="p-3">Cair</th><th className="p-3 text-center">Aksi</th></tr></thead>
                    <tbody>
                      {safeProposals.length === 0 ? ( <tr><td colSpan="6" className={`text-center py-8 ${activeTheme.textMuted}`}>Belum ada proposal</td></tr> ) : (
                        safeProposals.map((pr) => (
                          <tr key={pr?.id || Math.random()} className={`border-b hover:${activeTheme.bgMain} ${activeTheme.borderCard}`}>
                            <td className={`p-3 font-mono font-bold ${activeTheme.textMuted}`}>PROP-{(pr?.id || 0).toString().padStart(3, '0')}</td><td className="p-3">{pr?.pj_pengantar || '-'}</td><td className="p-3 font-bold">{pr?.instansi || '-'}</td>
                            <td className="p-3">
                              {editPropId === pr?.id ? (
                                <select value={pr?.status || 'Menunggu'} onChange={(e) => { if (e.target.value !== 'Dicairkan') updateStatusProp(pr.id, e.target.value, null); else setEditPropId(pr.id); }} className={`p-2 border rounded-md text-xs font-bold shadow-sm ${activeTheme.bgMain} ${activeTheme.textMain} ${activeTheme.borderCard}`}>
                                  <option value="Menunggu">Menunggu</option><option value="Diterima">Diterima</option><option value="Ditolak">Ditolak</option><option value="Dicairkan">Dicairkan</option>
                                </select>
                              ) : ( <span className={`px-2 py-1 rounded-md text-xs font-bold ${ pr?.status === 'Dicairkan' ? 'bg-emerald-500/20 text-emerald-500' : pr?.status === 'Ditolak' ? 'bg-rose-500/20 text-rose-500' : 'bg-orange-500/20 text-orange-500' }`}>{pr?.status || '-'}</span> )}
                            </td>
                            <td className="p-3">
                              {editPropId === pr?.id ? (
                                <div className="flex gap-2 items-center"><input type="number" placeholder="Nominal Rp" value={editPropNominal} onChange={(e) => setEditPropNominal(e.target.value)} className={`w-24 p-1 text-xs border rounded-md ${activeTheme.bgMain} ${activeTheme.textMain} ${activeTheme.borderCard}`} /><button onClick={() => updateStatusProp(pr.id, 'Dicairkan', editPropNominal)} className="bg-emerald-600 text-white px-3 py-1 text-xs rounded-md font-bold shadow-sm">OK</button></div>
                              ) : ( <span className="font-bold text-emerald-500">{pr?.nominal_cair ? formatRupiah(pr.nominal_cair) : '-'}</span> )}
                            </td>
                            <td className="p-3 text-center whitespace-nowrap">
                              {editPropId === pr?.id ? ( <button onClick={() => { setEditPropId(null); setEditPropNominal(''); }} className={`text-xs font-bold hover:underline mx-1 ${activeTheme.textMuted}`}>Batal</button> ) : ( pr?.status !== 'Dicairkan' && ( <button onClick={() => setEditPropId(pr.id)} className="text-blue-500 hover:text-blue-400 text-xs font-bold hover:underline mx-1">Status</button> ) )}
                              <button onClick={() => triggerEditProp(pr)} className="text-orange-500 hover:text-orange-400 text-xs font-bold hover:underline mx-1">Edit</button><button onClick={() => hapusProp(pr.id)} className="text-rose-500 hover:text-rose-400 text-xs font-bold hover:underline mx-1">Hapus</button>
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
                <div className={`${activeTheme.bgCard} p-6 rounded-2xl shadow-sm border ${activeTheme.borderCard} transition-colors`}><h3 className={`text-lg font-bold mb-4 ${activeTheme.textMain}`}>Personalisasi Tema Aplikasi</h3><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{Object.keys(THEMES).map((key) => (<button key={key} onClick={() => { setThemeKey(key); localStorage.setItem('sidanus_theme', key); }} className={`py-3 px-4 rounded-xl font-bold text-white transition shadow-sm ${THEMES[key].btn} ${themeKey === key ? 'ring-4 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900' : ''}`}>{THEMES[key].name}</button>))}</div></div>
                
                {/* SETTING TARGET PENDAPATAN */}
                <div className={`${activeTheme.bgCard} p-6 rounded-2xl shadow-sm border ${activeTheme.borderCard} transition-colors`}>
                  <h3 className={`text-lg font-bold mb-2 ${activeTheme.textMain}`}>Target Pendapatan Danus</h3>
                  <p className={`text-sm mb-4 ${activeTheme.textMuted}`}>Atur gol pendapatan yang ingin dicapai agar progres indikator di Dashboard akurat.</p>
                  <form onSubmit={handleUpdateTarget} className="flex gap-4">
                    <input type="number" value={inputTarget} onChange={(e) => setInputTarget(parseInt(e.target.value) || 0)} required className={`flex-1 border rounded-lg p-3 ${activeTheme.ring} ${activeTheme.bgMain} ${activeTheme.textMain} ${activeTheme.borderCard}`} />
                    <button type="submit" className={`text-white font-bold py-3 px-6 rounded-lg shadow-sm ${activeTheme.btn}`}>Simpan Target</button>
                  </form>
                </div>

                <div className={`${activeTheme.bgCard} p-6 rounded-2xl shadow-sm border ${activeTheme.borderCard} transition-colors`}><h3 className={`text-lg font-bold mb-2 ${activeTheme.textMain}`}>Kredensial Login</h3><p className={`text-sm mb-4 ${activeTheme.textMuted}`}>Ubah username dan password untuk mengakses SiDanus.</p>{notifCreds && ( <div className="mb-4 p-3 bg-emerald-500/20 text-emerald-500 rounded-lg text-sm font-bold border border-emerald-500/30">{notifCreds}</div> )}<form onSubmit={handleUpdateCreds} className="space-y-4"><div><label className={`block text-sm font-medium mb-1 ${activeTheme.textMain}`}>Username Baru</label><input type="text" value={inputGantiCreds.username} onChange={(e) => setInputGantiCreds({ ...inputGantiCreds, username: e.target.value })} required className={`w-full border rounded-lg p-3 ${activeTheme.ring} ${activeTheme.bgMain} ${activeTheme.textMain} ${activeTheme.borderCard}`} /></div><div><label className={`block text-sm font-medium mb-1 ${activeTheme.textMain}`}>Password Baru</label><input type="password" value={inputGantiCreds.password} onChange={(e) => setInputGantiCreds({ ...inputGantiCreds, password: e.target.value })} required className={`w-full border rounded-lg p-3 ${activeTheme.ring} ${activeTheme.bgMain} ${activeTheme.textMain} ${activeTheme.borderCard}`} /></div><button type="submit" className={`w-full text-white font-bold py-3 rounded-lg shadow-sm ${activeTheme.btn}`}>Simpan Kredensial</button></form></div>
              </div>

              <div className="space-y-6">
                {/* MANAJEMEN PJ */}
                <div className={`${activeTheme.bgCard} p-6 rounded-2xl shadow-sm border ${activeTheme.borderCard} h-fit transition-colors`}>
                  <h3 className={`text-lg font-bold mb-2 ${activeTheme.textMain}`}>Manajemen Penanggung Jawab (PJ)</h3>
                  <p className={`text-sm mb-4 ${activeTheme.textMuted}`}>Tambahkan atau hapus nama PJ.</p>
                  {notifPj && ( <div className="mb-4 p-3 bg-blue-500/20 text-blue-500 rounded-lg text-sm font-bold border border-blue-500/30">{notifPj}</div> )}
                  <form onSubmit={handleTambahPj} className="flex gap-4 mb-6">
                    <input type="text" value={namaPjBaru} onChange={(e) => setNamaPjBaru(e.target.value)} placeholder="Nama PJ (cth: Dika)" required className={`flex-1 border rounded-lg p-3 ${activeTheme.ring} ${activeTheme.bgMain} ${activeTheme.textMain} ${activeTheme.borderCard}`} />
                    <button type="submit" className={`text-white font-bold py-3 px-6 rounded-lg shadow-sm ${activeTheme.btn}`}>Tambah</button>
                  </form>
                  <div className={`border-t pt-4 ${activeTheme.borderCard}`}>
                    <h4 className={`text-sm font-bold mb-3 ${activeTheme.textMuted}`}>Daftar PJ Aktif:</h4>
                    <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {safePicList.map((pj) => (
                        <li key={pj?.id || Math.random()} className={`flex justify-between items-center p-3 rounded-lg border ${activeTheme.bgMain} ${activeTheme.borderCard}`}><span className={`font-medium ${activeTheme.textMain}`}>{pj?.nama || '-'}</span><button onClick={() => handleHapusPj(pj.id, pj.nama)} className="text-rose-500 hover:text-rose-400 text-sm font-bold px-3 py-1 rounded-md transition">Hapus</button></li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* MANAJEMEN KATEGORI */}
                <div className={`${activeTheme.bgCard} p-6 rounded-2xl shadow-sm border ${activeTheme.borderCard} h-fit transition-colors`}>
                  <h3 className={`text-lg font-bold mb-2 ${activeTheme.textMain}`}>Manajemen Kategori Transaksi</h3>
                  <p className={`text-sm mb-4 ${activeTheme.textMuted}`}>Atur dropdown kategori form transaksi utama.</p>
                  {notifKategori && ( <div className="mb-4 p-3 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-bold border border-purple-500/30">{notifKategori}</div> )}
                  <form onSubmit={handleTambahKategori} className="flex gap-4 mb-6">
                    <input type="text" value={namaKategoriBaru} onChange={(e) => setNamaKategoriBaru(e.target.value)} placeholder="Kategori (cth: Konsumsi)" required className={`flex-1 border rounded-lg p-3 ${activeTheme.ring} ${activeTheme.bgMain} ${activeTheme.textMain} ${activeTheme.borderCard}`} />
                    <button type="submit" className={`text-white font-bold py-3 px-6 rounded-lg shadow-sm ${activeTheme.btn}`}>Tambah</button>
                  </form>
                  <div className={`border-t pt-4 ${activeTheme.borderCard}`}>
                    <h4 className={`text-sm font-bold mb-3 ${activeTheme.textMuted}`}>Kategori Tersedia:</h4>
                    <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {safeKategoriList.map((kat) => (
                        <li key={kat?.id || Math.random()} className={`flex justify-between items-center p-3 rounded-lg border ${activeTheme.bgMain} ${activeTheme.borderCard}`}><span className={`font-medium ${activeTheme.textMain}`}>{kat?.nama || '-'}</span><button onClick={() => handleHapusKategori(kat.id, kat.nama)} className="text-rose-500 hover:text-rose-400 text-sm font-bold px-3 py-1 rounded-md transition">Hapus</button></li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* DANGER ZONE: FACTORY RESET */}
                <div className="bg-rose-500/10 p-6 rounded-2xl shadow-sm border-2 border-rose-500/30 h-fit mt-8">
                  <h3 className="text-xl font-extrabold text-rose-600 mb-2 flex items-center gap-2">⚠️ DANGER ZONE (Zona Berbahaya)</h3>
                  <p className={`text-sm mb-4 font-medium ${activeTheme.textMain}`}>Fitur ini digunakan untuk <strong className="bg-rose-500 text-white px-1 rounded">menghapus bersih</strong> seluruh data saat ini (Kuitansi, Proposal, Paid Promote, PJ, Kategori) untuk kembali ke titik awal (ID 001). Biasanya dipakai ketika aplikasi mau di-deploy resmi ke panitia.</p>
                  <button onClick={handleFactoryReset} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-xl text-lg shadow-md transition-all hover:scale-[1.02]">
                    HAPUS SEMUA DATA (RESET 001)
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