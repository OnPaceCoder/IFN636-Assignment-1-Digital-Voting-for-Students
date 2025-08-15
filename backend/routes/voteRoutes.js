const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { getCandidates } = require("../controllers/candidateController");

const router = express.Router();

// Voter CRUD operations
router.get("/candidates", protect, getCandidates);
router.post("/:id", protect, castVote)
module.exports = router;