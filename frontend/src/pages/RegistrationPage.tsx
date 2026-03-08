import { useState, useContext, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import AuthCard from "../components/AuthCard";

// Expected backend validation/error envelope for registration failures.
type RegisterErrorResponse = {
  message?: string;
  title?: string;
  errors?: Record<string, string[]>;
};

// Converts various backend/network error shapes into one readable message.
function getRegisterErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const responseError = err as {
      response?: { data?: RegisterErrorResponse };
    };
    const data = responseError.response?.data;

    if (data?.message) {
      return data.message;
    }

    const validationMessages = data?.errors
      ? Object.values(data.errors).flat().join(" ")
      : "";
    if (validationMessages) {
      return validationMessages;
    }

    if (data?.title) {
      return data.title;
    }

    return "Registration failed.";
  }

  if (typeof err === "object" && err !== null && "request" in err) {
    return "Network error: backend unreachable or blocked by CORS.";
  }

  if (err instanceof Error) {
    return err.message;
  }

  return "Registration failed.";
}

// Registration page creates a new account and, if token is returned,
// logs the user in immediately.
export default function RegistrationPage() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  // Provider guard for reliability in development.
  if (!auth) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { login } = auth;

  // Form state for required registration payload.
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [ntrpLevel, setNtrpLevel] = useState("");
  const [location, setLocation] = useState("");

  // Error text shown at top of card when submit fails.
  const [error, setError] = useState("");

  // Sends registration payload, then routes user based on backend response:
  // - token returned -> log in and go home
  // - no token -> route to login
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/register", {
        username,
        password,
        ntrpLevel,
        location,
      });

      const token = res.data?.token ?? res.data?.jwt ?? res.data?.accessToken;
      if (token) {
        // Auto-login path for backends that issue token on register.
        login(token);
        navigate("/");
        return;
      }

      // Fallback path if backend requires manual login after registration.
      navigate("/login");
    } catch (err: unknown) {
      setError(getRegisterErrorMessage(err));
    }
  };

  return (
    <AuthCard title="Create an Account" error={error}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="block w-full border border-gray-300 p-2 rounded"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="block w-full border border-gray-300 p-2 rounded"
          placeholder="Choose a password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          className="block w-full border border-gray-300 p-2 rounded"
          placeholder="NTRP Level (e.g. 3.5)"
          value={ntrpLevel}
          onChange={(e) => setNtrpLevel(e.target.value)}
        />

        <input
          className="block w-full border border-gray-300 p-2 rounded"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Register
        </button>
      </form>
    </AuthCard>
  );
}
