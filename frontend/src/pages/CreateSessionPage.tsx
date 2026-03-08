import { useContext, useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

// Error shape potentially returned by session endpoints.
type SessionErrorResponse = {
  error?: string;
  message?: string;
  title?: string;
  errors?: Record<string, string[]>;
};

// Normalizes backend/network errors into one user-facing message string.
function getSessionErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const responseError = err as {
      response?: { data?: SessionErrorResponse };
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

    return "Could not create session.";
  }

  if (typeof err === "object" && err !== null && "request" in err) {
    return "Network error: backend unreachable or blocked by CORS.";
  }

  if (err instanceof Error) {
    return err.message;
  }

  return "Could not create session.";
}

// Dedicated page for creating a new tennis session.
// Includes partner-username autocomplete and submit validation.
export default function CreateSessionPage() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  // Ensure context availability.
  if (!auth) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { token, logout } = auth;

  const now = new Date();
  const initialDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  // Form fields.
  const [date, setDate] = useState(initialDate);
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [location, setLocation] = useState("");
  const [partnerUsername, setPartnerUsername] = useState("");

  // Autocomplete state for partner username search.
  const [partnerSuggestions, setPartnerSuggestions] = useState<string[]>([]);
  const [isSearchingPartners, setIsSearchingPartners] = useState(false);
  const [showPartnerSuggestions, setShowPartnerSuggestions] = useState(false);

  // Additional form/UI state.
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs help us detect clicks outside the suggestions container.
  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  const partnerInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Do not query suggestions without a valid auth token.
    if (!token) {
      return;
    }

    const query = partnerUsername.trim();

    // Empty input -> clear suggestions and skip API call.
    if (!query) {
      setPartnerSuggestions([]);
      setIsSearchingPartners(false);
      return;
    }

    // Cancellation + debounce prevent excessive requests and stale updates.
    let isCancelled = false;
    const timeoutId = window.setTimeout(async () => {
      setIsSearchingPartners(true);
      try {
        // Query backend username search endpoint.
        const response = await api.get<string[]>("/sessions/partners", {
          params: { query },
        });
        if (!isCancelled) {
          setPartnerSuggestions(response.data);
        }
      } catch {
        if (!isCancelled) {
          setPartnerSuggestions([]);
        }
      } finally {
        if (!isCancelled) {
          setIsSearchingPartners(false);
        }
      }
    }, 250);

    // Cleanup when user keeps typing or component unmounts.
    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [partnerUsername, token]);

  useEffect(() => {
    // Close dropdown when clicking outside the input/suggestion panel.
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedSuggestions = suggestionsRef.current?.contains(target);
      const clickedInput = partnerInputRef.current?.contains(target);

      if (!clickedSuggestions && !clickedInput) {
        setShowPartnerSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, []);

  // Validates input and sends create-session request to backend.
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // If token is missing, force login.
    if (!token) {
      navigate("/login");
      return;
    }

    const parsedDuration = Number.parseInt(durationMinutes, 10);

    // Basic client-side validation for duration.
    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
      setError("Duration must be a positive number of minutes.");
      return;
    }

    const trimmedPartnerUsername = partnerUsername.trim();

    // Partner username is required to map session to another user.
    if (!trimmedPartnerUsername) {
      setError("Partner username is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create session using backend DTO contract.
      await api.post("/sessions", {
        date,
        durationMinutes: parsedDuration,
        location,
        partnerUsername: trimmedPartnerUsername,
        notes,
      });

      // On success, return user to sessions home/list page.
      navigate("/");
    } catch (err: unknown) {
      setError(getSessionErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto w-full max-w-xl rounded-xl bg-white p-6 shadow">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Create Session</h1>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
            className="rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-700">Date & Time</label>
            <input
              type="datetime-local"
              className="block w-full rounded border border-gray-300 p-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-700">Duration (minutes)</label>
            <input
              type="number"
              min={1}
              className="block w-full rounded border border-gray-300 p-2"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-700">Location</label>
            <input
              className="block w-full rounded border border-gray-300 p-2"
              placeholder="Court name or club"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-700">Partner Username</label>
            <input
              ref={partnerInputRef}
              className="block w-full rounded border border-gray-300 p-2"
              placeholder="e.g. player420"
              value={partnerUsername}
              onChange={(e) => {
                // Update typed value and open autocomplete panel.
                setPartnerUsername(e.target.value);
                setShowPartnerSuggestions(true);
              }}
              onFocus={() => setShowPartnerSuggestions(true)}
              autoComplete="off"
              required
            />
            {showPartnerSuggestions && partnerUsername.trim() && (
              <div
                ref={suggestionsRef}
                className="mt-1 max-h-48 overflow-auto rounded border border-gray-300 bg-white shadow"
              >
                {isSearchingPartners && (
                  <p className="px-3 py-2 text-sm text-gray-500">Searching users...</p>
                )}

                {!isSearchingPartners && partnerSuggestions.length === 0 && (
                  <p className="px-3 py-2 text-sm text-gray-500">No matching users</p>
                )}

                {!isSearchingPartners &&
                  partnerSuggestions.map((username) => (
                    <button
                      key={username}
                      type="button"
                      onClick={() => {
                        // Selecting suggestion fills input and closes panel.
                        setPartnerUsername(username);
                        setShowPartnerSuggestions(false);
                      }}
                      className="block w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100"
                    >
                      {username}
                    </button>
                  ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-700">Notes</label>
            <textarea
              className="block w-full rounded border border-gray-300 p-2"
              rows={3}
              placeholder="Optional notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting ? "Creating..." : "Create Session"}
          </button>
        </form>
      </div>
    </div>
  );
}
