const express = require('express');
const pdfReaderController = require('../controller/pdf-controller')
const imageController = require('../controller/image-controller')

const publicRouter = express.Router();

publicRouter.post('/api/v1/read-pdf-url', pdfReaderController.PDFReader);
publicRouter.post('/api/v1/read-image-url', imageController.reader);

publicRouter.post('/api/v1/pdf-image-url', pdfReaderController.PDFImageReader);
// publicRouter.post('/api/v1/pdf-image-file', pdfReaderController.PDFImageReader);

// publicRouter.post('/api/v1/read-pdf-file',  pdfReaderController.PDFReader);
// publicRouter.post('/api/v1/read-image-file', imageController.reader);

module.exports = publicRouter;