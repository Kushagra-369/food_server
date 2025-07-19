const express = require("express");
const router = express.Router();


const { createuser ,  getUserById , UserOtpVerify , LogInUser,ResendOTP , userDelete , userUpdated,changePassword} = require("../Controller/UserController");
const {LogInAdmin,getAllUserData} = require("../Controller/AdminController")
const {authenticate} = require("../middleware/AdminAuth")
const {UserAuthenticate , UserAuthorize} = require("../middleware/UserAuth")

router.post('/createuser', createuser);
router.post('/LogInUser', LogInUser);
router.get('/getUserById/:id', getUserById);
router.post('/user_otp_verify/:id', UserOtpVerify);
router.get('/ResendOTP/:id', ResendOTP);
router.delete('/userDelete/:id', UserAuthenticate, UserAuthorize, userDelete);
router.put('/userUpdated/:id', UserAuthenticate, UserAuthorize, userUpdated);
router.put('/changePassword/:id', UserAuthenticate, UserAuthorize, changePassword);


router.post('/LogInAdmin', LogInAdmin);
router.get('/getAllUserData/:type/:isDeleted',authenticate, getAllUserData)

module.exports = router; 
