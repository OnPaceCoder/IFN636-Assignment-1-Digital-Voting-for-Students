import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
    {
        voterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate", required: true },
    },
    { timestamps: true }
);

export default mongoose.model("Vote", voteSchema);
