const axios = require('axios');
const fs = require('fs');

const read = async (req, res, next) => {
  try {
    const { PdfReader } = await import('pdfreader');
    const pdfUrl = req.body.pdf_url;
    const tempFilePath = './temp.pdf';

    const response = await axios({
      url: pdfUrl,
      method: 'GET',
      responseType: 'stream',
    });

    const writer = fs.createWriteStream(tempFilePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    let result;

    await new Promise((resolve, reject) => {
      new PdfReader().parseFileItems(tempFilePath, (err, item) => {
        if (err) {
          console.error("error:", err);
          reject(err);
        } else if (!item) {
          console.warn("end of file");
          resolve();
        } else if (item.text) {
          result += item.text;
        }
      });
    });

    fs.unlink(tempFilePath, (err) => {
      if (err) console.error("Gagal menghapus file sementara:", err);
    });

    res.status(200).json({
      data: result.trim()
    });

  } catch (e) {
    next(e);
  }
};


module.exports = {
  read,
}