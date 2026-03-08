import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

// Error shape used by sessions endpoints.
type SessionApiErrorResponse = {
  error?: string;
  message?: string;
  title?: string;
  errors?: Record<string, string[]>;
};

// Session model used by the sessions list UI.
type Session = {
  id: number;
  date: string;
  durationMinutes: number;
  location: string;
  partnerUserId: number;
  partnerUsername: string;
  notes: string;
};

// Converts backend/network failures into a single display string.
function getSessionApiErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const responseError = err as {
      response?: { data?: SessionApiErrorResponse };
    };
    const data = responseError.response?.data;

    if (data?.error) {
      return data.error;
    }

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

    return "Could not load sessions.";
  }

  if (typeof err === "object" && err !== null && "request" in err) {
    return "Network error: backend unreachable or blocked by CORS.";
  }

  if (err instanceof Error) {
    return err.message;
  }

  return "Could not load sessions.";
}

// Authenticated home page:
// - loads the current user's sessions
// - shows loading/empty/error states
// - offers create-session (+) and logout actions
export default function SessionsPage() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  // Guard to ensure context is mounted.
  if (!auth) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { token, logout } = auth;

  // Local UI state for fetched data and status.
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // If user is logged out, redirect immediately.
    if (!token) {
      navigate("/login");
      return;
    }

    // Cancellation flag prevents setting state on unmounted component.
    let isCancelled = false;

    // Fetch session list from backend.
    const loadSessions = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await api.get<Session[]>("/sessions");
        if (!isCancelled) {
          setSessions(response.data);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          setError(getSessionApiErrorMessage(err));
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    // Kick off initial load when token becomes available.
    loadSessions();

    return () => {
      isCancelled = true;
    };
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto w-full max-w-3xl rounded-xl bg-white p-6 shadow">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Your Sessions</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/sessions/new")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-2xl leading-none text-white hover:bg-blue-700"
              aria-label="Create session"
              title="Create session"
            >
              +
            </button>

            <button
              type="button"
              onClick={() => {
                // Clear auth state and route to login page.
                logout();
                navigate("/login", { replace: true });
              }}
              className="rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {isLoading && <p className="text-sm text-gray-600">Loading sessions...</p>}

        {!isLoading && sessions.length === 0 && !error && (
          <p className="text-sm text-gray-600">
            No sessions yet. Click the + button to create your first session.
          </p>
        )}

        {!isLoading && sessions.length > 0 && (
          <ul className="space-y-3">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="rounded border border-gray-200 bg-white p-4"
              >
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">Date:</span>{" "}
                  {new Date(session.date).toLocaleString()}
                </p>
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">Duration:</span>{" "}
                  {session.durationMinutes} minutes
                </p>
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">Location:</span> {session.location}
                </p>
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">Partner:</span>{" "}
                  {session.partnerUsername || `User #${session.partnerUserId}`}
                </p>
                {session.notes && (
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">Notes:</span> {session.notes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
