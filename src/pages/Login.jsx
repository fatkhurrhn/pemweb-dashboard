// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const USERS = [
    { username: "xythur", password: "xythur" },
    { username: "iyan", password: "iyan" },
];

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    function handleSubmit(e) {
        e.preventDefault();
        const found = USERS.find(
            (u) => u.username === username && u.password === password
        );
        if (found) {
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("user", found.username);
            navigate("/dashboard");
        } else {
            setError("Username / Password salah");
        }
    }

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4">
            {/* Container utama */}
            <div className="w-full max-w-md">
                {/* Hero ringkas */}
                <section className="text-center mb-6">
                    <Link to="/"><span className="text-2xl font-bold">Login Admin</span></Link>
                    <p className="text-sm text-gray-600 mt-1">
                        Gunakan kredensial admin untuk mengakses halaman pengelolaan.
                    </p>
                </section>

                {/* Card form */}
                <main>
                    <form
                        onSubmit={handleSubmit}
                        className="p-5 rounded-2xl border bg-white shadow-sm space-y-4"
                    >
                        {/* Username */}
                        <div>
                            <label className="text-sm font-medium text-gray-800">Username</label>
                            <div className="mt-1 relative">
                                <i className="ri-user-3-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input
                                    type="text"
                                    placeholder="username"
                                    className="w-full border rounded-xl pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-600"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    autoFocus
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        {/* Password + toggle */}
                        <div>
                            <label className="text-sm font-medium text-gray-800">Password</label>
                            <div className="mt-1 relative">
                                <i className="ri-lock-2-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                <input
                                    type={showPw ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full border rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-600"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw((s) => !s)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-sky-600 p-1"
                                    aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
                                >
                                    <i className={`ri-eye${showPw ? "-off" : ""}-line`} />
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                                <i className="ri-error-warning-line"></i>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white py-2.5 rounded-xl font-semibold transition-colors"
                        >
                            <i className="ri-login-circle-line"></i> Login
                        </button>

                        {/* Footnote kecil */}
                        <div className="text-[11px] text-gray-500 text-center">
                            Akses dashboard memerlukan login. Halaman presensi & submit tugas tetap bebas login.
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
}
