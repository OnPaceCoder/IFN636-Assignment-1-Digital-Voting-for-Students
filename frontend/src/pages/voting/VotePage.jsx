import React, { useEffect, useState } from "react";
import axiosInstance from "../../axiosConfig";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const CandidateCard = ({ candidate, onVote }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-5 flex flex-col">
            <div className="flex items-center gap-4">
                <img
                    src={candidate.photoUrl || "https://picsum.photos/id/237/200/300"}
                    alt={candidate.name}
                    className="h-16 w-16 rounded-full object-cover border"
                />
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
                    <p className="text-sm text-gray-600">{candidate.position}</p>
                </div>
            </div>

            {candidate.manifesto && (
                <p className="mt-4 text-sm text-gray-700 line-clamp-3">{candidate.manifesto}</p>
            )}

            <div className="mt-5 flex items-center justify-between">

                <button
                    onClick={() => onVote(candidate)}
                    className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
                >
                    Vote
                </button>
            </div>
        </div>
    );
};

const VotePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [candidates, setCandidates] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [selected, setSelected] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Auth guard (voter-facing page: just require login)
    useEffect(() => {
        if (!user) navigate("/login");
    }, [user, navigate]);

    // Load active candidates for voting
    useEffect(() => {
        const fetchActive = async () => {
            try {
                setLoading(true);
                setErr("");
                const token = user?.token || localStorage.getItem("token");
                const { data } = await axiosInstance.get("/api/vote/candidates", {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                setCandidates(data.items || []);
            } catch (e) {
                setErr(e?.response?.data?.message || "Failed to load candidates");
            } finally {
                setLoading(false);
            }
        };
        fetchActive();
    }, [user]);

    // Open confirmation modal
    const openConfirm = (candidate) => {
        setSelected(candidate);
        setShowModal(true);
    };

    // Cast vote
    const submitVote = async () => {
        if (!selected) return;
        try {
            setSubmitting(true);
            const token = user?.token;
            await axiosInstance.post(`/api/vote/${selected._id}`, {}, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            alert("Your vote has been submitted. Thank you!");
            setShowModal(false);
            setSelected(null);
        } catch (e) {
            alert(e?.response?.data?.message || "Failed to submit your vote");
            setShowModal(false);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Vote for Your Candidate</h1>
                    <button
                        onClick={() => navigate("/")}
                        className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        ← Back
                    </button>
                </div>

                {/* Body */}
                {loading ? (
                    <div className="text-gray-600">Loading…</div>
                ) : err ? (
                    <div className="text-red-600">{err}</div>
                ) : candidates.length === 0 ? (
                    <div className="text-gray-600">No active candidates available.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {candidates.map((c) => (
                            <CandidateCard key={c._id} candidate={c} onVote={openConfirm} />
                        ))}
                    </div>
                )}
            </div>

            {/* Confirm Vote Modal */}
            {showModal && selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Confirm your vote</h2>
                        <p className="text-gray-700 mb-4">
                            You are about to vote for <span className="font-semibold">{selected.name}</span> (
                            {selected.position}). Do you want to proceed?
                        </p>

                        <div className="flex items-center gap-3 mb-6">
                            <img
                                src={selected.photoUrl || "https://picsum.photos/id/237/200/300"}
                                alt={selected.name}
                                className="h-16 w-16 rounded-full object-cover border"
                            />
                            <div>
                                <div className="font-medium">{selected.name}</div>
                                <div className="text-sm text-gray-600">{selected.position}</div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setShowModal(false); setSelected(null); }}
                                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitVote}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                                disabled={submitting}
                            >
                                {submitting ? "Submitting…" : "Confirm Vote"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VotePage;
