const express = require("express");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

//Admin CRUD operations for candidates


module.exports = router;