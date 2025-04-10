const express = require("express")
const { register, login, getUser, editUser, createAd, getAllAds } = require("../controller/controller")
 const upload = require('../middleware/multerMiddleware')
const uploadAds = require("../middleware/multerMiddleware")
const router = new express.Router()


router.post('/register', register)
router.post('/login', login)
router.get('/getUserDetails/:userId', getUser);
router.put("/editUserDetails/:userId/",upload.single("img"),editUser);
router.post("/createAd", uploadAds.array("images", 10), createAd);

router.get("/getAllAds", getAllAds);








module.exports= router