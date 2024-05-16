const axios = require('axios');
const fs = require('fs');
const pdfParse = require('pdf-parse');

const read = async (req, res, next) => {
  try {
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

    const pdfData = await pdfParse(tempFilePath);
    const lines = pdfData.text.split('\n');

    const result = lines.map(line => {
      const keyValueArray = line.split(':');
      if (keyValueArray.length === 2) {
        const [key, value] = keyValueArray;
        return { [key.trim()]: value.trim() };
      } else {
        return null;
      }
    }).filter(item => item !== null);

    res.status(200).json({ data: result });

    fs.unlink(tempFilePath, (err) => {
      if (err) console.error("Gagal menghapus file sementara:", err);
    });

  } catch (e) {
    next(e);
  }
};




module.exports = {
  read,
}