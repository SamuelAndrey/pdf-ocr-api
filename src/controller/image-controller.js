const imageService = require('../service/image-service');

const reader = async (req, res, next) => {
  try {
    const img = req.body.image_url;
    const result = await imageService.reader(img);
    res.status(200).json({
      data: result
    });
  } catch (e) {
    next(e);
  }
};


module.exports = {
  reader
}