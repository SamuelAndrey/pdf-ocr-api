const axios = require("axios");
const fs = require("fs");
const pdfParse = require("pdf-parse");

const reader = async (pdfUrl) => {
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

  fs.unlink(tempFilePath, (err) => {
    if (err) console.error("Gagal menghapus file sementara:", err);
  });

  return lines.map(line => {
    const keyValueArray = line.split(':');
    if (keyValueArray.length === 2) {
      const [key, value] = keyValueArray;
      return { [key.trim()]: value.trim() };
    } else {
      return null;
    }
  }).filter(item => item !== null);
}


module.exports = {
  reader
}