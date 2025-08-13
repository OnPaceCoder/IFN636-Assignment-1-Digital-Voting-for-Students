import React from "react";
import CandidateForm from "../../components/candidates/CandidateForm";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


const CreateCandidatePage = () => {

    const navigate = useNavigate();
    const { user } = useAuth();

    const handleCreateCandidate = async (formData) => {

    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="max-w-3xl mx-auto">
                {/* Page header */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Create Candidate
                    </h1>
                    <button
                        onClick={() => navigate("/candidates")}
                        className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        ← Back to Candidates
                    </button>
                </div>

                {/* Card container around the form to match your form’s card style */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <CandidateForm onSubmit={handleCreateCandidate} />
                </div>
            </div>
        </div>
    )
}

export default CreateCandidatePage

