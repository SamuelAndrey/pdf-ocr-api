const Tesseract = require("tesseract.js");

/**
 * =============================================================
 * Image text reader.
 * =============================================================
 * Read text from image.
 * GET Image from url.
 */
const reader = async (img) => {
  const out = await Tesseract.recognize(img, 'eng', {
    logger: e => console.log(e)
  });

  const lines = out.data.text.split('\n');
  return parseResult(lines);
}

/**
 * Parse result text, custom template here!
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

function parseResult2(lines) {
  let result = {
    tanggal: "",
    petani: {
      nama: "",
      alamat: ""
    },
    pengepul: {
      nama: "",
      alamat: ""
    },
    transaksi: {
      nama: "",
      harga_satuan: 0,
      kuantitas: 0,
      total: 0
    }
  };

  return result;
}

module.exports = {
  reader
}