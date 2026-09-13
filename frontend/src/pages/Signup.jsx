import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import GlassPanel from "../components/ui/GlassPanel.jsx";
import GlowButton from "../components/ui/GlowButton.jsx";
import MicroCultureLogo from "../components/ui/MicroCultureLogo.jsx";

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
    <div className="max-w-md mx-auto py-8 sm:py-16 animate-fadeIn">
      <GlassPanel className="p-8 sm:p-10 border-white/10 shadow-2xl space-y-6">
        <div className="text-center space-y-2 flex flex-col items-center">
          <Link to="/" className="inline-block mb-1 hover:opacity-90 transition-opacity">
            <MicroCultureLogo size="lg" showWordmark={false} />
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
          <p className="text-xs text-neutral-400">
            Sign up to join or create communities on Micro Culture.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
              Your Name
            </label>
            <input
              type="text"
              placeholder="e.g., Alex, Sam, Jordan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-900/90 border border-neutral-700/80 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-900/90 border border-neutral-700/80 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
              Password (min. 8 characters)
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-900/90 border border-neutral-700/80 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
            />
          </div>

          {error && <p className="text-xs text-red-400 pt-1">{error}</p>}

          <GlowButton
            type="submit"
            variant="glow"
            size="lg"
            loading={loading}
            disabled={loading || !name || !email || !password}
            className="w-full mt-2"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </GlowButton>
        </form>

        <p className="text-center text-xs text-neutral-500 pt-2 border-t border-white/5">
          Already have an account?{" "}
          <Link to="/login" className="text-violet-400 hover:text-violet-300 underline font-medium">
            Log in
          </Link>
        </p>
      </GlassPanel>
    </div>
  );
}
