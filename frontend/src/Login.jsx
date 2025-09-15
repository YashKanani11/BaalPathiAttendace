import React, { useState } from "react";
const API_BASE = import.meta.env.VITE_API_BASE;

export default function Login({ setToken }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isSignup, setIsSignup] = useState(false);

    const handleSubmit = async () => {
        const endpoint = isSignup ? "signup" : "login";
        const res = await fetch(`${API_BASE}/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();

        if (res.ok) {
            if (isSignup) {
                alert("Signup successful! Please login now.");
                setIsSignup(false);
            } else if (data.token) {
                localStorage.setItem("token", data.token);
                setToken(data.token);
            }
        } else {
            alert(data.error || "Request failed");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="bg-white p-6 rounded shadow w-full max-w-sm">
                <h2 className="text-xl font-bold mb-4">
                    {isSignup ? "Sign Up" : "Login"}
                </h2>
                <input
                    className="w-full p-2 border rounded mb-2"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    className="w-full p-2 border rounded mb-4"
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    className="w-full bg-indigo-600 text-white p-2 rounded mb-2"
                    onClick={handleSubmit}
                >
                    {isSignup ? "Sign Up" : "Login"}
                </button>
                <button
                    className="w-full text-indigo-600 underline"
                    onClick={() => setIsSignup(!isSignup)}
                >
                    {isSignup
                        ? "Already have an account? Login"
                        : "New user? Sign Up"}
                </button>
            </div>
        </div>
    );
}
