const express = require("express");
const router = express.Router();

const { createuser , getAllData , getUserById } = require("../Controller/UserController");

router.post('/createuser', createuser);
router.get('/getAllData', getAllData);
router.get('/getUserById/:id', getUserById);


module.exports = router; 
