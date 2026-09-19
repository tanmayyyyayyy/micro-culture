import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import GlassPanel from "../components/ui/GlassPanel.jsx";
import GlowButton from "../components/ui/GlowButton.jsx";
import MicroCultureLogo from "../components/ui/MicroCultureLogo.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return;
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-4 sm:py-16 animate-fadeIn">
      {/* Decorative blobs */}
      <div
        className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full"
        style={{ background: "#FDE68A", filter: "blur(60px)", opacity: 0.4 }}
        aria-hidden="true"
      />

      <GlassPanel className="p-6 sm:p-10 space-y-6 relative z-10">
        <div className="text-center space-y-2 flex flex-col items-center">
          <Link to="/" className="inline-block mb-1 hover:opacity-80 transition-opacity">
            <MicroCultureLogo size="lg" showWordmark={false} />
          </Link>
          <h1 className="text-2xl font-extrabold" style={{ color: "#1A1A2E" }}>
            Welcome back 👋
          </h1>
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Log in to your communities.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-sm font-semibold mb-1.5"
              style={{ color: "#374151" }}
            >
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input w-full px-4 py-3 rounded-2xl text-sm"
              style={{ background: "#fff", color: "#1A1A2E" }}
            />
          </div>

          <div>
            <label
              className="block text-sm font-semibold mb-1.5"
              style={{ color: "#374151" }}
            >
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input w-full px-4 py-3 rounded-2xl text-sm"
              style={{ background: "#fff", color: "#1A1A2E" }}
            />
          </div>

          {error && (
            <p className="text-sm rounded-xl px-3 py-2" style={{ color: "#B91C1C", background: "#FEF2F2" }}>
              {error}
            </p>
          )}

          <GlowButton
            type="submit"
            variant="glow"
            size="lg"
            loading={loading}
            disabled={loading || !email || !password}
            className="w-full mt-2 justify-center"
          >
            {loading ? "Logging in..." : "Log in"}
          </GlowButton>
        </form>

        <p
          className="text-center text-sm pt-1"
          style={{ borderTop: "1.5px solid rgba(26,26,46,0.08)", paddingTop: "16px", color: "#94A3B8" }}
        >
          New to Micro Culture?{" "}
          <Link to="/signup" className="font-bold transition-colors hover:opacity-80" style={{ color: "#7C3AED" }}>
            Create an account
          </Link>
        </p>
      </GlassPanel>
    </div>
  );
}
