import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function MobileBottomNav() {
  const { user } = useAuth();

  const navItemClass = ({ isActive }) =>
    `flex flex-col items-center justify-center min-h-[48px] py-1 px-3 text-xs font-semibold transition-all duration-200 ${
      isActive
        ? "text-[#17172B] scale-105"
        : "text-[#687085] hover:text-[#17172B]"
    }`;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-2 py-1.5 flex items-center justify-around"
      style={{
        background: "rgba(255, 253, 247, 0.96)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1.5px solid rgba(23, 23, 43, 0.08)",
        boxShadow: "0 -4px 20px rgba(23, 23, 43, 0.04)",
      }}
      aria-label="Mobile navigation"
    >
      {/* Home */}
      <NavLink to={user ? "/dashboard" : "/"} className={navItemClass} end>
        <span className="text-lg leading-none mb-1">🏠</span>
        <span className="text-[11px] leading-tight">Home</span>
      </NavLink>

      {/* Communities */}
      <NavLink to="/explore" className={navItemClass}>
        <span className="text-lg leading-none mb-1">🔭</span>
        <span className="text-[11px] leading-tight">Communities</span>
      </NavLink>

      {/* Activity */}
      <NavLink
        to={user ? "/dashboard" : "/explore"}
        className={navItemClass}
      >
        <span className="text-lg leading-none mb-1">⚡</span>
        <span className="text-[11px] leading-tight">Activity</span>
      </NavLink>

      {/* Profile */}
      <NavLink
        to={user ? "/profile" : "/login"}
        className={navItemClass}
      >
        <span className="text-lg leading-none mb-1">
          {user ? "👤" : "🔑"}
        </span>
        <span className="text-[11px] leading-tight">Profile</span>
      </NavLink>
    </nav>
  );
}
