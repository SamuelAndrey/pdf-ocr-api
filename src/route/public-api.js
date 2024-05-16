const express = require('express');
const pdfReaderController = require('../controller/pdf-reader-controller')

const publicRouter = express.Router();

publicRouter.post('/api/v1/pdf-readers', pdfReaderController.read);

module.exports = publicRouter;