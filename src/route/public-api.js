const express = require('express');
const pdfReaderController = require('../controller/pdf-controller')
const imageController = require('../controller/image-controller')

const publicRouter = express.Router();

publicRouter.post('/api/v1/url/pdf-text-reader', pdfReaderController.PDFTextReader);
publicRouter.post('/api/v1/url/pdf-image-reader', pdfReaderController.PDFImageReader);
publicRouter.post('/api/v1/url/pdf-reader', pdfReaderController.PDFReader);

publicRouter.post('/api/v1/url/read-image-url', imageController.reader);



module.exports = publicRouter;