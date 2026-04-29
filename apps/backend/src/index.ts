import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const app = new Elysia()
  .use(cors())

  .get("/api/stats", async () => {
    const kredit = await prisma.transaksi.aggregate({ _sum: { nominal: true }, where: { tipe: 'KREDIT' } });
    const debit = await prisma.transaksi.aggregate({ _sum: { nominal: true }, where: { tipe: 'DEBIT' } });
    return { total_kredit: kredit._sum.nominal || 0, total_debit: debit._sum.nominal || 0, saldo_saat_ini: (kredit._sum.nominal || 0) - (debit._sum.nominal || 0) };
  })
  
  // PERHATIKAN: Relasi sekarang bernama 'pj' sesuai skema kamu
  .get("/api/transaksi", async () => await prisma.transaksi.findMany({ include: { kategori: true, pj: true }, orderBy: { id: 'desc' } }))
  .get("/api/kategori", async () => await prisma.kategori.findMany())
  .get("/api/pic", async () => await prisma.penanggungJawab.findMany())

  .post("/api/transaksi", async ({ body }: { body: any }) => {
    const newTx = await prisma.transaksi.create({
      data: {
        tanggal: new Date(body.tanggal), // Convert string ke DateTime Prisma
        tipe: body.tipe,
        nominal: parseFloat(body.nominal), // Float sesuai skema
        keterangan: body.keterangan,
        id_kategori: parseInt(body.id_kategori),
        id_pj: parseInt(body.id_pj),
        bukti_url: body.bukti_url || null
      }
    });
    return { success: true, data: newTx };
  })

  .put("/api/transaksi/:id", async ({ params, body }: { params: any, body: any }) => {
    const updateTx = await prisma.transaksi.update({
      where: { id: parseInt(params.id) },
      data: {
        tanggal: new Date(body.tanggal),
        tipe: body.tipe,
        nominal: parseFloat(body.nominal),
        keterangan: body.keterangan,
        id_kategori: parseInt(body.id_kategori),
        id_pj: parseInt(body.id_pj),
        bukti_url: body.bukti_url || null
      }
    });
    return { success: true, data: updateTx };
  })

  .delete("/api/transaksi/:id", async ({ params }) => {
    await prisma.transaksi.delete({ where: { id: parseInt(params.id) } });
    return { success: true };
  })

  .post("/api/pic", async ({ body }: { body: any }) => await prisma.penanggungJawab.create({ data: { nama: body.nama } }))
  .delete("/api/pic/:id", async ({ params }) => { await prisma.penanggungJawab.delete({ where: { id: parseInt(params.id) }}); return {success: true}; })
  .listen(3000);

console.log(`🦊 Backend SiDanus API (V2 Skema Baru) Jalan!`);