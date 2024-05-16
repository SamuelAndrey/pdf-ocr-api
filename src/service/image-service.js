const T = require("tesseract.js");

const reader = async (img) => {
  const out = await T.recognize(img, 'ind', { logger: e => console.log(e) });

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
  reader
}