import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = new Elysia()
  .use(cors())
  
  // Endpoint Cek Status Server
  .get('/', () => 'API SiDanus INFEST Berjalan Lancar!')
  
  // Endpoint untuk Dropdown Kategori (Fitur 2)
  .get('/api/kategori', async () => {
    return await prisma.kategori.findMany();
  })
  
  // Endpoint untuk Dropdown Penanggung Jawab (Fitur 3)
  .get('/api/pic', async () => {
    return await prisma.penanggungJawab.findMany();
  })
  
  // Endpoint untuk Riwayat Transaksi (Fitur 1, 4, 5, 6, 7)
  .get('/api/transaksi', async () => {
    return await prisma.transaksi.findMany({
      include: { 
        kategori: true, 
        pj: true 
      },
      orderBy: { tanggal: 'desc' }
    });
  })
  
  // Endpoint untuk Dashboard & Kalkulasi Saldo (Fitur 8)
  .get('/api/stats', async () => {
    const transaksi = await prisma.transaksi.findMany();
    let kredit = 0;
    let debit = 0;
    
    transaksi.forEach(t => {
      if (t.tipe === 'KREDIT') kredit += t.nominal;
      if (t.tipe === 'DEBIT') debit += t.nominal;
    });

    return {
      total_kredit: kredit,
      total_debit: debit,
      saldo_saat_ini: kredit - debit
    };
  })
  .listen(3000);

console.log(`🦊 Backend SiDanus menyala di http://${app.server?.hostname}:${app.server?.port}`);