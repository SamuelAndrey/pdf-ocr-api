const axios = require("axios");
const fs = require("fs");
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const {PdfDocument} = require("@ironsoftware/ironpdf");
const randomstring = require("randomstring");
const {NodeCanvasFactory} = require("../utils/node-canvas-factory");


/**
 * =============================================================
 * PDF all type (image & text) reader.
 * =============================================================
 * Can read all types of pdf (image & text).
 * GET PDF from cloud.
 */
async function PDFReader(pdfUrl) {
  const tempFilePath = "./temp/" + randomstring.generate();
  const pdf = tempFilePath + ".pdf";
  const img = tempFilePath + ".png";

  await getOnlinePDF(pdf, pdfUrl);
  await PDFToImage(img, pdf);

  try {
    const out = await Tesseract.recognize(img, 'ind', {
      logger: e => console.log(e)
    });

    unlinkFile(pdf);
    unlinkFile(img);

    const lines = out.data.text.split('\n');
    return parseResult(lines);

  } catch (e) {
    console.log(e)
  }
}


/**
 * =============================================================
 * PDF text file reader.
 * =============================================================
 * Can't read image on PDF file.
 * GET PDF from cloud.
 */
const PDFTextReader = async (pdfUrl) => {
  const tempFilePath = './temp.pdf';

  await getOnlinePDF(tempFilePath, pdfUrl);
  const pdfData = await pdfParse(tempFilePath);
  unlinkFile(tempFilePath)
  const lines = pdfData.text.split('\n');

  return parseResult(lines);
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
  unlinkFile(tempFilePath);
  unlinkFile(img);

  return result;
}



/**
 * Convert PDF to png
 * @param imgPath
 * @param pdf
 * @returns {Promise<void>}
 * @constructor
 */
async function PDFToImage(imgPath, pdf) {
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const CMAP_URL = "./node_modules/pdfjs-dist/cmaps/";
  const CMAP_PACKED = true;
  const STANDARD_FONT_DATA_URL = "./node_modules/pdfjs-dist/standard_fonts/";
  const canvasFactory = new NodeCanvasFactory();

  const pdfPath = process.argv[2] || pdf;
  const data = new Uint8Array(fs.readFileSync(pdfPath));

  const loadingTask = getDocument({
    data,
    cMapUrl: CMAP_URL,
    cMapPacked: CMAP_PACKED,
    standardFontDataUrl: STANDARD_FONT_DATA_URL,
    canvasFactory,
  });

  try {
    const pdfDocument = await loadingTask.promise;
    console.log("# PDF document loaded.");
    const page = await pdfDocument.getPage(1);

    // Render the page on a Node canvas with 200% scale.
    const viewport = page.getViewport({scale: 2.0});
    const canvasAndContext = canvasFactory.create(
      viewport.width,
      viewport.height
    );
    const renderContext = {
      canvasContext: canvasAndContext.context,
      viewport,
    };
    const renderTask = page.render(renderContext);
    await renderTask.promise;

    const image = canvasAndContext.canvas.toBuffer();
    saveImageToFile(imgPath, image);

    page.cleanup();
  } catch (reason) {
    console.log(reason);
  }
}


/**
 * Save image to file from buffer
 * @param imgPath
 * @param imageBuffer
 */
function saveImageToFile(imgPath, imageBuffer) {
  fs.writeFile(imgPath, imageBuffer, (error) => {
    if (error) {
      console.error("Error saving image: " + error);
    } else {
      console.log("Finished converting first page of PDF file to a PNG image.");
    }
  });
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
 * @returns {string}
 */
function unlinkFile(path) {
  fs.unlink(path, (err) => {
    if (err) console.error("Gagal menghapus file sementara:", err);
  });
  return "berhasil mengahpus file " + path;
}


/**
 * Parse text result, custom template here!
 * Default
 * @param lines
 * @returns {*}
 */
function parseResult(lines) {

  let result = {
    "nomor": "",
    "tanggal": "",
    "petani": {
      "nama": "",
      "alamat": "",
      "kelompok_tani" : ""
    },
    "pengepul": {
      "nama": "",
      "alamat": "",
      "kelompok_tani" : ""
    },
    "transaksi": {
      "jenis_bawang": "",
      "harga_satuan": 0,
      "kuantitas": 0,
      "transportasi": 0,
      "total": 0
    }
  };

  lines.forEach(line => {
    /**
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * Header Section
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~
     */
    if (line.includes("NOMOR")) {
      result.nomor = line.split(":")[1].trim() ?? null;
    }
    if (line.includes("TANGGAL")) {
      result.tanggal = line.split(":")[1].trim() ?? null;
    }

    /**
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * Farmer Section
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~
     */
    if (line.includes("Nama") && !result.petani.nama) {
      result.petani.nama = line.split(":")[1].trim() ?? null;
    }
    if (line.includes("Alamat") && !result.petani.alamat) {
      result.petani.alamat = line.split(":")[1].trim() ?? null;
    }
    if (line.includes("Daerah") && !result.petani.kelompok_tani) {
      result.petani.kelompok_tani = line.split(":")[1].trim() ?? null;
    }

    /**
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * Collector Section
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~
     */
    if (line.includes("Nama") && result.petani.nama) {
      result.pengepul.nama = line.split(":")[1].trim() ?? null;
    }
    if (line.includes("Alamat") && result.petani.alamat) {
      result.pengepul.alamat = line.split(":")[1].trim() ?? null;
    }
    if (line.includes("Daerah") && result.petani.kelompok_tani) {
      result.pengepul.kelompok_tani = line.split(":")[1].trim() ?? null;
    }

    /**
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~
     * Transaction Section
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~
     */
    if (line.includes("Jenis")) {
      result.transaksi.jenis_bawang = line.split(":")[1].trim() ?? null;
    }
    if (line.includes("Harga")) {
      result.transaksi.harga_satuan = parseInt(line.split(":")[1].trim().replace(/\./g, "")) ?? 0;
    }
    if (line.includes("Kuantitas")) {
      result.transaksi.kuantitas = parseInt(line.split(":")[1].trim().replace(/\./g, "")) ?? 0;
    }
    if (line.includes("Transportasi")) {
      result.transaksi.transportasi = parseInt(line.split(":")[1].trim().replace(/\./g, "")) ?? 0;
    }
    if (line.includes("Total")) {
      result.transaksi.total = parseInt(line.split(":")[1].trim().replace(/\./g, "")) ?? 0;
    }
  });

  return result;
}


module.exports = {
  PDFReader,
  PDFImageReader,
  PDFTextReader,
}