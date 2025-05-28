const express = require("express")
const { register, login, getUser, editUser, createAd, getAllAds, getAdById, updateAd, searchItem, deleteAd, getUsersAds, searchByLocation, addToFavorites, removeFromFavorites} = require("../controller/controller")
 const upload = require('../middleware/multerMiddleware')
const uploadAds = require("../middleware/multerMiddleware")
const jwtMiddleware=require("../middleware/jwtMiddleware")
const router = new express.Router()


router.post('/register', register)
router.post('/login', login)
router.get('/getUserDetails/:userId', getUser);
router.put("/editUserDetails/:userId/",jwtMiddleware,upload.single("img"),editUser);
router.post("/createAd", uploadAds.array("images", 10), createAd);
router.get('/search/:query', searchItem);
router.get("/getAllAds", getAllAds);
router.get("/getAdById/:adId", getAdById);
router.delete("/deleteAd/:adId", deleteAd);
router.get("/getUsersAds/:userId", getUsersAds);

router.post("/favorites/add", addToFavorites);
router.post("/favorites/remove", removeFromFavorites);



router.get('/search/location/:location', searchByLocation);



 router.put("/updateAd/:adId", uploadAds.array("images", 10), updateAd);



module.exports= router