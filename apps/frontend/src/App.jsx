import { useState, useEffect } from 'react';
import FormTransaksi from './components/FormTransaksi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const THEMES = {
  emerald: { name: 'Hijau', bgSide: 'bg-emerald-800', border: 'border-emerald-700', btn: 'bg-emerald-600 hover:bg-emerald-700', textAccent: 'text-emerald-300', ring: 'focus:border-emerald-500 focus:ring-emerald-500', grad: 'from-emerald-800 to-emerald-600' },
  indigo: { name: 'Biru', bgSide: 'bg-indigo-800', border: 'border-indigo-700', btn: 'bg-indigo-600 hover:bg-indigo-700', textAccent: 'text-indigo-300', ring: 'focus:border-indigo-500 focus:ring-indigo-500', grad: 'from-indigo-800 to-indigo-600' },
  rose: { name: 'Merah', bgSide: 'bg-rose-800', border: 'border-rose-700', btn: 'bg-rose-600 hover:bg-rose-700', textAccent: 'text-rose-300', ring: 'focus:border-rose-500 focus:ring-rose-500', grad: 'from-rose-800 to-rose-600' },
};
const CHART_COLORS = ['#10b981', '#f43f5e', '#3b82f6', '#f59e0b', '#8b5cf6'];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [themeKey, setThemeKey] = useState(localStorage.getItem('sidanus_theme') || 'emerald');
  const activeTheme = THEMES[themeKey];

  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [stats, setStats] = useState({ total_kredit: 0, total_debit: 0, saldo_saat_ini: 0 });
  const [transaksi, setTransaksi] = useState([]);
  const [picList, setPicList] = useState([]); 
  const [paidPromotes, setPaidPromotes] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [waktuLive, setWaktuLive] = useState(new Date());
  
  // States untuk Form Baru
  const [formPp, setFormPp] = useState({ nama_pemesan: '', tanggal_mulai: '', tanggal_selesai: '', harga: '' });
  const [formProp, setFormProp] = useState({ pj_pengantar: '', instansi: '', status: 'Menunggu' });
  const [editPropId, setEditPropId] = useState(null);
  const [editPropNominal, setEditPropNominal] = useState('');

  const [notif, setNotif] = useState('');

  useEffect(() => {
    const interval = setInterval(() => setWaktuLive(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    fetch('http://localhost:3000/api/stats').then(r => r.json()).then(d => setStats(d));
    fetch('http://localhost:3000/api/transaksi').then(r => r.json()).then(d => setTransaksi(d));
    fetch('http://localhost:3000/api/pic').then(r => r.json()).then(d => setPicList(d));
    fetch('http://localhost:3000/api/paid-promote').then(r => r.json()).then(d => setPaidPromotes(d));
    fetch('http://localhost:3000/api/proposal').then(r => r.json()).then(d => setProposals(d));
  };
  useEffect(() => { if (isLoggedIn) loadData(); }, [isLoggedIn]);

  const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  const formatTanggalDB = (isoString) => isoString ? new Date(isoString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
  const showNotif = (msg) => { setNotif(msg); setTimeout(() => setNotif(''), 3000); };

  // === HANDLERS PAID PROMOTE ===
  const hitungDurasiHari = (start, end) => {
    if(!start || !end) return 0;
    const selisih = new Date(end) - new Date(start);
    return Math.max(0, Math.ceil(selisih / (1000 * 60 * 60 * 24)));
  };
  const submitPp = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:3000/api/paid-promote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formPp) });
    setFormPp({ nama_pemesan: '', tanggal_mulai: '', tanggal_selesai: '', harga: '' });
    showNotif('Paid Promote berhasil disimpan & Dana masuk ke Transparansi!'); loadData();
  };
  const batalPp = async (id) => {
    if(window.confirm('Batalkan PP ini? Saldo Transparansi akan ditarik kembali.')) {
      await fetch(`http://localhost:3000/api/paid-promote/${id}/batal`, { method: 'PUT' });
      showNotif('Paid Promote dibatalkan!'); loadData();
    }
  };

  // === HANDLERS PROPOSAL ===
  const submitProp = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:3000/api/proposal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formProp) });
    setFormProp({ pj_pengantar: '', instansi: '', status: 'Menunggu' });
    showNotif('Proposal berhasil ditambah!'); loadData();
  };
  const updateStatusProp = async (id, status, nominal) => {
    await fetch(`http://localhost:3000/api/proposal/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, nominal_cair: nominal }) });
    setEditPropId(null); setEditPropNominal('');
    showNotif(status === 'Dicairkan' ? 'Hore cair! Dana otomatis masuk Transparansi!' : 'Status Proposal diupdate!'); loadData();
  };

  if (!isLoggedIn) {
    return (
      <div className={`flex h-screen bg-gray-900 items-center justify-center`}><div className="bg-white p-10 rounded-3xl w-full max-w-md text-center"><h1 className="text-4xl font-bold mb-4">Si<span className="text-emerald-500">Danus</span></h1><button onClick={() => {setIsLoggedIn(true); localStorage.setItem('isLoggedIn', 'true')}} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold">Masuk Langsung</button></div></div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 print:bg-white print:h-auto">
      <aside className={`w-64 text-white flex flex-col shadow-xl z-10 print:hidden ${activeTheme.bgSide} transition-colors duration-500`}>
        <div className={`h-20 flex items-center justify-center border-b ${activeTheme.border}`}><h1 className="text-2xl font-bold tracking-wider">Si<span className={activeTheme.textAccent}>Danus</span></h1></div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {['dashboard', 'transparansi', 'paid promote', 'proposal', 'pengaturan'].map(menu => (
            <button key={menu} onClick={() => setActiveMenu(menu)} className={`w-full text-left px-4 py-3 rounded-lg font-semibold uppercase text-sm transition ${activeMenu === menu ? 'bg-white/20 shadow-sm' : 'hover:bg-white/10'}`}>{menu}</button>
          ))}
        </nav>
        <div className={`p-4 border-t ${activeTheme.border}`}><button onClick={() => { setIsLoggedIn(false); localStorage.removeItem('isLoggedIn'); }} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-lg">Logout</button></div>
      </aside>

      <main className="flex-1 overflow-y-auto print:overflow-visible print:w-full">
        <header className="bg-white shadow-sm h-20 flex items-center px-8 sticky top-0 z-10 print:hidden justify-between">
          <h2 className="text-xl font-bold text-gray-700 uppercase">{activeMenu}</h2>
          <div className="font-bold text-gray-500">Divisi Danus INFEST</div>
        </header>

        <div className="p-8 print:p-0">
          {notif && <div className="mb-4 p-4 bg-emerald-100 text-emerald-800 font-bold rounded-xl text-center shadow-sm print:hidden">{notif}</div>}

          {/* === DASHBOARD UTAMA === */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500"><p className="text-sm font-semibold mb-1">Total Saldo Danus</p><h3 className="text-3xl font-bold">{formatRupiah(stats.saldo_saat_ini)}</h3></div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-emerald-500"><p className="text-sm font-semibold mb-1">Pemasukan (+)</p><h3 className="text-2xl font-bold text-emerald-600">+{formatRupiah(stats.total_kredit)}</h3></div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-rose-500"><p className="text-sm font-semibold mb-1">Pengeluaran (-)</p><h3 className="text-2xl font-bold text-rose-600">-{formatRupiah(stats.total_debit)}</h3></div>
              </div>
            </div>
          )}

          {/* === TRANSPARANSI === */}
          {activeMenu === 'transparansi' && (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="hidden print:block text-center pt-4 pb-6 w-full"><h2 className="text-2xl font-extrabold uppercase">Laporan Transparansi Dana</h2><h3 className="text-lg font-bold uppercase">Danus - INFEST 2026</h3><p className="text-sm mt-1">Dicetak: {formatTanggalDB(new Date().toISOString())}</p></div>
              <table className="w-full text-sm text-left text-gray-600 print:border-collapse print:w-full print:border">
                <thead className="text-xs uppercase bg-gray-100"><tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Tanggal</th><th className="px-4 py-3">Keterangan</th><th className="px-4 py-3">Kategori</th><th className="px-4 py-3 text-right">Nominal</th></tr></thead>
                <tbody>
                  {transaksi.map((tx) => (
                    <tr key={tx.id} className="border-b"><td className="px-4 py-3 font-mono font-bold">TRX-{tx.id.toString().padStart(4, '0')}</td><td className="px-4 py-3">{formatTanggalDB(tx.tanggal)}</td><td className="px-4 py-3 font-medium">{tx.keterangan || '-'}</td><td className="px-4 py-3">{tx.kategori?.nama || 'Progja Auto'}</td><td className={`px-4 py-3 font-bold text-right ${tx.tipe === 'KREDIT' ? 'text-emerald-600' : 'text-rose-600'}`}>{tx.tipe === 'KREDIT' ? '+' : '-'}{formatRupiah(tx.nominal)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* === PAID PROMOTE === */}
          {activeMenu === 'paid promote' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm h-fit">
                   <h3 className="text-lg font-bold mb-4">Input Paid Promote</h3>
                   <form onSubmit={submitPp} className="space-y-4">
                      <div><label className="text-sm font-medium">Nama Pemesan</label><input type="text" value={formPp.nama_pemesan} onChange={e=>setFormPp({...formPp, nama_pemesan:e.target.value})} required className={`w-full p-2 border rounded-lg ${activeTheme.ring}`} /></div>
                      <div className="flex gap-2">
                        <div className="flex-1"><label className="text-sm font-medium">Mulai</label><input type="date" value={formPp.tanggal_mulai} onChange={e=>setFormPp({...formPp, tanggal_mulai:e.target.value})} required className="w-full p-2 border rounded-lg" /></div>
                        <div className="flex-1"><label className="text-sm font-medium">Selesai</label><input type="date" value={formPp.tanggal_selesai} onChange={e=>setFormPp({...formPp, tanggal_selesai:e.target.value})} required className="w-full p-2 border rounded-lg" /></div>
                      </div>
                      <div className="text-sm text-gray-500 font-bold text-right">Durasi: {hitungDurasiHari(formPp.tanggal_mulai, formPp.tanggal_selesai)} Hari</div>
                      <div><label className="text-sm font-medium">Harga (Rp)</label><input type="number" value={formPp.harga} onChange={e=>setFormPp({...formPp, harga:e.target.value})} required className={`w-full p-2 border rounded-lg ${activeTheme.ring}`} /></div>
                      <button type="submit" className={`w-full text-white font-bold py-3 rounded-lg ${activeTheme.btn}`}>Simpan PP</button>
                   </form>
                </div>
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden p-4">
                  <h4 className="font-bold mb-4">Riwayat Paid Promote</h4>
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100"><tr><th className="p-3">ID</th><th className="p-3">Pemesan</th><th className="p-3">Durasi</th><th className="p-3">Harga</th><th className="p-3">Status</th><th className="p-3 text-center">Aksi</th></tr></thead>
                    <tbody>
                      {paidPromotes.map(pp => {
                        const isExpired = new Date() > new Date(pp.tanggal_selesai);
                        const statusVisual = pp.status === 'Dibatalkan' ? 'bg-rose-100 text-rose-700' : (isExpired ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700');
                        const statusText = pp.status === 'Dibatalkan' ? 'Dibatalkan' : (isExpired ? 'Selesai' : 'Aktif');
                        return (
                          <tr key={pp.id} className="border-b"><td className="p-3 font-mono font-bold">PP-{pp.id.toString().padStart(3,'0')}</td><td className="p-3 font-bold">{pp.nama_pemesan}</td><td className="p-3">{hitungDurasiHari(pp.tanggal_mulai, pp.tanggal_selesai)} Hari</td><td className="p-3">{formatRupiah(pp.harga)}</td><td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${statusVisual}`}>{statusText}</span></td><td className="p-3 text-center">{pp.status !== 'Dibatalkan' && <button onClick={()=>batalPp(pp.id)} className="text-rose-500 font-bold text-xs hover:underline">Batalkan</button>}</td></tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
             </div>
          )}

          {/* === PROPOSAL === */}
          {activeMenu === 'proposal' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm h-fit">
                <h3 className="text-lg font-bold mb-4">Input Proposal</h3>
                <form onSubmit={submitProp} className="space-y-4">
                  <div><label className="text-sm font-medium">PJ Pengantar (Manual)</label><input type="text" value={formProp.pj_pengantar} onChange={e=>setFormProp({...formProp, pj_pengantar:e.target.value})} required className="w-full p-2 border rounded-lg" /></div>
                  <div><label className="text-sm font-medium">Instansi Tujuan</label><input type="text" value={formProp.instansi} onChange={e=>setFormProp({...formProp, instansi:e.target.value})} required className="w-full p-2 border rounded-lg" /></div>
                  <button type="submit" className={`w-full text-white font-bold py-3 rounded-lg ${activeTheme.btn}`}>Simpan Proposal</button>
                </form>
              </div>
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-4 overflow-auto">
                <h4 className="font-bold mb-4">Riwayat Proposal</h4>
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100"><tr><th className="p-3">ID</th><th className="p-3">PJ Pengantar</th><th className="p-3">Instansi</th><th className="p-3">Status</th><th className="p-3">Cair</th><th className="p-3">Aksi</th></tr></thead>
                    <tbody>
                      {proposals.map(pr => (
                        <tr key={pr.id} className="border-b">
                          <td className="p-3 font-mono font-bold">PROP-{pr.id.toString().padStart(3,'0')}</td><td className="p-3">{pr.pj_pengantar}</td><td className="p-3 font-bold">{pr.instansi}</td>
                          <td className="p-3">
                            {editPropId === pr.id ? (
                               <select value={pr.status} onChange={(e) => {
                                 if(e.target.value !== 'Dicairkan') updateStatusProp(pr.id, e.target.value, null);
                                 else setEditPropId(pr.id); // Triggers nominal input below
                               }} className="p-1 border rounded text-xs bg-gray-50">
                                 <option value="Menunggu">Menunggu</option><option value="Diterima">Diterima</option><option value="Ditolak">Ditolak</option><option value="Dicairkan">Dicairkan</option>
                               </select>
                            ) : ( <span className={`px-2 py-1 rounded text-xs font-bold ${pr.status==='Dicairkan'?'bg-emerald-100 text-emerald-700':pr.status==='Ditolak'?'bg-rose-100 text-rose-700':'bg-orange-100 text-orange-700'}`}>{pr.status}</span> )}
                          </td>
                          <td className="p-3">
                            {editPropId === pr.id ? (
                               <div className="flex gap-2"><input type="number" placeholder="Nominal Rp" value={editPropNominal} onChange={e=>setEditPropNominal(e.target.value)} className="w-24 p-1 text-xs border rounded" /><button onClick={()=>updateStatusProp(pr.id, 'Dicairkan', editPropNominal)} className="bg-emerald-500 text-white px-2 py-1 text-xs rounded font-bold">OK</button></div>
                            ) : ( <span className="font-bold text-emerald-600">{pr.nominal_cair ? formatRupiah(pr.nominal_cair) : '-'}</span> )}
                          </td>
                          <td className="p-3">{editPropId !== pr.id && pr.status !== 'Dicairkan' && <button onClick={()=>setEditPropId(pr.id)} className="text-blue-500 text-xs font-bold hover:underline">Edit Status</button>}</td>
                        </tr>
                      ))}
                    </tbody>
                </table>
              </div>
            </div>
          )}

          {/* === PENGATURAN === */}
          {activeMenu === 'pengaturan' && (
             <div className="bg-white p-6 rounded-2xl max-w-sm"><h3 className="font-bold mb-4">Ganti Tema</h3><div className="flex flex-col gap-2">{Object.keys(THEMES).map(k => (<button key={k} onClick={()=>{setThemeKey(k); localStorage.setItem('sidanus_theme',k);}} className={`py-2 rounded font-bold text-white ${THEMES[k].btn}`}>{THEMES[k].name}</button>))}</div></div>
          )}

        </div>
      </main>
    </div>
  );
}