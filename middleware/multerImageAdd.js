
const multer = require("multer")
const path = require("path")


const storageAds = multer.diskStorage({
  destination: "./profileImages/",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

const fileFilterAds = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const uploadAds = multer({
  storage: storageAds,
  fileFilter: fileFilterAds,
  limits: { files: 10 }, // optional: limit number of files
});

module.exports = uploadAds;