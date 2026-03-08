import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SessionsPage from "./pages/SessionsPage";
import RegistrationPage from "./pages/RegistrationPage";
import CreateSessionPage from "./pages/CreateSessionPage";

// Central route table for the frontend application.
//
// Route intent:
// - /register      -> account creation
// - /login         -> sign-in
// - /              -> authenticated home (sessions list)
// - /sessions/new  -> form to create a new session
export default function App() {
  return (
    <BrowserRouter>
      {/*
        Routes are intentionally flat and small for this MVP.
        As the app grows, this can be refactored into nested route groups
        with a shared authenticated layout component.
      */}
      <Routes>
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<SessionsPage />} />
        <Route path="/sessions/new" element={<CreateSessionPage />} />
      </Routes>
    </BrowserRouter>
  );
}

