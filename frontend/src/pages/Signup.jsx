import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import GlassPanel from "../components/ui/GlassPanel.jsx";
import GlowButton from "../components/ui/GlowButton.jsx";
import MicroCultureLogo from "../components/ui/MicroCultureLogo.jsx";

function WarmInput({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>
        {label}
      </label>
      <input
        className="form-input w-full px-4 py-3 rounded-2xl text-sm"
        style={{ background: "#fff", color: "#1A1A2E" }}
        {...props}
      />
    </div>
  );
}

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name || !email || !password) return;
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-4 sm:py-16 animate-fadeIn relative">
      {/* Decorative blobs */}
      <div
        className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full"
        style={{ background: "#DDD6FE", filter: "blur(60px)", opacity: 0.4 }}
        aria-hidden="true"
      />

      <GlassPanel className="p-6 sm:p-10 space-y-6 relative z-10">
        <div className="text-center space-y-2 flex flex-col items-center">
          <Link to="/" className="inline-block mb-1 hover:opacity-80 transition-opacity">
            <MicroCultureLogo size="lg" showWordmark={false} />
          </Link>
          <h1 className="text-2xl font-extrabold" style={{ color: "#1A1A2E" }}>
            Join Micro Culture 🎒
          </h1>
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            Create an account to join or start communities.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <WarmInput
            label="Your name"
            type="text"
            placeholder="e.g., Alex, Sam, Jordan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <WarmInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <WarmInput
            label="Password (min. 8 characters)"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />

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
            disabled={loading || !name || !email || !password}
            className="w-full mt-2 justify-center"
          >
            {loading ? "Creating account..." : "Create account"}
          </GlowButton>
        </form>

        <p
          className="text-center text-sm"
          style={{ borderTop: "1.5px solid rgba(26,26,46,0.08)", paddingTop: "16px", color: "#94A3B8" }}
        >
          Already have an account?{" "}
          <Link to="/login" className="font-bold transition-colors hover:opacity-80" style={{ color: "#7C3AED" }}>
            Log in
          </Link>
        </p>
      </GlassPanel>
    </div>
  );
}
