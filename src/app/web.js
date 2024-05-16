const express = require('express');
const { errorMiddleware } = require('../middleware/error-middleware');
const publicRouter = require('../route/public-api');
const web = express();
module.exports = web;

web.use(express.json());

web.use(publicRouter);

web.use(errorMiddleware);
