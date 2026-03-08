import type { ReactNode } from "react";

// Reusable wrapper for authentication screens (login/register).
//
// Purpose:
// - Keep auth-page layout consistent
// - Avoid duplicating centered card markup
// - Provide standardized title + optional error region
type AuthCardProps = {
  title: string;
  error?: string;
  children: ReactNode;
};

export default function AuthCard({ title, error, children }: AuthCardProps) {
  return (
    // Full-screen container centers the auth card vertically + horizontally.
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      {/* Content card with constrained width for readable form layout. */}
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow">
        <h1 className="text-3xl font-bold text-center mb-6">{title}</h1>
        {/* Error slot is rendered only when the caller provides a message. */}
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {children}
      </div>
    </div>
  );
}
