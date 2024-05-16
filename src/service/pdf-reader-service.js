const read = async (file) => {
  return readPdfText({url: file});
}

module.exports = {
  read
}