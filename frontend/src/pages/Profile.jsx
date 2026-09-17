import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import GlassPanel from "../components/ui/GlassPanel.jsx";
import GlowButton from "../components/ui/GlowButton.jsx";
import CultureEmblem from "../components/ui/CultureEmblem.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";

export default function Profile() {
  const { logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProfile() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/auth/me");
      setProfileData(data.user);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load live profile data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16">
        <LoadingState message="Fetching your cultural footprint..." />
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="max-w-md mx-auto py-12">
        <ErrorState message={error} onRetry={loadProfile} />
      </div>
    );
  }

  const initial = profileData?.name?.[0]?.toUpperCase() || "U";
  const joinedList = Array.isArray(profileData?.joinedCultures) ? profileData.joinedCultures : [];
  const createdList = Array.isArray(profileData?.createdCultures) ? profileData.createdCultures : [];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      {/* Profile Header Card */}
      <GlassPanel className="warm-card p-5 sm:p-8 relative overflow-hidden border border-neutral-200/80 shadow-sm bg-white rounded-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-neutral-900 text-white text-xl sm:text-2xl font-extrabold flex items-center justify-center shadow-md shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight truncate">
                {profileData?.name}
              </h1>
              <p className="text-xs text-neutral-500 mt-0.5 truncate">{profileData?.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified Member
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <GlowButton size="sm" variant="secondary" onClick={loadProfile} className="min-h-[38px] justify-center">
              ↻ Refresh Live Data
            </GlowButton>
            <GlowButton size="sm" variant="danger" onClick={logout} className="min-h-[38px] justify-center">
              Log out
            </GlowButton>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-6 pt-6 border-t border-neutral-100">
          <div className="p-3 sm:p-4 rounded-2xl bg-[#F9FAFB] border border-neutral-200/80 text-center">
            <div className="text-xl sm:text-2xl font-extrabold text-neutral-900">
              {joinedList.length}
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-neutral-500 uppercase tracking-wider mt-1 break-words">
              Communities Joined
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-[#F9FAFB] border border-neutral-200/80 text-center">
            <div className="text-xl sm:text-2xl font-extrabold text-violet-700">
              {createdList.length}
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-neutral-500 uppercase tracking-wider mt-1">
              Founded
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-[#F9FAFB] border border-neutral-200/80 text-center">
            <div className="text-xl sm:text-2xl font-extrabold text-amber-700">
              {profileData?.logsCount ?? 0}
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-neutral-500 uppercase tracking-wider mt-1 break-words">
              Activities Completed
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Communities Founded */}
      <GlassPanel className="warm-card p-5 sm:p-6 space-y-4 bg-white border border-neutral-200/80 shadow-sm rounded-3xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-2">
          <span>🏛️</span> Communities Founded by You ({createdList.length})
        </h2>
        {createdList.length === 0 ? (
          <p className="text-xs text-neutral-500 py-3">
            You have not founded any communities yet.{" "}
            <Link to="/create" className="text-violet-700 font-bold hover:underline">
              Start one now
            </Link>.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {createdList.map((c) => {
              const cultureId = typeof c === "object" ? c._id : c;
              const cultureName = typeof c === "object" ? c.name : "Culture";
              const symbol = typeof c === "object" ? c.symbol : "✨";
              return (
                <Link
                  key={cultureId}
                  to={`/cultures/${cultureId}`}
                  className="p-3.5 rounded-2xl bg-[#F9FAFB] border border-neutral-200/80 hover:border-neutral-300 hover:bg-white transition-all flex items-center gap-3 min-h-[44px]"
                >
                  <CultureEmblem symbol={symbol} size="sm" />
                  <div className="truncate">
                    <p className="text-sm font-bold text-neutral-900 truncate">{cultureName}</p>
                    <p className="text-[10px] text-neutral-500 font-semibold">Founder</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </GlassPanel>

      {/* Communities Joined */}
      <GlassPanel className="warm-card p-5 sm:p-6 space-y-4 bg-white border border-neutral-200/80 shadow-sm rounded-3xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-2">
          <span>✨</span> All Joined Communities ({joinedList.length})
        </h2>
        {joinedList.length === 0 ? (
          <p className="text-xs text-neutral-500 py-3">
            You haven&apos;t joined any communities yet.{" "}
            <Link to="/explore" className="text-violet-700 font-bold hover:underline">
              Explore communities
            </Link>.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {joinedList.map((c) => {
              const cultureId = typeof c === "object" ? c._id : c;
              const cultureName = typeof c === "object" ? c.name : "Culture";
              const symbol = typeof c === "object" ? c.symbol : "✨";
              return (
                <Link
                  key={cultureId}
                  to={`/cultures/${cultureId}`}
                  className="p-3.5 rounded-2xl bg-[#F9FAFB] border border-neutral-200/80 hover:border-neutral-300 hover:bg-white transition-all flex items-center gap-3 min-h-[44px]"
                >
                  <CultureEmblem symbol={symbol} size="sm" />
                  <div className="truncate">
                    <p className="text-sm font-bold text-neutral-900 truncate">{cultureName}</p>
                    <p className="text-[10px] text-violet-700 font-bold">View Community →</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
