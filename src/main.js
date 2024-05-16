const web = require("./app/web");
const {logger} = require("./app/logging");

web.listen(3000, () => {
  logger.info("App start");
})