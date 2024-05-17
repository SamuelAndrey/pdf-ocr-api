const axios = require("axios");
const fs = require("fs");
const Tesseract = require('tesseract.js');
const {PdfDocument} = require("@ironsoftware/ironpdf");
const T = require("tesseract.js");


/**
 * PDF text file reader.
 * Can't read image on PDF file.
 */
const PDFReader = async (pdfUrl) => {
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

  fs.unlink(tempFilePath, (err) => {
    if (err) console.error("Gagal menghapus file sementara:", err);
  });

  return result;
};


/**
 * PDF image reader.
 * Can read image on PDF file.
 */
const PDFImageReader = async (pdfUrl) => {
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
  const img = "./sample.png";
  await PdfDocument.fromFile(tempFilePath).then((resolve) => {
    resolve.rasterizeToImageFiles(img);
    return resolve;
  });

  const out = await Tesseract.recognize(img, 'ind', { logger: e => console.log(e) });

  const lines = out.data.text.split('\n');
  return lines.map(line => {
    const keyValueArray = line.split(':');
    if (keyValueArray.length === 2) {
      const [key, value] = keyValueArray;
      return {[key.trim()]: value.trim()};
    } else {
      return null;
    }
  }).filter(item => item !== null);
}


module.exports = {
  PDFReader,
  PDFImageReader,
}