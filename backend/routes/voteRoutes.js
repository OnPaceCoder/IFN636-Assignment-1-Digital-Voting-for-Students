const express = require("express");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const { getCandidates } = require("../controllers/candidateController");

const router = express.Router();

// Voter CRUD operations
router.get("/", protect, getCandidates);
module.exports = router;