const express = require("express");
const router = express.Router();
const multer = require("multer")

const { createuser ,  getUserById , UserOtpVerify , LogInUser,ResendOTP , userDelete , userUpdated,changePassword,UploadProfileImg,newEmail,newEmailVerify,getAllUsers,getDeletedUsers ,createReview } = require("../Controller/UserController");
const {LogInAdmin,getAllUserData , AdminOtpVerify, UploadAdminProfileImg ,getAllReviews } = require("../Controller/AdminController")
const {CreateProduct,GetAllProducts,GetByCategory ,CreateUserProduct } = require("../Controller/ProductController")
const {authenticate,AdminAuthorize} = require("../middleware/AdminAuth")
const {UserAuthenticate , UserAuthorize} = require("../middleware/UserAuth")
const { placeOrder , getAllOrders } = require("../Controller/OrderController");

const upload = multer({storage:multer.diskStorage({})})

router.post('/createuser', createuser);
router.post('/LogInUser', LogInUser);
router.get('/getUserById/:id', getUserById);
router.post('/user_otp_verify/:id', UserOtpVerify);
router.get('/ResendOTP/:id', ResendOTP);
router.delete('/userDelete/:id', UserAuthenticate, UserAuthorize, userDelete);
router.put('/userUpdated/:id', UserAuthenticate, UserAuthorize, userUpdated);
router.put('/changePassword/:id', UserAuthenticate, UserAuthorize, changePassword);
router.put('/UploadProfileImg/:id', upload.single("profileIMG"), UserAuthenticate, UserAuthorize, UploadProfileImg);
router.put('/newEmail/:id', UserAuthenticate, UserAuthorize, newEmail);
router.post('/newEmailVerify/:id', UserAuthenticate, UserAuthorize, newEmailVerify);
router.get("/getAllUsers", getAllUsers);
router.get("/getDeletedUsers", getDeletedUsers);
router.post("/CreateUserReview/:userId", createReview);

router.post('/LogInAdmin', LogInAdmin);
router.get('/getAllUserData/:type/:isDeleted',authenticate, AdminAuthorize,getAllUserData)
router.post('/admin_otp_verify/:id', AdminOtpVerify);
router.put('/UploadAdminProfileImg/:id', upload.single("profileIMG"), authenticate, AdminAuthorize, UploadAdminProfileImg);
router.get("/GetAllReviews", getAllReviews);

// router.put('/adminUpdated/:id', UserAuthenticate, UserAuthorize, adminUpdated);

router.post('/CreateProduct/:id', upload.single("productImg"), authenticate, AdminAuthorize, CreateProduct);

router.post(
  '/CreateUserProduct/:id', 
  upload.none(),             // <--- add this
  UserAuthenticate, 
  UserAuthorize, 
  CreateUserProduct
);


router.get('/GetAllProducts/:type', GetAllProducts);
router.get('/GetByCategory/:category', GetByCategory);

// Orders
// Routes.js
router.post('/placeOrder', UserAuthenticate, placeOrder); // no id param needed
router.get('/getAllOrders', authenticate, getAllOrders);

module.exports = router;
