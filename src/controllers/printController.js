const puppeteer = require("puppeteer");
const db = require("../config/db");

exports.generateKuesionerPDF = async (req, res) => {
  const { id_ruang } = req.params;

  try {
    const result = await db.query(
      `
      SELECT * FROM hasil_kuesioner 
      WHERE id_ruang = $1 
      ORDER BY id_parameter ASC
    `,
      [id_ruang]
    );

    const data = result.rows;

    if (!data.length) return res.status(404).send("Data tidak ditemukan");

    const namaSekolah = data[0].nama_sekolah;
    const namaRuang = data[0].nama_ruang;

    const getCheck = (val, expected) => (val == expected ? "✓" : "");

    const html = `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; padding: 30px; }
            h2, h4 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #555; padding: 6px; font-size: 12px; text-align: center; }
            th { background-color: #eee; }
            td.left { text-align: left; }
          </style>
        </head>
        <body>
          <h2>SUPERVISI KEBERSIHAN SEKOLAH</h2>
          <h4>${namaSekolah} - ${namaRuang}</h4>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th class="left">Parameter</th>
                <th>Sangat Bersih</th>
                <th>Bersih</th>
                <th>Cukup</th>
                <th>Kurang</th>
                <th class="left">Catatan</th>
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (row, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td class="left">${row.parameter}</td>
                  <td>${getCheck(row.jawaban, 4)}</td>
                  <td>${getCheck(row.jawaban, 3)}</td>
                  <td>${getCheck(row.jawaban, 2)}</td>
                  <td>${getCheck(row.jawaban, 1)}</td>
                  <td class="left">${row.deskripsi_jawaban || ""}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setContent(html);
    const buffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="hasil_kuesioner_${id_ruang}.pdf"`,
    });
    res.send(buffer);
  } catch (err) {
    console.error("Gagal generate PDF:", err);
    res.status(500).send("Gagal cetak PDF.");
  }
};
