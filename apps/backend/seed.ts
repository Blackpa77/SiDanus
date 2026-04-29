import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Mulai menyuntikkan data referensi INFEST...");

  // Insert Kategori
  await prisma.kategori.createMany({
    data: [
      { nama: 'Sponsorship' },
      { nama: 'Danus Makanan' },
      { nama: 'Merchandise' },
      { nama: 'Operasional Event' },
      { nama: 'Pubdok & Cetak' }
    ],
    skipDuplicates: true,
  });

  // Insert PIC
  await prisma.penanggungJawab.createMany({
    data: [
      { nama: 'Arjun' },
      { nama: 'Adinda' },
      { nama: 'Budi (Ketua)' },
      { nama: 'Siti (Bendahara)' }
    ],
    skipDuplicates: true,
  });

  console.log("Data berhasil dimasukkan!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });