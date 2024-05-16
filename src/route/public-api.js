const express = require('express');
const pdfReaderController = require('../controller/pdf-controller')

const publicRouter = express.Router();

publicRouter.post('/api/v1/pdf-readers', pdfReaderController.reader);

module.exports = publicRouter;