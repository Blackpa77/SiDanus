import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const app = new Elysia()
  .use(cors()) // Wajib biar frontend bisa ngobrol sama backend

  // Jalur GET: Ambil Data
  .get("/api/stats", async () => {
    const kredit = await prisma.transaksi.aggregate({ _sum: { nominal: true }, where: { tipe: 'KREDIT' } });
    const debit = await prisma.transaksi.aggregate({ _sum: { nominal: true }, where: { tipe: 'DEBIT' } });
    const total_kredit = kredit._sum.nominal || 0;
    const total_debit = debit._sum.nominal || 0;
    return { total_kredit, total_debit, saldo_saat_ini: total_kredit - total_debit };
  })
  .get("/api/transaksi", async () => await prisma.transaksi.findMany({ include: { kategori: true, penanggungJawab: true }, orderBy: { id: 'desc' } }))
  .get("/api/kategori", async () => await prisma.kategori.findMany())
  .get("/api/pic", async () => await prisma.penanggungJawab.findMany())

  // Jalur POST: Simpan Data Baru
  .post("/api/transaksi", async ({ body }: { body: any }) => {
    const newTransaksi = await prisma.transaksi.create({
      data: {
        tipe: body.tipe,
        nominal: parseInt(body.nominal),
        keterangan: body.keterangan,
        id_kategori: parseInt(body.id_kategori),
        id_pj: parseInt(body.id_pj)
      }
    });
    return { success: true, data: newTransaksi };
  })
  .post("/api/pic", async ({ body }: { body: any }) => {
    const newPj = await prisma.penanggungJawab.create({
      data: { nama: body.nama }
    });
    return { success: true, data: newPj };
  })

  .listen(3000);

console.log(`🦊 Backend SiDanus jalan dan siap nerima data di ${app.server?.hostname}:${app.server?.port}`);