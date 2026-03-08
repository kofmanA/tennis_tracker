import { useState, useContext, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import AuthCard from "../components/AuthCard";

// Login page handles existing-user authentication.
// It exchanges username/password for a JWT and stores it via AuthContext.
export default function LoginPage() {
  // Access auth actions (login) and client-side navigation.
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  // Form state.
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // UI error state for failed login attempts.
  const [error, setError] = useState("");

  // Defensive guard: this page must always render under AuthProvider.
  if (!auth) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { login } = auth;

  // Submits credentials to backend and, on success,
  // persists token then redirects to authenticated home.
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      // Backend contract supports /auth/login with username/password payload.
      const res = await api.post("/auth/login", { username, password });

      // Support common token field names from different backend shapes.
      const token = res.data?.token ?? res.data?.jwt ?? res.data?.accessToken;

      if (!token) {
        throw new Error("No token returned from /auth/login");
      }

      // Persist auth and navigate to sessions home.
      login(token);
      navigate("/");
    } catch (err) {
      console.error(err);
      // Keep user-facing error generic and actionable.
      setError("Login failed. Check credentials and API URL.");
    }
  };

  return (
    <AuthCard title="Login" error={error}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="block w-full border border-gray-300 p-2 rounded"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="block w-full border border-gray-300 p-2 rounded"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Login
        </button>

        {/* Secondary action for users without an account. */}
        <button
            type="button"
            onClick={() => {
              navigate("/register", { replace: true });
            }}
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Register
          </button>
      </form>
    </AuthCard>
  );
}
