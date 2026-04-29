import { useState, useEffect } from 'react';

export default function FormTransaksi({ onSuccess, editData, onCancelEdit, theme }) {
  const [kategoriList, setKategoriList] = useState([]);
  const [picList, setPicList] = useState([]);
  
  const defaultForm = {
    tanggal: new Date().toISOString().split('T')[0],
    nominal: '', keterangan: '', id_kategori: '', id_pj: '', tipe: 'KREDIT', bukti_url: ''
  };

  const [formData, setFormData] = useState(defaultForm);
  const [fileBukti, setFileBukti] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/kategori').then(res => res.json()).then(data => setKategoriList(data));
    fetch('http://localhost:3000/api/pic').then(res => res.json()).then(data => setPicList(data));
  }, []);

  useEffect(() => {
    if (editData) {
      setFormData({
        tanggal: editData.tanggal ? editData.tanggal.split('T')[0] : defaultForm.tanggal,
        nominal: editData.nominal,
        keterangan: editData.keterangan || '',
        id_kategori: editData.id_kategori,
        id_pj: editData.id_pj,
        tipe: editData.tipe,
        bukti_url: editData.bukti_url || ''
      });
    } else {
      setFormData(defaultForm);
    }
  }, [editData]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi File Maksimal 1 MB (1048576 bytes)
      if (file.size > 1048576) {
        alert("Waduh, ukuran gambar kebesaran wok! Maksimal 1 MB ya biar database nggak jebol.");
        e.target.value = ''; // Reset input
        setFileBukti(null);
        return;
      }
      setFileBukti(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Catatan: Untuk upload gambar betulan ke Supabase Storage, butuh logic terpisah nanti.
      // Sementara kita kirim data teksnya dulu agar form jalan.
      const url = editData ? `http://localhost:3000/api/transaksi/${editData.id}` : 'http://localhost:3000/api/transaksi';
      const method = editData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setFormData(defaultForm);
        setFileBukti(null);
        document.getElementById('fileInput').value = ''; // Reset input UI
        if (onSuccess) onSuccess(editData ? 'diedit' : 'disimpan');
      }
    } catch (error) {
      alert("Gagal nyambung ke database bro!");
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-700">{editData ? 'Edit Transaksi' : 'Input Transaksi Baru'}</h3>
        {editData && <button onClick={onCancelEdit} className="text-rose-500 text-sm font-bold">Batal Edit</button>}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal Transaksi</label>
          <input type="date" name="tanggal" value={formData.tanggal} onChange={handleChange} required className={`w-full border-gray-300 rounded-lg shadow-sm p-2 border ${theme.ring}`} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Tipe</label>
            <select name="tipe" value={formData.tipe} onChange={handleChange} className={`w-full border-gray-300 rounded-lg shadow-sm p-2 border ${theme.ring}`}>
              <option value="KREDIT">Uang Masuk (Kredit)</option>
              <option value="DEBIT">Uang Keluar (Debit)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nominal (Rp)</label>
            <input type="number" name="nominal" value={formData.nominal} onChange={handleChange} required className={`w-full border-gray-300 rounded-lg shadow-sm p-2 border ${theme.ring}`} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Kategori</label>
            <select name="id_kategori" value={formData.id_kategori} onChange={handleChange} required className={`w-full border-gray-300 rounded-lg shadow-sm p-2 border ${theme.ring}`}>
              <option value="">-- Pilih --</option>
              {kategoriList.map(k => (<option key={k.id} value={k.id}>{k.nama}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">PJ</label>
            <select name="id_pj" value={formData.id_pj} onChange={handleChange} required className={`w-full border-gray-300 rounded-lg shadow-sm p-2 border ${theme.ring}`}>
              <option value="">-- Pilih --</option>
              {picList.map(p => (<option key={p.id} value={p.id}>{p.nama}</option>))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Keterangan</label>
          <input type="text" name="keterangan" value={formData.keterangan} onChange={handleChange} className={`w-full border-gray-300 rounded-lg shadow-sm p-2 border ${theme.ring}`} required />
        </div>

        {/* INPUT UPLOAD BUKTI */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Bukti Transaksi (Maks 1 MB)</label>
          <input type="file" id="fileInput" accept="image/jpeg, image/png, application/pdf" onChange={handleFileChange} className={`w-full border-gray-300 rounded-lg shadow-sm p-2 border text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 ${theme.ring}`} />
        </div>

        <button type="submit" className={`w-full text-white font-bold py-3 px-4 rounded-lg transition ${editData ? 'bg-orange-500 hover:bg-orange-600' : theme.btn}`}>
          {editData ? 'Update Transaksi' : 'Simpan Transaksi'}
        </button>
      </form>
    </div>
  );
}