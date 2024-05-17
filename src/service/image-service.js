const Tesseract = require("tesseract.js");

/**
 * =============================================================
 * Image text reader.
 * =============================================================
 * Read text from image.
 * GET Image from url.
 */
const reader = async (img) => {
  const out = await Tesseract.recognize(img, 'ind', {
    logger: e => console.log(e)
  });

  const lines = out.data.text.split('\n');
  return parseResult(lines)
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

module.exports = {
  reader
}