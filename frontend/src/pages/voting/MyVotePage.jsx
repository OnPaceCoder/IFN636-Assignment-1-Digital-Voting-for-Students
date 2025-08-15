import React, { useEffect, useState } from "react";
import axiosInstance from "../../axiosConfig";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const MyVotePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [vote, setVote] = useState(null); // store vote details

    useEffect(() => {
        if (!user) navigate("/login");
    }, [user, navigate]);

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
                        <p className="mt-3">Manifesto: {vote.manifesto}</p>
                        <p className="mt-4 text-sm text-gray-500">
                            Voted on: {new Date(vote.when).toLocaleString()}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
};

export default MyVotePage;
