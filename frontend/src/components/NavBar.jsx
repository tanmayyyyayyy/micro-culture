import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
      <Link to="/" className="font-semibold tracking-tight">Micro Culture</Link>
      <div className="flex items-center gap-4 text-sm">
        <Link to="/explore">Explore</Link>
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/create">Create</Link>
            <Link to="/profile">Profile</Link>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="text-neutral-400 hover:text-neutral-200"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/signup" className="px-3 py-1 bg-white text-black rounded-full">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
