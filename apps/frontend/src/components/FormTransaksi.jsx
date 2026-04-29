import { useState, useEffect } from 'react';

export default function FormTransaksi() {
  const [kategoriList, setKategoriList] = useState([]);
  const [picList, setPicList] = useState([]);
  
  const [formData, setFormData] = useState({
    nominal: '',
    keterangan: '',
    id_kategori: '',
    id_pj: '',
    tipe: 'KREDIT'
  });

  // Ambil data untuk Dropdown dari Backend
  useEffect(() => {
    fetch('http://localhost:3000/api/kategori')
      .then(res => res.json())
      .then(data => setKategoriList(data));

    fetch('http://localhost:3000/api/pic')
      .then(res => res.json())
      .then(data => setPicList(data));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/transaksi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert("Mantap! Transaksi berhasil disimpan ke Supabase.");
        window.location.reload(); // Refresh halaman biar saldonya langsung update
      }
    } catch (error) {
      console.error("Gagal nyimpan:", error);
      alert("Gagal nyambung ke database bro!");
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-700 mb-4">Input Transaksi Baru</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Tipe Transaksi</label>
            <select name="tipe" onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2 border">
              <option value="KREDIT">Uang Masuk (Kredit)</option>
              <option value="DEBIT">Uang Keluar (Debit)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Nominal (Rp)</label>
            <input type="number" name="nominal" onChange={handleChange} required className="w-full border-gray-300 rounded-lg shadow-sm p-2 border" placeholder="Contoh: 150000" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Kategori</label>
            <select name="id_kategori" onChange={handleChange} required className="w-full border-gray-300 rounded-lg shadow-sm p-2 border">
              <option value="">-- Pilih Kategori --</option>
              {kategoriList.map(k => (
                <option key={k.id} value={k.id}>{k.nama}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">PIC (Panitia)</label>
            <select name="id_pj" onChange={handleChange} required className="w-full border-gray-300 rounded-lg shadow-sm p-2 border">
              <option value="">-- Pilih PIC --</option>
              {picList.map(p => (
                <option key={p.id} value={p.id}>{p.nama}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Keterangan / Deskripsi</label>
          <input type="text" name="keterangan" onChange={handleChange} className="w-full border-gray-300 rounded-lg shadow-sm p-2 border" placeholder="Contoh: DP Cetak Banner" required />
        </div>

        <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-700 transition">
          Simpan Transaksi
        </button>
      </form>
    </div>
  );
}