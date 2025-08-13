import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        position: { type: String, required: true, trim: true }, // e.g. President, International Officer etc.
        manifesto: { type: String, trim: true },
        photoUrl: { type: String, trim: true },
        status: { type: String, enum: ["active", "withdrawn"], default: "active" },
        voteCount: { type: Number, default: 0 }
    },
    { timestamps: true }
);


export default mongoose.model("Candidate", candidateSchema);
