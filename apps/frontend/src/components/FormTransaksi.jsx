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

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
      <h3 className="text-lg font-bold text-gray-700 mb-4">{editData ? 'Edit Transaksi' : 'Input Transaksi Baru'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">ID Transaksi</label>
              <input type="text" value={editData ? `TRX-${editData.id.toString().padStart(4, '0')}` : 'TRX-AUTO'} disabled className="w-full bg-gray-100 p-2 border rounded-lg text-gray-500 font-mono text-sm" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Tanggal</label>
              <input type="date" value={form.tanggal} onChange={(e) => setForm({...form, tanggal: e.target.value})} required className={`w-full p-2 border rounded-lg ${theme.ring}`} />
            </div>
        </div>

        <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Tipe</label>
              <select value={form.tipe} onChange={(e) => setForm({...form, tipe: e.target.value})} className={`w-full p-2 border rounded-lg ${theme.ring}`}>
                <option value="KREDIT">Uang Masuk (Kredit)</option>
                <option value="DEBIT">Uang Keluar (Debit)</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Nominal (Rp)</label>
              <input type="number" value={form.nominal} onChange={(e) => setForm({...form, nominal: e.target.value})} required className={`w-full p-2 border rounded-lg ${theme.ring}`} />
            </div>
        </div>

        <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <select value={form.id_kategori} onChange={(e) => setForm({...form, id_kategori: e.target.value})} className={`w-full p-2 border rounded-lg ${theme.ring}`}>
                <option value="">-- Pilih --</option>
                {(kategoriList || []).map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">PJ</label>
              <select value={form.id_pj} onChange={(e) => setForm({...form, id_pj: e.target.value})} className={`w-full p-2 border rounded-lg ${theme.ring}`}>
                <option value="">-- Pilih --</option>
                {(picList || []).map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
              </select>
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium mb-1">Keterangan</label>
            <input type="text" value={form.keterangan} onChange={(e) => setForm({...form, keterangan: e.target.value})} className={`w-full p-2 border rounded-lg ${theme.ring}`} />
        </div>

        <div>
            <label className="block text-sm font-medium mb-1">Bukti Transaksi (Maks 1 MB)</label>
            <input type="file" accept="image/*" className={`w-full bg-white p-2 border rounded-lg ${theme.ring}`} />
        </div>

        <div className="flex gap-2 mt-2">
            <button type="submit" className={`flex-1 text-white font-bold py-3 rounded-lg ${editData ? 'bg-orange-500 hover:bg-orange-600' : theme.btn}`}>{editData ? 'Update Transaksi' : 'Simpan Transaksi'}</button>
            {editData && <button type="button" onClick={onCancelEdit} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-4 rounded-lg">Batal</button>}
        </div>
      </form>
    </div>
  );
}