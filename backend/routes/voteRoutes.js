const express = require("express");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// Voter CRUD operations

module.exports = router;