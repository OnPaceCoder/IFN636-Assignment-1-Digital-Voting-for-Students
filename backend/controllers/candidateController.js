const Candidate = require('../models/Candidate');

const validStatuses = new Set(['active', 'withdrawn']);
// Function to create a new candidate
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
// Function to get all candidates with pagination and filtering
exports.getCandidates = async (req, res) => {
    try {
        const { q = "", status = "", page = 1, limit = 10, sort = "-createdAt" } = req.query;


        const filter = {};
        if (q) {
            filter.$or = [
                { name: { $regex: q, $options: "i" } },
                { position: { $regex: q, $options: "i" } },
            ];
        }
        if (status) {
            filter.status = status; // "active" | "withdrawn"
        }

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 5);
        const skip = (pageNum - 1) * limitNum;


        // Find candidates with pagination and sorting
        const [items, total] = await Promise.all([
            Candidate.find(filter).sort(sort).skip(skip).limit(limitNum),
            Candidate.countDocuments(filter),
        ]);

        //return the paginated response
        return res.status(200).json({
            items,
            total: total,
            page: pageNum,
            pages: Math.ceil(total / limitNum)
        });
    } catch (error) {
        console.error("getCandidates error:", error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}