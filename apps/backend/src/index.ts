import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const app = new Elysia()
  .use(cors())

  // ==== STATS & TRANSAKSI UTAMA ====
  .get("/api/stats", async () => {
    const kredit = await prisma.transaksi.aggregate({ _sum: { nominal: true }, where: { tipe: 'KREDIT' } });
    const debit = await prisma.transaksi.aggregate({ _sum: { nominal: true }, where: { tipe: 'DEBIT' } });
    return { total_kredit: kredit._sum.nominal || 0, total_debit: debit._sum.nominal || 0, saldo_saat_ini: (kredit._sum.nominal || 0) - (debit._sum.nominal || 0) };
  })
  
  // ==== SYSTEM INFO (STORAGE LIMIT SUPABASE) ====
  .get("/api/sysinfo", async () => {
    try {
      // Tanya langsung ke server PostgreSQL Supabase berapa ukuran databasenya
      const result: any[] = await prisma.$queryRaw`SELECT pg_database_size(current_database()) as size`;
      
      // Hasil dari database biasanya BigInt, kita ubah jadi Number biasa
      const dbSize = Number(result[0].size); 
      
      // Limit Supabase Free Tier = 500 MB (524288000 bytes)
      return { size_bytes: dbSize, limit_bytes: 524288000 }; 
    } catch(e) {
      console.log("Gagal baca ukuran DB:", e);
      return { size_bytes: 0, limit_bytes: 524288000 };
    }
  })

  .get("/api/transaksi", async () => await prisma.transaksi.findMany({ include: { kategori: true, pj: true }, orderBy: { id: 'desc' } }))
  
  // ==== KATEGORI & PIC (PJ) ====
  .get("/api/kategori", async () => await prisma.kategori.findMany())
  .post("/api/kategori", async ({ body }: { body: any }) => await prisma.kategori.create({ data: { nama: body.nama } }))
  .delete("/api/kategori/:id", async ({ params }) => { await prisma.kategori.delete({ where: { id: parseInt(params.id) }}); return {success: true}; })

  .get("/api/pic", async () => await prisma.penanggungJawab.findMany())
  .post("/api/pic", async ({ body }: { body: any }) => await prisma.penanggungJawab.create({ data: { nama: body.nama } }))
  .delete("/api/pic/:id", async ({ params }) => { await prisma.penanggungJawab.delete({ where: { id: parseInt(params.id) }}); return {success: true}; })

  // ==== TRANSAKSI CRUD ====
  .post("/api/transaksi", async ({ body }: { body: any }) => await prisma.transaksi.create({ data: { tanggal: new Date(body.tanggal), tipe: body.tipe, nominal: parseFloat(body.nominal), keterangan: body.keterangan, id_kategori: parseInt(body.id_kategori), id_pj: parseInt(body.id_pj), bukti_url: body.bukti_url || null } }))
  .put("/api/transaksi/:id", async ({ params, body }: { params: any, body: any }) => await prisma.transaksi.update({ where: { id: parseInt(params.id) }, data: { tanggal: new Date(body.tanggal), tipe: body.tipe, nominal: parseFloat(body.nominal), keterangan: body.keterangan, id_kategori: parseInt(body.id_kategori), id_pj: parseInt(body.id_pj), bukti_url: body.bukti_url || null } }))
  .delete("/api/transaksi/:id", async ({ params }) => { await prisma.transaksi.delete({ where: { id: parseInt(params.id) } }); return { success: true }; })

  // ==== PAID PROMOTE ====
  .get("/api/paid-promote", async () => await prisma.paidPromote.findMany({ orderBy: { id: 'desc' } }))
  .post("/api/paid-promote", async ({ body }: { body: any }) => {
    const tx = await prisma.transaksi.create({ data: { tanggal: new Date(body.tanggal_mulai), tipe: 'KREDIT', nominal: parseFloat(body.harga), keterangan: `Pendapatan Paid Promote: ${body.nama_pemesan}` } });
    const pp = await prisma.paidPromote.create({ data: { nama_pemesan: body.nama_pemesan, tanggal_mulai: new Date(body.tanggal_mulai), tanggal_selesai: new Date(body.tanggal_selesai), harga: parseFloat(body.harga), status: "Aktif", transaksi_id: tx.id } });
    return { success: true, data: pp };
  })
  .put("/api/paid-promote/:id/batal", async ({ params }) => {
    const pp = await prisma.paidPromote.findUnique({ where: { id: parseInt(params.id) } });
    if (pp?.transaksi_id) {
      await prisma.transaksi.delete({ where: { id: pp.transaksi_id } }).catch(()=>null);
      await prisma.paidPromote.update({ where: { id: parseInt(params.id) }, data: { status: "Dibatalkan", transaksi_id: null } });
    }
    return { success: true };
  })
  .put("/api/paid-promote/:id", async ({ params, body }: { params: any, body: any }) => {
    const pp = await prisma.paidPromote.update({ where: { id: parseInt(params.id) }, data: { nama_pemesan: body.nama_pemesan, tanggal_mulai: new Date(body.tanggal_mulai), tanggal_selesai: new Date(body.tanggal_selesai), harga: parseFloat(body.harga) } });
    if(pp.transaksi_id) {
      await prisma.transaksi.update({ where: { id: pp.transaksi_id }, data: { tanggal: new Date(body.tanggal_mulai), nominal: parseFloat(body.harga), keterangan: `Pendapatan Paid Promote: ${body.nama_pemesan}` } }).catch(()=>null);
    }
    return { success: true, data: pp };
  })
  .delete("/api/paid-promote/:id", async ({ params }) => {
    const pp = await prisma.paidPromote.findUnique({ where: { id: parseInt(params.id) } });
    if (pp?.transaksi_id) await prisma.transaksi.delete({ where: { id: pp.transaksi_id } }).catch(()=>null);
    await prisma.paidPromote.delete({ where: { id: parseInt(params.id) } });
    return { success: true };
  })

  // ==== PROPOSAL ====
  .get("/api/proposal", async () => await prisma.proposal.findMany({ orderBy: { id: 'desc' } }))
  .post("/api/proposal", async ({ body }: { body: any }) => await prisma.proposal.create({ data: { pj_pengantar: body.pj_pengantar, instansi: body.instansi, status: body.status } }))
  .put("/api/proposal/:id", async ({ params, body }: { body: any, params: any }) => {
    const current = await prisma.proposal.findUnique({ where: { id: parseInt(params.id) } });
    let txId = current?.transaksi_id;

    if (body.status === 'Dicairkan' && body.nominal_cair && !txId) {
        const tx = await prisma.transaksi.create({ data: { tanggal: new Date(), tipe: 'KREDIT', nominal: parseFloat(body.nominal_cair), keterangan: `Pencairan Proposal: ${current?.instansi}` } });
        txId = tx.id;
    }
    const prop = await prisma.proposal.update({ where: { id: parseInt(params.id) }, data: { status: body.status, nominal_cair: body.nominal_cair ? parseFloat(body.nominal_cair) : null, transaksi_id: txId } });
    return { success: true, data: prop };
  })
  .put("/api/proposal/:id/edit", async ({ params, body }: { params: any, body: any }) => {
    const prop = await prisma.proposal.update({ where: { id: parseInt(params.id) }, data: { pj_pengantar: body.pj_pengantar, instansi: body.instansi } });
    if (prop.transaksi_id) {
      await prisma.transaksi.update({ where: { id: prop.transaksi_id }, data: { keterangan: `Pencairan Proposal: ${body.instansi}` } }).catch(()=>null);
    }
    return { success: true };
  })
  .delete("/api/proposal/:id", async ({ params }) => {
    const prop = await prisma.proposal.findUnique({ where: { id: parseInt(params.id) } });
    if (prop?.transaksi_id) await prisma.transaksi.delete({ where: { id: prop.transaksi_id } }).catch(()=>null);
    await prisma.proposal.delete({ where: { id: parseInt(params.id) } });
    return { success: true };
  })

  // ==== RESET DATABASE (FACTORY RESET) KHUSUS POSTGRESQL (SUPABASE) ====
  .delete("/api/reset-database", async () => {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Transaksi", "PaidPromote", "Proposal", "Kategori", "PenanggungJawab" RESTART IDENTITY CASCADE;`);
      return { success: true, message: "Database Supabase berhasil dicuci bersih!" };
    } catch (error) {
      return { success: false, error: "Gagal mereset database Supabase." };
    }
  })

  .listen(3000);

console.log(`🦊 Backend SiDanus V8 (Supabase Storage Indicator) Jalan!`);