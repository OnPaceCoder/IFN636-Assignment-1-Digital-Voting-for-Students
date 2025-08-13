import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosConfig";
import { useAuth } from "../../context/AuthContext";

const AdminCandidatesList = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [q, setQ] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });

    // Check if user is admin
    useEffect(() => {
        if (!user) navigate("/login");
        else if (!user.isAdmin) navigate("/");
    }, [user, navigate]);

    const query = useMemo(() => ({ q, status, page, limit }), [q, status, page, limit]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setErr("");
                const token = user?.token;
                const params = new URLSearchParams();
                if (q) params.append("q", q);
                if (status) params.append("status", status);
                params.append("page", page);
                params.append("limit", limit);

                const res = await axiosInstance.get(`/api/candidate?${params.toString()}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                setData(res.data);
            } catch (e) {
                setErr(e?.response?.data?.message || "Failed to load candidates");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [query, user]);

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Candidates</h1>
                    <button
                        onClick={() => navigate("/create-candidate")}
                        className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
                    >
                        + New Candidate
                    </button>
                </div>

                {/* Filters */}
                <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                        value={q}
                        onChange={(e) => { setPage(1); setQ(e.target.value); }}
                        placeholder="Search by name or position"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:border-blue-500"
                    />
                    <select
                        value={status}
                        onChange={(e) => { setPage(1); setStatus(e.target.value); }}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:border-blue-500"
                    >
                        <option value="">All statuses</option>
                        <option value="active">Active</option>
                        <option value="withdrawn">Withdrawn</option>
                    </select>
                </div>

                {/* Table */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Position</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Votes</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td className="px-4 py-6 text-gray-500" colSpan={5}>Loading…</td></tr>
                                ) : err ? (
                                    <tr><td className="px-4 py-6 text-red-600" colSpan={5}>{err}</td></tr>
                                ) : data.items.length === 0 ? (
                                    <tr><td className="px-4 py-6 text-gray-500" colSpan={5}>No candidates found.</td></tr>
                                ) : (
                                    data.items.map((c) => (
                                        <tr key={c._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                                            <td className="px-4 py-3 text-gray-700">{c.position}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${c.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
                                                    }`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-700">{c.voteCount ?? 0}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="inline-flex gap-2">
                                                    <button
                                                        onClick={() => navigate(`/update-candidate/${c._id}/edit`)}
                                                        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/admin/candidates/${c._id}`)}
                                                        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                        <p className="text-sm text-gray-600">
                            Page {data.page || 1} of {data.pages || 1} • Total {data.total || 0}
                        </p>
                        <div className="inline-flex gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 disabled:opacity-50 hover:bg-gray-50"
                            >
                                Prev
                            </button>
                            <button
                                disabled={data.pages && page >= data.pages}
                                onClick={() => setPage((p) => p + 1)}
                                className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 disabled:opacity-50 hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminCandidatesList;
