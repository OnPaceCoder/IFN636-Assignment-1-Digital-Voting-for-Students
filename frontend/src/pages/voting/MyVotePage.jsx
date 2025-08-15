import React, { useEffect, useState } from "react";
import axiosInstance from "../../axiosConfig";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const MyVotePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [vote, setVote] = useState(null);

    // Change-vote UI states
    const [showChangeModal, setShowChangeModal] = useState(false);
    const [candidates, setCandidates] = useState([]);
    const [selected, setSelected] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Withdrawing state
    const [withdrawing, setWithdrawing] = useState(false);

    useEffect(() => {
        if (!user) navigate("/login");
    }, [user, navigate]);

    // Fetch user's vote status
    useEffect(() => {
        const fetchVote = async () => {
            try {
                setLoading(true);
                setError("");
                const token = user?.token;
                const { data } = await axiosInstance.get("/api/vote/status", {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });

                if (data?.hasVoted && data.vote) {
                    setVote(data.vote);
                } else {
                    setVote(null);
                }
            } catch (err) {
                setError(err?.response?.data?.message || "Failed to fetch your vote");
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchVote();
    }, [user]);

    // Change modal: fetch active candidates (excluding current) 
    const openChange = async () => {
        try {
            const token = user?.token;
            const { data } = await axiosInstance.get("/api/vote/candidates", {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const items = (data?.items || []).filter(c => c._id !== vote?.candidateId);
            setCandidates(items);
            setSelected(null);
            setShowChangeModal(true);
        } catch (e) {
            setError(e?.response?.data?.message || "Failed to load candidates");
        }
    };

    // Submit change vote
    const submitChange = async () => {
        if (!selected) return;
        try {
            setSubmitting(true);
            const token = user?.token;
            await axiosInstance.put(`/api/vote/${selected._id}`, {}, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            // Refresh status to show updated vote
            const { data } = await axiosInstance.get("/api/vote/status", {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (data?.hasVoted && data.vote) setVote(data.vote);
            setShowChangeModal(false);
        } catch (e) {
            setError(e?.response?.data?.message || "Failed to change your vote");
        } finally {
            setSubmitting(false);
        }
    };

    // Withdraw (delete) vote
    const withdrawVote = async () => {

    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="max-w-lg mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Vote</h1>
                    <button
                        onClick={() => navigate("/")}
                        className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        ← Back
                    </button>
                </div>

                {loading ? (
                    <div className="text-gray-600">Loading…</div>
                ) : error ? (
                    <div className="text-red-600">{error}</div>
                ) : !vote ? (
                    <div className="text-gray-600">You have not voted yet.</div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center gap-4">
                            <img
                                src={vote.photoUrl || "https://picsum.photos/id/237/200/300"}
                                alt={vote.candidateName}
                                className="h-16 w-16 rounded-full object-cover border"
                            />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{vote.candidateName}</h3>
                                <p className="text-sm text-gray-600">{vote.position}</p>
                            </div>
                        </div>
                        {vote.manifesto && (
                            <p className="mt-3">Manifesto: {vote.manifesto}</p>
                        )}
                        <p className="mt-4 text-sm text-gray-500">
                            Voted on: {new Date(vote.when).toLocaleString()}
                        </p>

                        {/* Actions */}
                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={openChange}
                                className="rounded-lg bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-700"
                            >
                                Change Vote
                            </button>
                            <button
                                onClick={withdrawVote}
                                disabled={withdrawing}
                                className="rounded-lg bg-red-600 text-white px-3 py-2 text-sm hover:bg-red-700 disabled:opacity-60"
                            >
                                {withdrawing ? "Withdrawing…" : "Withdraw Vote"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Change Vote Modal */}
            {showChangeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Change your vote</h2>
                        <p className="text-gray-700 mb-4">Select a different candidate:</p>

                        <div className="max-h-64 overflow-auto space-y-2">
                            {candidates.length === 0 ? (
                                <div className="text-sm text-gray-600">No other active candidates available.</div>
                            ) : candidates.map(c => (
                                <label
                                    key={c._id}
                                    className={`flex items-center gap-3 border rounded-lg p-3 cursor-pointer ${selected?._id === c._id ? "ring-2 ring-blue-500" : ""}`}
                                >
                                    <input
                                        type="radio"
                                        name="candidate"
                                        value={c._id}
                                        checked={selected?._id === c._id}
                                        onChange={() => setSelected(c)}
                                    />
                                    <img
                                        src={c.photoUrl || "https://picsum.photos/id/237/200/300"}
                                        alt={c.name}
                                        className="h-10 w-10 rounded-full object-cover border"
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium">{c.name}</span>
                                        <span className="text-xs text-gray-600">{c.position}</span>
                                    </div>
                                </label>
                            ))}
                        </div>

                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                onClick={() => { setShowChangeModal(false); setSelected(null); }}
                                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitChange}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                                disabled={!selected || submitting}
                            >
                                {submitting ? "Updating…" : "Confirm Change"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
};

export default MyVotePage;
