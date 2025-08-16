// src/pages/LandingPage.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LandingPage = () => {
    const { user } = useAuth();

    const primaryHref = user ? "/add-vote" : "/login";
    const primaryLabel = user ? "Vote Now" : "Sign in to Vote";

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="relative">
                <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
                    <div className="grid items-center gap-10 md:grid-cols-2">
                        <div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                                Transparent, fast, and secure{" "}
                                <span className="text-blue-600">student voting</span>.
                            </h1>
                            <p className="mt-4 text-gray-600">
                                Cast your ballot online, view your vote, and stay confident your
                                voice is counted, built with a modern and secure technology.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link
                                    to={primaryHref}
                                    className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    {primaryLabel}
                                </Link>

                            </div>
                            {user?.isAdmin && (
                                <div className="mt-4">
                                    <Link
                                        to="/list-candidates"
                                        className="inline-flex items-center rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-black"
                                    >
                                        Admin Dashboard
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Side card */}
                        <div className="rounded-2xl bg-white shadow-md p-6 border">
                            <h3 className="text-lg font-semibold text-gray-900">Upcoming election</h3>
                            <p className="mt-1 text-sm text-gray-600">
                                Check candidates and their manifestos, then cast your vote securely.
                            </p>
                            <ul className="mt-4 space-y-2 text-sm text-gray-700">
                                <li>• One person, one vote</li>
                                <li>• Private & auditable</li>
                                <li>• Instant confirmation</li>
                            </ul>
                            <div className="mt-6">
                                <Link
                                    to="/"
                                    className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="bg-white border-t">
                <div className="mx-auto max-w-6xl px-4 py-12">
                    <h2 className="text-2xl font-bold text-gray-900">Why this system?</h2>
                    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-xl border bg-white p-5 shadow-sm">
                            <div className="text-2xl">🔒</div>
                            <h3 className="mt-2 font-semibold text-gray-900">Secure by design</h3>
                            <p className="mt-1 text-sm text-gray-600">
                                Authenticated access, server-side validation, and tamper-resistant counts.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-white p-5 shadow-sm">
                            <div className="text-2xl">⚡</div>
                            <h3 className="mt-2 font-semibold text-gray-900">Fast & reliable</h3>
                            <p className="mt-1 text-sm text-gray-600">
                                Optimised frontend and PM2-managed backend for smooth deploys.
                            </p>
                        </div>
                        <div className="rounded-xl border bg-white p-5 shadow-sm">
                            <div className="text-2xl">🧾</div>
                            <h3 className="mt-2 font-semibold text-gray-900">Transparent counts</h3>
                            <p className="mt-1 text-sm text-gray-600">
                                One user–one vote only; transparent audit for admins.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t">
                <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-500 flex items-center justify-between">
                    <span>© {new Date().getFullYear()} Digital Voting System</span>
                    <div className="flex gap-4">
                        <Link to="/privacy" className="hover:text-gray-700">Privacy</Link>
                        <Link to="/terms" className="hover:text-gray-700">Terms</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
