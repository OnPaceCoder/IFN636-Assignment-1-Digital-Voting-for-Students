const Candidate = require('../models/Candidate');

const validStatuses = new Set(['active', 'withdrawn']);

exports.createCandidate = async (req, res) => {
    try {

        // Checking if a user is admin
        if (!req.user?.isAdmin) {
            return res.status(403).json({ message: "Not authorized as admin" });
        }

        const { name, position, manifesto = "", photoUrl = "", status = "active" } = req.body;

        // Validate required fields
        if (!name || !position) {
            return res.status(400).json({ message: "name and position are required" });
        }

        // Validate status
        if (!validStatuses.has(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        // Check if candidate already exists
        const userExists = await Candidate.findOne({ name: name.trim(), position: position.trim() });
        if (userExists) {
            return res.status(400).json({ message: 'Candidate already exists' });
        }

        // Create the candidate
        const candidate = await Candidate.create({
            name: name.trim(),
            position: position.trim(),
            manifesto: manifesto?.trim?.() || "",
            photoUrl: photoUrl?.trim?.() || "",
            status,
            // voteCount defaults to 0 from schema
        });

        return res.status(201).json(candidate);
    }
    catch (error) {
        console.error("createCandidate error:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });

    }

}