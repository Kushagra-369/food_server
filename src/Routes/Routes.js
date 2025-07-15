const express = require("express");
const router = express.Router();


const { createuser ,  getUserById , UserOtpVerify , LogInUser} = require("../Controller/UserController");

router.post('/createuser', createuser);
router.post('/LogInUser', LogInUser);
router.get('/getUserById/:id', getUserById);
router.post('/user_otp_verify/:id', UserOtpVerify);


module.exports = router; 
