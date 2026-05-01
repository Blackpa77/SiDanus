import { useState, useEffect } from 'react';

export default function FormTransaksi({ theme, editData, onCancelEdit, onSuccess, picList, kategoriList }) {
  const [form, setForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    tipe: 'KREDIT',
    nominal: '',
    id_kategori: '',
    id_pj: '',
    keterangan: '',
    bukti_url: ''
  });

  useEffect(() => {
    if (editData) {
      setForm({
        tanggal: editData.tanggal ? editData.tanggal.split('T')[0] : '',
        tipe: editData.tipe,
        nominal: editData.nominal,
        id_kategori: editData.id_kategori || '',
        id_pj: editData.id_pj || '',
        keterangan: editData.keterangan || '',
        bukti_url: editData.bukti_url || ''
      });
    } else {
      setForm({
        tanggal: new Date().toISOString().split('T')[0],
        tipe: 'KREDIT',
        nominal: '',
        id_kategori: '',
        id_pj: '',
        keterangan: '',
        bukti_url: ''
      });
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editData ? `http://localhost:3000/api/transaksi/${editData.id}` : 'http://localhost:3000/api/transaksi';
    const method = editData ? 'PUT' : 'POST';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    onSuccess(editData ? 'diupdate' : 'disimpan');
  };

  const inputClass = `w-full p-2 border rounded-lg ${theme.ring} ${theme.bgCard} ${theme.textMain} ${theme.borderCard}`;

  return (
    <div className={`${theme.bgCard} p-6 rounded-2xl shadow-sm border ${theme.borderCard} h-fit transition-colors duration-500`}>
      <h3 className={`text-lg font-bold ${theme.textMain} mb-4`}>{editData ? 'Edit Transaksi' : 'Input Transaksi Baru'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
            <div className="flex-1">
              <label className={`block text-sm font-medium mb-1 ${theme.textMain}`}>ID Transaksi</label>
              <input type="text" value={editData ? `TRX-${editData.id.toString().padStart(4, '0')}` : 'TRX-AUTO'} disabled className={`w-full p-2 border rounded-lg font-mono text-sm opacity-60 ${theme.bgMain} ${theme.textMain} ${theme.borderCard}`} />
            </div>
            <div className="flex-1">
              <label className={`block text-sm font-medium mb-1 ${theme.textMain}`}>Tanggal</label>
              <input type="date" value={form.tanggal} onChange={(e) => setForm({...form, tanggal: e.target.value})} required className={inputClass} />
            </div>
        </div>

        <div className="flex gap-4">
            <div className="flex-1">
              <label className={`block text-sm font-medium mb-1 ${theme.textMain}`}>Tipe</label>
              <select value={form.tipe} onChange={(e) => setForm({...form, tipe: e.target.value})} className={inputClass}>
                <option value="KREDIT">Uang Masuk (+)</option>
                <option value="DEBIT">Uang Keluar (-)</option>
              </select>
            </div>
            <div className="flex-1">
              <label className={`block text-sm font-medium mb-1 ${theme.textMain}`}>Nominal (Rp)</label>
              <input type="number" value={form.nominal} onChange={(e) => setForm({...form, nominal: e.target.value})} required className={inputClass} />
            </div>
        </div>

        <div className="flex gap-4">
            <div className="flex-1">
              <label className={`block text-sm font-medium mb-1 ${theme.textMain}`}>Kategori</label>
              <select value={form.id_kategori} onChange={(e) => setForm({...form, id_kategori: e.target.value})} className={inputClass}>
                <option value="">-- Pilih --</option>
                {(kategoriList || []).map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className={`block text-sm font-medium mb-1 ${theme.textMain}`}>PJ</label>
              <select value={form.id_pj} onChange={(e) => setForm({...form, id_pj: e.target.value})} className={inputClass}>
                <option value="">-- Pilih --</option>
                {(picList || []).map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
              </select>
            </div>
        </div>

        <div>
            <label className={`block text-sm font-medium mb-1 ${theme.textMain}`}>Keterangan</label>
            <input type="text" value={form.keterangan} onChange={(e) => setForm({...form, keterangan: e.target.value})} className={inputClass} />
        </div>

        <div className="flex gap-2 mt-4">
            <button type="submit" className={`flex-1 text-white font-bold py-3 rounded-lg shadow-sm ${editData ? 'bg-orange-500 hover:bg-orange-600' : theme.btn}`}>{editData ? 'Update Transaksi' : 'Simpan Transaksi'}</button>
            {editData && <button type="button" onClick={onCancelEdit} className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg">Batal</button>}
        </div>
      </form>
    </div>
  );
}