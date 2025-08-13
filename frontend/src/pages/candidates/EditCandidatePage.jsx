import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../axiosConfig";
import { useAuth } from "../../context/AuthContext";
import EditCandidateForm from "../../components/candidates/EditCandidateForm";

const EditCandidatePage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [candidate, setCandidate] = useState(null);

    // Check if user is admin
    useEffect(() => {
        if (!user) navigate("/login");
        else if (!user.isAdmin) navigate("/");
    }, [user, navigate]);

    // Fetch candidate
    useEffect(() => {
        const fetchOne = async () => {
            try {
                setLoading(true);
                setErr("");
                const token = user?.token;
                const { data } = await axiosInstance.get(`/api/candidate/${id}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                setCandidate(data);
            } catch (e) {
                setErr(e?.response?.data?.message || "Failed to load candidate");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchOne();
    }, [id, user]);

    // Integration of backend API for updating candidate
    const handleUpdate = async (payload) => {
        try {
            const token = user?.token;
            await axiosInstance.patch(`/api/candidate/${id}`, payload, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            alert("Candidate updated successfully!");
            navigate("/admin/candidates");
        } catch (e) {
            alert(e?.response?.data?.message || "Error updating candidate");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Candidate</h1>
                    <button
                        onClick={() => navigate("/list-candidates")}
                        className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        ← Back to Candidates
                    </button>
                </div>

                {/* Body */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    {loading ? (
                        <p className="text-gray-600">Loading…</p>
                    ) : err ? (
                        <p className="text-red-600">{err}</p>
                    ) : !candidate ? (
                        <p className="text-gray-600">Candidate not found.</p>
                    ) : (
                        <EditCandidateForm
                            initialValues={candidate}
                            onSubmit={handleUpdate}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditCandidatePage;
