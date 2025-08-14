const Vote = require('../models/Vote');
const Candidate = require('../models/Candidate');

// Function to cast a vote for a candidate
exports.castVote = async (req, res) => {
    try {
        const { id } = req.params;

        // Validating id 
        if (!id) {
            return res.status(400).json({ message: "Candidate ID is required" });
        }

        // Checking if candidate exists and is active
        const candidate = await Candidate.findById(id);
        if (!candidate || candidate.status !== 'active') {
            return res.status(404).json({ message: "Candidate not found or not active" });
        }

        // Checking if user has already voted or not
        const existingVote = await Vote.findOne({ voterId: req.user._id });
        if (existingVote) {
            return res.status(400).json({ message: "You have already voted" });
        }

        // Create the vote
        const vote = await Vote.create({
            voterId: req.user._id,
            candidateId: candidate._id,
        });

        // Incrementing the candidate's vote count
        candidate.voteCount += 1;
        await candidate.save();

        return res.status(201).json(vote);
    } catch (error) {
        console.error("castVote error:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}