import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import MicroCultureLogo from "./ui/MicroCultureLogo.jsx";

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkStyle = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ease-out ${
      isActive
        ? "text-white bg-white/10"
        : "text-neutral-400 hover:text-neutral-100 hover:bg-white/5"
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.07] bg-neutral-950/85 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center transition-opacity duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 rounded-lg"
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
                Create Culture
              </NavLink>
            </>
          )}
        </nav>

        {/* User Auth Section */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <NavLink
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 hover:text-white hover:border-neutral-700 hover:bg-neutral-800/80 transition-all duration-200"
              >
                <div className="w-5 h-5 rounded-full bg-violet-600/30 text-violet-300 font-semibold flex items-center justify-center text-[10px]">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="font-medium max-w-[120px] truncate">{user.name}</span>
              </NavLink>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="text-xs text-neutral-400 hover:text-white px-2 py-1.5 transition-colors duration-200 rounded"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-sm text-neutral-300 hover:text-white transition-colors duration-200 rounded"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-4 py-1.5 text-sm font-medium bg-white text-neutral-950 rounded-full hover:bg-neutral-100 active:scale-[0.97] transition-all duration-200 shadow-sm"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-neutral-400 hover:text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
        >
          <svg className="w-5 h-5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer — animated slide-down */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.07] bg-neutral-950/95 px-4 py-4 space-y-1 animate-slideDown">
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors duration-150"
          >
            Explore Communities
          </Link>
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors duration-150"
              >
                Dashboard
              </Link>
              <Link
                to="/create"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors duration-150"
              >
                Create Culture
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm text-neutral-300 hover:text-white hover:bg-white/5 transition-colors duration-150"
              >
                Profile ({user.name})
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate("/");
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-150"
              >
                Log out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 text-sm text-neutral-300 bg-neutral-900 border border-neutral-800 rounded-lg hover:bg-neutral-800 hover:text-white transition-all duration-150"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 text-sm font-medium text-neutral-950 bg-white rounded-lg hover:bg-neutral-100 active:scale-[0.98] transition-all duration-150"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
