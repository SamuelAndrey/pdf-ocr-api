const axios = require("axios");
const fs = require("fs");
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const { PdfDocument } = require("@ironsoftware/ironpdf");

/**
 * =============================================================
 * PDF text file reader.
 * =============================================================
 * Can't read image on PDF file.
 * GET PDF from cloud.
 */
const PDFReader = async (pdfUrl) => {
  const tempFilePath = './temp.pdf';

  await getOnlinePDF(tempFilePath, pdfUrl);
  const pdfData = await pdfParse(tempFilePath);
  const lines = pdfData.text.split('\n');

  const result = parseResult(lines);
  await unlinkFile(tempFilePath)

  return result;
};


/**
 * =============================================================
 * PDF image reader.
 * =============================================================
 * Can read image on PDF file.
 * GET PDF from cloud.
 */
const PDFImageReader = async (pdfUrl) => {
  const tempFilePath = './temp.pdf';
  const img = "./sample.png";

  await getOnlinePDF(tempFilePath, pdfUrl);
  await PdfDocument.fromFile(tempFilePath).then((resolve) => {
    resolve.rasterizeToImageFiles(img);
    return resolve;
  });

  const out = await Tesseract.recognize(img, 'ind', {
    logger: e => console.log(e)
  });

  const lines = out.data.text.split('\n');
  const result = parseResult(lines);
  await unlinkFile(tempFilePath);
  await unlinkFile(img);

  return result;
}

/**
 * Get online pdf to local.
 * @param path
 * @param url
 * @returns {Promise<void>}
 */
async function getOnlinePDF(path, url) {
  const response = await axios({
    url: url,
    method: 'GET',
    responseType: 'stream',
  });

  const writer = fs.createWriteStream(path);
  response.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

/**
 * Unlink file from storage.
 * @param path
 * @returns {Promise<void>}
 */
async function unlinkFile(path) {
  fs.unlink(path, (err) => {
    if (err) console.error("Gagal menghapus file sementara:", err);
  });
}

/**
 * Parse text result, custom template here!
 * @param lines
 * @returns {*}
 */
function parseResult(lines) {
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