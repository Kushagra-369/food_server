const express = require("express");
const router = express.Router();

// middleware/URLnotfound.js

module.exports = (req, res) => {
    res.status(404).send("url not found");
};

