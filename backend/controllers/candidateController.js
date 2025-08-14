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
// Function called by both Admin and Voters
exports.getCandidates = async (req, res) => {
    try {
        const { q = "", status = "", page = 1, limit = 10, sort = "-createdAt" } = req.query;
        const filter = {};

        if (!req.user?.isAdmin) {
            filter.status = "active"; // Voters only see active candidates
        }

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


        // Finding candidates with pagination and sorting
        const [items, total] = await Promise.all([
            Candidate.find(filter).sort(sort).skip(skip).limit(limitNum),
            Candidate.countDocuments(filter),
        ]);

        //Return the paginated response
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

// Function to get a single candidate by ID
exports.getCandidateById = async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id);
        if (!candidate) return res.status(404).json({ message: "Candidate not found" });
        return res.json(candidate);
    } catch (err) {
        console.error("getCandidateById error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Function to update a candidate by ID
const ALLOWED_FIELDS = ["name", "position", "manifesto", "photoUrl", "status"];

exports.updateCandidate = async (req, res) => {
    try {
        // Checking if a user is admin
        if (!req.user?.isAdmin) {
            return res.status(403).json({ message: "Not authorized as admin" });
        }

        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "Candidate id is required" });

        // Only allowed fields 
        const updates = {};
        for (const key of ALLOWED_FIELDS) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No valid fields to update" });
        }

        const updated = await Candidate.findByIdAndUpdate(id, updates, {
            new: true,            // Return updated doc
        });

        if (!updated) return res.status(404).json({ message: "Candidate not found" });

        res.json(updated);
    } catch (err) {
        console.error("updateCandidate error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Function to delete a candidate by ID
exports.deleteCandidate = async (req, res) => {
    try {
        // Checking if a user is admin
        if (!req.user?.isAdmin) {
            return res.status(403).json({ message: "Not authorized as admin" })
        }

        // Validating id
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "Candidate id is required" });

        // Checking if candidate exists and deleting
        const deleted = await Candidate.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: "Candidate not found" });
        res.json({ message: "Candidate deleted successfully" });

    }
    catch (err) {
        console.error("deleteCandidate error:", err);
        res.status(500).json({ message: "Server error" });
    }


}