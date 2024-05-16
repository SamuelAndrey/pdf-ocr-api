const pdfService = require('../service/v1/pdf-service');

const reader = async (req, res, next) => {
  try {
    const pdf_url = req.body.pdf_url;
    const result = await pdfService.reader(pdf_url);
    res.status(200).json({
      data: result
    });
  } catch (e) {
    next(e);
  }
};


module.exports = {
  reader,
}
