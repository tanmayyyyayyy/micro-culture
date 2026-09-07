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
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <NavBar />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/cultures/:id" element={<CultureDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/create" element={<ProtectedRoute><CreateCulture /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/cultures/:id/ritual" element={<ProtectedRoute><DailyRitualPage /></ProtectedRoute>} />
          <Route path="/cultures/:id/feed" element={<ProtectedRoute><CultureFeed /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}
