const Vote = require('../models/Vote');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
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

// Function to get the Vote status and details about candidate they voted for (Get - MyVote details / View Vote)
exports.getVoteStatus = async (req, res) => {
    const vote = await Vote.findOne({ voterId: req.user._id }).populate('candidateId');
    if (!vote) return res.json({ hasVoted: false, vote: null });

    res.json({
        hasVoted: true,
        vote: {
            _id: vote._id,
            candidateId: vote.candidateId?._id,
            candidateName: vote.candidateId?.name,
            position: vote.candidateId?.position,
            photoUrl: vote.candidateId?.photoUrl,
            manifesto: vote.candidateId?.manifesto,
            when: vote.createdAt
        }
    });
};


//Functin to change vote
exports.changeVote = async (req, res) => {
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

        // Checking if user has already voted
        const existingVote = await Vote.findOne({ voterId: req.user._id });
        if (!existingVote) {
            return res.status(400).json({ message: "You have not voted yet" });
        }

        // Decrementing the old candidate's vote count
        const oldCandidate = await Candidate.findById(existingVote.candidateId);
        if (oldCandidate) {
            oldCandidate.voteCount -= 1;
            await oldCandidate.save();
        }

        // Update the vote with new candidate
        existingVote.candidateId = candidate._id;
        await existingVote.save();

        // Incrementing the new candidate's vote count
        candidate.voteCount += 1;
        await candidate.save();

        res.status(200).json({
            message: "Vote changed successfully",
            vote: existingVote
        });
    } catch (error) {
        console.error("changeVote error:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

// Function to delte a vote
exports.deleteVote = async (req, res) => {
    try {
        // Checking if user has already voted
        const existingVote = await Vote.findOne({ voterId: req.user._id });
        if (!existingVote) {
            return res.status(400).json({ message: "You have not voted yet" });
        }

        // Decrementing the candidate's vote count
        const candidate = await Candidate.findById(existingVote.candidateId);
        if (candidate) {
            candidate.voteCount -= 1;
            await candidate.save();
        }

        // Deleting the vote
        await Vote.deleteOne({ _id: existingVote._id });

        res.status(200).json({ message: "Vote deleted successfully" });
    } catch (error) {
        console.error("deleteVote error:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}