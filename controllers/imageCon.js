const multer = require("multer");

//////////////////////////////////////////
const storage = multer.memoryStorage();
exports.uploadOptions = multer({
  storage,
});
