import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { initGA, trackPageView } from "./analytics.js";
import NavBar from "./components/NavBar.jsx";
import MobileBottomNav from "./components/MobileBottomNav.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Landing from "./pages/Landing.jsx";
import Explore from "./pages/Explore.jsx";
import CultureDetail from "./pages/CultureDetail.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import CreateCulture from "./pages/CreateCulture.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DailyRitualPage from "./pages/DailyRitualPage.jsx";
import CultureFeed from "./pages/CultureFeed.jsx";
import Profile from "./pages/Profile.jsx";

/** Wraps each page in a keyed div so the page-enter animation retriggers on navigation.
 *  Also fires a GA4 page_view on every route change. */
function PageTransition({ children }) {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <div key={location.pathname} className="page-enter">
      {children}
    </div>
  );
}

export default function App() {
  // Initialise GA4 once (no-op if VITE_GA_MEASUREMENT_ID is unset)
  useEffect(() => { initGA(); }, []);

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-x-hidden"
      style={{ background: "#FFFDF7", color: "#17172B" }}
    >
      {/* Soft ambient background blobs — warm pastels */}
      <div
        className="ambient-glow-orb w-[700px] h-[700px] -top-60 -left-60"
        style={{ background: "#FDE68A" }}
        aria-hidden="true"
      />
      <div
        className="ambient-glow-orb w-[500px] h-[500px] top-1/3 -right-40"
        style={{ background: "#DDD6FE" }}
        aria-hidden="true"
      />
      <div
        className="ambient-glow-orb w-[600px] h-[600px] -bottom-40 left-1/4"
        style={{ background: "#FCA5A5" }}
        aria-hidden="true"
      />

      <NavBar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8 relative z-10">
        <PageTransition>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/cultures/:id" element={<CultureDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreateCulture />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cultures/:id/ritual"
              element={
                <ProtectedRoute>
                  <DailyRitualPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cultures/:id/feed"
              element={
                <ProtectedRoute>
                  <CultureFeed />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </PageTransition>
      </main>

      <footer
        className="py-7 text-center text-xs relative z-10 mb-14 md:mb-0"
        style={{
          borderTop: "1.5px solid rgba(23,23,43,0.08)",
          color: "#687085",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
            <span style={{ fontWeight: 700, color: "#17172B" }}>Micro Culture</span>
            <span style={{ color: "#CBD5E1" }}>·</span>
            <span>Communities powered by shared interests &amp; AI activities</span>
          </div>
          <div className="text-center sm:text-right">
            Every activity shapes the community&apos;s memory
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
