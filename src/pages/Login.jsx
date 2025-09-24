import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const USERS = [
    { username: "xythur", password: "xythur" },
    { username: "iyan", password: "iyan" },
];

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    function handleSubmit(e) {
        e.preventDefault();
        const found = USERS.find(
            (u) => u.username === username && u.password === password
        );
        if (found) {
            // simpan login ke localStorage
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("user", found.username);
            navigate("/dashboard"); // redirect
        } else {
            setError("Username / Password salah");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <form
                onSubmit={handleSubmit}
                className="p-6 bg-white shadow rounded w-full max-w-sm space-y-4"
            >
                <h1 className="text-xl font-bold">Login</h1>
                <input
                    type="text"
                    placeholder="Username"
                    className="border rounded w-full p-2"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="border rounded w-full p-2"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {error && <div className="text-red-600 text-sm">{error}</div>}
                <button
                    type="submit"
                    className="w-full bg-black text-white p-2 rounded"
                >
                    Login
                </button>
            </form>
        </div>
    );
}
