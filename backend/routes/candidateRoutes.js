const express = require("express");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const { createCandidate } = require("../controllers/candidateController");

const router = express.Router();

//Admin CRUD operations for candidates
router.post("/", protect, adminOnly, createCandidate);

module.exports = router;