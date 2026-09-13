import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
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

export default function App() {
  return (
    <div className="min-h-screen bg-[#090a0f] text-neutral-100 flex flex-col relative overflow-x-hidden selection:bg-violet-500/30 selection:text-violet-200">
      {/* Ambient background glow orbs */}
      <div
        className="ambient-glow-orb w-[600px] h-[600px] -top-40 -left-40 bg-violet-600/15"
        aria-hidden="true"
      />
      <div
        className="ambient-glow-orb w-[500px] h-[500px] top-1/3 -right-40 bg-indigo-600/10"
        aria-hidden="true"
      />
      <div
        className="ambient-glow-orb w-[700px] h-[700px] -bottom-40 left-1/4 bg-fuchsia-600/10"
        aria-hidden="true"
      />

      <NavBar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 relative z-10">
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
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-neutral-500 relative z-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-400">Micro Culture</span>
            <span>·</span>
            <span>Living communities powered by community memory & AI activities</span>
          </div>
          <div className="text-neutral-500">
            Every daily activity helps shape the community&apos;s future
          </div>
        </div>
      </footer>
    </div>
  );
}
