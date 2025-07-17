const express = require("express");
const router = express.Router();


const { createuser ,  getUserById , UserOtpVerify , LogInUser,} = require("../Controller/UserController");
const {LogInAdmin,getAllUserData} = require("../Controller/AdminController")
const {authenticate} = require("../middleware/UserAuth")

router.post('/createuser', createuser);
router.post('/LogInUser', LogInUser);
router.get('/getUserById/:id', getUserById);
router.post('/user_otp_verify/:id', UserOtpVerify);

router.post('/LogInAdmin', LogInAdmin);
router.get('/getAllUserData/:type/:isDeleted',authenticate, getAllUserData)

module.exports = router; 
