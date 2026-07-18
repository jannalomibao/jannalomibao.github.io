import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/lib/useAdminAuth";

export default function AdminLogin() {
  const { session, loading, signIn } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already authenticated — no reason to see the login form again.
  if (!loading && session) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await signIn(email, password);
    setSubmitting(false);
    if (signInError) {
      setError(signInError);
    }
    // On success, the session update flows through AdminAuthContext and the
    // `session` check above redirects on the next render — no manual
    // navigate() needed here.
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-6 flex items-center gap-3">
          <span className="w-8 h-px bg-accent inline-block" />
          Admin
        </p>
        <h1 className="font-display text-4xl text-ink mb-8">Log in</h1>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm text-ink-soft mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-line focus:border-ink outline-none py-3 text-ink transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-ink-soft mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-line focus:border-ink outline-none py-3 text-ink transition-colors"
            />
          </div>

          {error && (
            <p role="alert" className="text-accent text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-ink text-paper px-6 py-3.5 rounded-full text-sm hover:bg-accent transition-colors disabled:opacity-60"
          >
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}
