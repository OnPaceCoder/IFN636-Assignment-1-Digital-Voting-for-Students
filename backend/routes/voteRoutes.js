const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { getCandidates } = require("../controllers/candidateController");
const { castVote, getVoteStatus, changeVote } = require("../controllers/voteController");
const router = express.Router();

// Voter CRUD operations
router.get("/candidates", protect, getCandidates);
router.post("/:id", protect, castVote)
router.get("/status", protect, getVoteStatus);
router.put("/:id", protect, changeVote);
module.exports = router;