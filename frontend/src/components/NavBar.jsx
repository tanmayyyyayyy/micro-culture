import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import MicroCultureLogo from "./ui/MicroCultureLogo.jsx";

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkStyle = ({ isActive }) =>
    `px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ease-out ${
      isActive
        ? "bg-[#1A1A2E] text-white shadow-sm"
        : "text-[#4B5563] hover:text-[#1A1A2E] hover:bg-[rgba(26,26,46,0.06)]"
    }`;

  return (
    <header
      className="sticky top-0 z-40 w-full"
      style={{
        background: "rgba(255,253,247,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1.5px solid rgba(26,26,46,0.08)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 rounded-lg"
          aria-label="Micro Culture — home"
        >
          <MicroCultureLogo size="md" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Primary navigation">
          <NavLink to="/explore" className={navLinkStyle}>
            Explore
          </NavLink>
          {user && (
            <>
              <NavLink to="/dashboard" className={navLinkStyle}>
                Dashboard
              </NavLink>
              <NavLink to="/create" className={navLinkStyle}>
                Create
              </NavLink>
            </>
          )}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-2.5">
              <NavLink
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold text-[#17172B] hover:bg-[rgba(23,23,43,0.06)] transition-all duration-200"
                style={{ border: "1.5px solid rgba(23,23,43,0.12)" }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                  style={{ background: "#7C3AED" }}
                >
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="max-w-[100px] truncate">{user.name?.split(" ")[0]}</span>
              </NavLink>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="text-sm text-[#687085] hover:text-[#17172B] px-2 py-1.5 transition-colors duration-200 rounded font-medium"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-1.5 text-sm font-semibold text-[#687085] hover:text-[#17172B] transition-colors duration-200 rounded-full"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2 text-sm font-semibold text-white rounded-full hover:opacity-90 active:scale-[0.97] transition-all duration-200 shadow-sm"
                style={{ background: "#17172B" }}
              >
                Create account
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#4B5563] hover:text-[#1A1A2E] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-xl"
          style={{ background: mobileMenuOpen ? "rgba(26,26,46,0.06)" : "transparent" }}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden px-4 py-4 space-y-1 animate-slideDown"
          style={{
            borderTop: "1.5px solid rgba(26,26,46,0.08)",
            background: "rgba(255,253,247,0.98)",
          }}
        >
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-3 rounded-2xl text-sm font-semibold text-[#4B5563] hover:text-[#1A1A2E] hover:bg-[rgba(26,26,46,0.05)] transition-colors duration-150"
          >
            🔭 Explore Communities
          </Link>
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-2xl text-sm font-semibold text-[#4B5563] hover:text-[#1A1A2E] hover:bg-[rgba(26,26,46,0.05)] transition-colors duration-150"
              >
                🏠 Home
              </Link>
              <Link
                to="/create"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-2xl text-sm font-semibold text-[#4B5563] hover:text-[#1A1A2E] hover:bg-[rgba(26,26,46,0.05)] transition-colors duration-150"
              >
                ✨ Create Community
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-2xl text-sm font-semibold text-[#4B5563] hover:text-[#1A1A2E] hover:bg-[rgba(26,26,46,0.05)] transition-colors duration-150"
              >
                👤 Profile — {user.name}
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate("/");
                }}
                className="w-full text-left px-4 py-3 rounded-2xl text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-150"
              >
                Log out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-3 min-h-[48px] flex items-center justify-center text-sm font-semibold text-[#1A1A2E] bg-white rounded-2xl hover:bg-neutral-50 transition-all duration-150"
                style={{ border: "1.5px solid rgba(26,26,46,0.12)" }}
              >
                Log in
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-3 min-h-[48px] flex items-center justify-center text-sm font-semibold text-white rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all duration-150"
                style={{ background: "#1A1A2E" }}
              >
                Sign up free
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
