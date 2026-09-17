import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import GlassPanel from "../components/ui/GlassPanel.jsx";
import GlowButton from "../components/ui/GlowButton.jsx";
import LoadingState from "../components/ui/LoadingState.jsx";
import ErrorState from "../components/ui/ErrorState.jsx";
import WeeklySummaryModal from "../components/WeeklySummaryModal.jsx";
import { ProgressionPanel } from "../components/ui/ProgressionBadge.jsx";
import { StreakCard } from "../components/ui/ParticipationBadge.jsx";

function formatTimeAgo(dateStr) {
  if (!dateStr) return "recently";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function getCommunityResources(culture) {
  const name = (culture?.name || "").toLowerCase();
  if (name.includes("gate")) {
    return [
      { title: "GATE Official PYQ Repository", desc: "Past 15 years chapter-wise solved questions with detailed answer keys.", link: "https://gate2026.iitr.ac.in", tag: "PYQs" },
      { title: "Engineering Mathematics Formula Sheet", desc: "Hand-compiled 12-page formula cheat sheet covering Linear Algebra, Calculus, and Probability.", link: "#", tag: "Cheat Sheet" },
      { title: "Virtual Calculator Simulator", desc: "Browser-based practice simulator for the exact official GATE scientific calculator interface.", link: "#", tag: "Tool" },
      { title: "Standard Textbooks Roadmap", desc: "Recommended textbooks for Computer Science, Mechanical, and Electrical engineering papers.", link: "#", tag: "Guide" },
    ];
  }
  if (name.includes("java")) {
    return [
      { title: "OpenJDK 21+ Language Specification", desc: "Official specification of records, pattern matching, virtual threads, and JVM internals.", link: "https://dev.java", tag: "Docs" },
      { title: "Effective Java (3rd Edition) Key Notes", desc: "Concise summary of Joshua Bloch's 90 best practices for robust Java architecture.", link: "#", tag: "Best Practices" },
      { title: "Visualizing Java Memory & Garbage Collection", desc: "Interactive visualization of Eden, Survivor, Tenured spaces and G1GC behavior.", link: "#", tag: "Interactive" },
      { title: "Spring Boot 3.x Production Blueprint", desc: "Starter repo featuring clean layered architecture, validation, JPA, and testcontainers.", link: "#", tag: "Starter Repo" },
    ];
  }
  if (name.includes("pixel") || name.includes("design")) {
    return [
      { title: "Figma Community Component Kit", desc: "Production-ready auto-layout buttons, inputs, modals, and responsive navigation bars.", link: "https://figma.com/@community", tag: "UI Kit" },
      { title: "Refactoring UI Cheatsheet", desc: "Visual tactics for developers creating beautiful interfaces without a formal design background.", link: "#", tag: "Guide" },
      { title: "Mobbin Mobile & Web Pattern Archive", desc: "Real-world iOS, Android, and web screenshots from top product apps.", link: "https://mobbin.com", tag: "Inspiration" },
      { title: "WebAIM Contrast Checker", desc: "WCAG AAA accessible color palette tester for dark and light modes.", link: "https://webaim.org/resources/contrastchecker/", tag: "Tool" },
    ];
  }
  if (name.includes("cyber") || name.includes("sentinel")) {
    return [
      { title: "PicoCTF Learning Platform", desc: "Gamified beginner challenges in cryptography, binary exploitation, and forensics.", link: "https://picoctf.org", tag: "CTF" },
      { title: "OWASP Top 10 Web Vulnerabilities", desc: "Comprehensive guides and testing payloads for common web security vulnerabilities.", link: "https://owasp.org", tag: "Security" },
      { title: "TryHackMe Pre-Security Path", desc: "Structured foundational rooms covering Linux, networking, and security concepts.", link: "https://tryhackme.com", tag: "Labs" },
      { title: "Wireshark Packet Analysis Guide", desc: "Pocket reference for pcap capture filters, TCP streams, and handshake diagnosis.", link: "#", tag: "Cheat Sheet" },
    ];
  }
  if (name.includes("dsa") || name.includes("code")) {
    return [
      { title: "NeetCode 150 Problem Map", desc: "Curated algorithmic problem set covering arrays, trees, graphs, and dynamic programming.", link: "#", tag: "DSA Sheet" },
      { title: "Time & Space Complexity Reference", desc: "Big-O cheatsheet for common data structures, sorting algorithms, and recursion trees.", link: "#", tag: "Cheat Sheet" },
      { title: "Visualgo Algorithm Animations", desc: "Interactive step-by-step visualizer for graph traversals, heap operations, and BST rotations.", link: "#", tag: "Interactive" },
      { title: "FAANG Mock Interview Questions", desc: "Real question bank with interviewer scoring rubrics and optimal solution patterns.", link: "#", tag: "Interviews" },
    ];
  }
  return [
    { title: `${culture?.name || "Community"} Starter Roadmap`, desc: `Essential guides and beginner tips curated by ${culture?.name || "club"} members.`, link: "#", tag: "Roadmap" },
    { title: "Curated Free Learning Channels", desc: "High-yield YouTube channels, documentation, and practice platforms recommended by peers.", link: "#", tag: "Curated" },
    { title: "Community Discussions & Solution Archive", desc: "Top solved questions, discussions, and member projects shared in this community.", link: "#", tag: "Archive" },
    { title: "Daily Check-in & Habit Tracker", desc: "Template for tracking your consistency and collaborating with peers.", link: "#", tag: "Template" },
  ];
}

export default function CultureDetail() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const [culture, setCulture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDesc, setEditDesc] = useState("");
  const [editSymbol, setEditSymbol] = useState("");
  const [logs, setLogs] = useState([]);

  // Tab state: "discussion" | "activities" | "resources" | "about"
  const [activeTab, setActiveTab] = useState("discussion");
  const [discussionFilter, setDiscussionFilter] = useState("all");
  const [newDiscussion, setNewDiscussion] = useState("");
  const [postLoading, setPostLoading] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  async function loadCulture() {
    setLoading(true);
    setError("");
    try {
      const [cultureRes, logsRes] = await Promise.allSettled([
        api.get(`/cultures/${id}`),
        api.get(`/logs/${id}`),
      ]);
      if (cultureRes.status === "fulfilled") {
        setCulture(cultureRes.value.data);
        setEditDesc(cultureRes.value.data.description || "");
        setEditSymbol(cultureRes.value.data.symbol || "✨");
      } else {
        throw cultureRes.reason;
      }
      if (logsRes.status === "fulfilled" && Array.isArray(logsRes.value.data)) {
        setLogs(logsRes.value.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load community details.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCulture();
  }, [id]);

  useEffect(() => {
    if (!showEditModal) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") setShowEditModal(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showEditModal]);

  async function handleJoin() {
    setActionLoading(true);
    setError("");
    try {
      await api.post(`/cultures/${id}/join`);
      await Promise.all([loadCulture(), refreshUser()]);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to join community.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleLeave() {
    if (!window.confirm("Are you sure you want to leave this community?")) return;
    setActionLoading(true);
    setError("");
    try {
      await api.post(`/cultures/${id}/leave`);
      await Promise.all([loadCulture(), refreshUser()]);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to leave community.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.put(`/cultures/${id}`, {
        description: editDesc,
        symbol: editSymbol,
      });
      setCulture((prev) => ({ ...prev, ...res.data }));
      setShowEditModal(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update community.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePostDiscussion(e) {
    e.preventDefault();
    if (!newDiscussion.trim() || postLoading) return;
    setPostLoading(true);
    try {
      const { data } = await api.post("/logs", {
        cultureId: id,
        content: newDiscussion.trim(),
      });
      setLogs((prev) => [data, ...prev]);
      setNewDiscussion("");
      setPostSuccess(true);
      setTimeout(() => setPostSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to post message.");
    } finally {
      setPostLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16">
        <LoadingState message="Entering community..." subtext="Getting discussions and activities ready." />
      </div>
    );
  }

  if (error && !culture) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorState message={error} onRetry={loadCulture} />
      </div>
    );
  }

  if (!culture) return null;

  const currentUserId = (user?.id || user?._id)?.toString();
  const isCreator = culture.creatorId?.toString() === currentUserId;
  const isMember =
    user &&
    (culture.members?.some((m) => (m?._id || m)?.toString() === currentUserId) || isCreator);

  const accentColor = culture.color || "#8b5cf6";
  const membersCount = culture.membersCount ?? (culture.members?.length || 1);
  const resources = getCommunityResources(culture);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* 1. TOP SECTION: Community Club Identity */}
      <div
        className="warm-card p-6 sm:p-8 relative overflow-hidden border border-neutral-200/80 bg-white"
        style={{ "--card-accent-glow": `${accentColor}30` }}
      >
        <div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-25"
          style={{ backgroundColor: accentColor }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center text-3xl sm:text-4xl shadow-md border border-neutral-200/70 shrink-0"
              style={{
                backgroundColor: `${accentColor}18`,
                boxShadow: `0 8px 24px ${accentColor}25`,
              }}
            >
              {culture.symbol || "✨"}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                  {culture.name}
                </h1>
                {isMember && (
                  <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                    {isCreator ? "Founder" : "Member"}
                  </span>
                )}
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ● Active Club
                </span>
              </div>

              <p className="text-xs sm:text-sm text-neutral-500 flex items-center gap-2">
                <span className="text-neutral-900 font-bold">{membersCount} members</span>
                <span>•</span>
                <span>{logs.length} discussions & activities</span>
              </p>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0">
            {user && !isMember ? (
              <GlowButton
                variant="primary"
                size="lg"
                loading={actionLoading}
                onClick={handleJoin}
                className="w-full sm:w-auto justify-center min-h-[46px]"
              >
                Join Community 👋
              </GlowButton>
            ) : isMember ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link to={`/cultures/${id}/ritual`} className="flex-1 sm:flex-initial">
                  <GlowButton variant="primary" size="md" className="w-full sm:w-auto justify-center min-h-[44px]">
                    Today&apos;s Activity →
                  </GlowButton>
                </Link>
                {isCreator && (
                  <button
                    type="button"
                    onClick={() => setShowEditModal(true)}
                    className="px-3 py-2 text-xs font-semibold rounded-xl bg-neutral-100 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200/80 border border-neutral-200/80 transition-colors"
                  >
                    ✎ Edit
                  </button>
                )}
              </div>
            ) : (
              <Link to="/signup" className="w-full sm:w-auto">
                <GlowButton variant="primary" size="md" className="w-full sm:w-auto justify-center min-h-[44px]">
                  Sign up to Join
                </GlowButton>
              </Link>
            )}
          </div>
        </div>

        {/* Short description */}
        <p className="mt-4 text-sm sm:text-base text-neutral-600 leading-relaxed max-w-2xl relative z-10">
          {culture.description}
        </p>

        {/* Vibe Tags */}
        {culture.vibeWords?.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5 relative z-10">
            {culture.vibeWords.map((v, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-0.5 rounded-full bg-white/90 border border-neutral-200/90 text-neutral-600 font-semibold shadow-xs"
              >
                #{v}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 2. TABS BAR: Discussion | Activities | Resources | About */}
      <div className="flex items-center gap-2 border-b border-neutral-200/80 pb-1 overflow-x-auto scrollbar-none">
        {[
          { id: "discussion", label: "💬 Discussion", count: logs.length },
          { id: "activities", label: "⚡ Activities", count: culture.rituals?.length || 1 },
          { id: "resources", label: "📚 Resources", count: resources.length },
          { id: "about", label: "ℹ️ About Club" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? "bg-neutral-900 text-white shadow-sm scale-102"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? "bg-neutral-800 text-white" : "bg-neutral-200 text-neutral-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. TAB 1: DISCUSSION (FIRST-CLASS FORUM EXPERIENCE) */}
      {activeTab === "discussion" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Post box for members */}
          {isMember ? (
            <div className="warm-card p-4 sm:p-5 border border-neutral-200/80 space-y-3 bg-white">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <span>✍️</span> Ask a question or share a thought
                </span>
                <span>Shape community memory</span>
              </div>

              <form onSubmit={handlePostDiscussion} className="space-y-3">
                <textarea
                  value={newDiscussion}
                  onChange={(e) => setNewDiscussion(e.target.value)}
                  placeholder={`What are you working on or curious about in ${culture.name}? Ask a doubt, share an idea...`}
                  rows={3}
                  maxLength={2000}
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-neutral-200/90 rounded-2xl text-neutral-900 placeholder-neutral-400 text-sm focus:outline-none focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none leading-relaxed"
                />

                {postSuccess && (
                  <p className="text-xs text-emerald-700 font-bold">
                    ✓ Posted to {culture.name}! Your thought is part of the community memory.
                  </p>
                )}

                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="text-[11px] text-neutral-400">
                    Press post to share with {membersCount} classmates
                  </div>
                  <GlowButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={postLoading}
                    disabled={!newDiscussion.trim()}
                    className="min-h-[38px] px-5"
                  >
                    Post Discussion →
                  </GlowButton>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-neutral-600">
                <span className="font-bold text-neutral-900 block sm:inline mr-1">Want to join this discussion?</span>
                Join this club to ask questions, share projects, and collaborate with members.
              </div>
              {user ? (
                <GlowButton size="sm" variant="primary" onClick={handleJoin} loading={actionLoading}>
                  Join Club
                </GlowButton>
              ) : (
                <Link to="/signup">
                  <GlowButton size="sm" variant="primary">
                    Sign up to Join
                  </GlowButton>
                </Link>
              )}
            </div>
          )}

          {/* Discussion feed */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
              <span className="font-bold uppercase tracking-wider text-neutral-600">
                Community Discussions &amp; Activity
              </span>
              <span>{logs.length} total</span>
            </div>

            {logs.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white border border-neutral-200/80 space-y-2">
                <span className="text-3xl">💬</span>
                <h4 className="text-sm font-bold text-neutral-900">No discussions yet</h4>
                <p className="text-xs text-neutral-500">Be the first to ask a question or share an update!</p>
              </div>
            ) : (
              logs.map((log) => {
                const authorName = typeof log.userId === "object" ? log.userId?.name : "Community Member";
                const initial = authorName ? authorName[0].toUpperCase() : "M";
                const isDoubt = log.content?.includes("?") || log.content?.toLowerCase().includes("doubt");

                return (
                  <div
                    key={log._id}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/80 hover:border-neutral-300 transition-all space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-neutral-900 shadow-xs border border-neutral-200/60"
                          style={{ backgroundColor: `${accentColor}20` }}
                        >
                          {initial}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-neutral-900 flex items-center gap-2">
                            <span>{authorName}</span>
                            <span className="text-[10px] text-neutral-400 font-normal">
                              {formatTimeAgo(log.createdAt)}
                            </span>
                          </div>
                          {log.ritualId?.title && (
                            <p className="text-[11px] text-violet-700 font-medium truncate max-w-sm">
                              Responding to: {log.ritualId.title}
                            </p>
                          )}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isDoubt
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-violet-50 text-violet-800 border-violet-200"
                        }`}
                      >
                        {isDoubt ? "❓ Question / Doubt" : "💡 Discussion"}
                      </span>
                    </div>

                    <p className="text-sm text-neutral-700 leading-relaxed pl-12">
                      {log.content}
                    </p>

                    <div className="flex items-center gap-4 pl-12 text-xs text-neutral-500 pt-1">
                      <button
                        type="button"
                        className="hover:text-neutral-900 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        <span>👏</span> Helpful
                      </button>
                      <button
                        type="button"
                        className="hover:text-neutral-900 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        <span>💬</span> Reply
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 4. TAB 2: ACTIVITIES */}
      {activeTab === "activities" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Today's Activity Card */}
          <div
            className="warm-card p-6 sm:p-7 relative overflow-hidden border border-neutral-200/80 bg-white"
            style={{ "--card-accent-glow": `${accentColor}30` }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-violet-700">
                  <span>⚡</span> Today&apos;s Community Activity
                </div>
                <h3 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                  {culture.rituals?.[0] || "Take part in today's activity"}
                </h3>
                <p className="text-xs text-neutral-500">
                  Takes ~15 minutes • Builds your streak • Helps AI curate tomorrow&apos;s activity
                </p>
              </div>

              {isMember ? (
                <Link to={`/cultures/${id}/ritual`} className="shrink-0">
                  <GlowButton variant="primary" size="md" className="min-h-[44px]">
                    Start Today&apos;s Activity →
                  </GlowButton>
                </Link>
              ) : (
                <GlowButton variant="primary" size="md" onClick={handleJoin} loading={actionLoading}>
                  Join to Participate →
                </GlowButton>
              )}
            </div>
          </div>

          {/* Personal streak if member */}
          {isMember && culture.participation && (
            <StreakCard participation={culture.participation} />
          )}

          {/* Progression */}
          {culture.progression && (
            <ProgressionPanel progression={culture.progression} />
          )}

          {/* Social Loop Explainer */}
          <div className="warm-card p-5 border border-neutral-200/80 space-y-3 bg-white">
            <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
              How the Community Loop Works
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#F9FAFB] border border-neutral-200/70 space-y-1">
                <span className="font-bold text-violet-700">1. Join Community</span>
                <p className="text-[11px] text-neutral-500">Connect with fellow members</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F9FAFB] border border-neutral-200/70 space-y-1">
                <span className="font-bold text-blue-700">2. Discuss</span>
                <p className="text-[11px] text-neutral-500">Ask questions &amp; doubts</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F9FAFB] border border-neutral-200/70 space-y-1">
                <span className="font-bold text-amber-700">3. Do Activity</span>
                <p className="text-[11px] text-neutral-500">Daily practice task</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F9FAFB] border border-neutral-200/70 space-y-1">
                <span className="font-bold text-emerald-700">4. AI Remembers</span>
                <p className="text-[11px] text-neutral-500">Next activities adapt</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 3: RESOURCES */}
      {activeTab === "resources" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="font-bold uppercase tracking-wider text-neutral-600">
              Curated Community Learning Resources
            </span>
            <span>{resources.length} guides</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {resources.map((res, i) => (
              <div
                key={i}
                className="warm-card p-5 border border-neutral-200/80 hover:border-neutral-300 transition-all flex flex-col justify-between space-y-3 bg-white"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                      {res.tag}
                    </span>
                    <span className="text-neutral-400 text-xs">⭐ Member Pick</span>
                  </div>
                  <h4 className="text-base font-bold text-neutral-900">
                    {res.title}
                  </h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {res.desc}
                  </p>
                </div>

                <a
                  href={res.link}
                  target={res.link.startsWith("http") ? "_blank" : "_self"}
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 hover:text-violet-900 transition-colors pt-2 border-t border-neutral-100"
                >
                  <span>Open Resource</span>
                  <span>→</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TAB 4: ABOUT CLUB */}
      {activeTab === "about" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid md:grid-cols-2 gap-5">
            {/* Core Values */}
            <div className="warm-card p-5 border border-neutral-200/80 space-y-3 bg-white">
              <h4 className="text-xs font-bold text-violet-700 uppercase tracking-wider">
                🌟 Club Values
              </h4>
              <ul className="space-y-2 text-sm">
                {culture.values?.length > 0 ? (
                  culture.values.map((v, i) => (
                    <li key={i} className="flex items-center gap-2 text-neutral-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                      <span>{v}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-neutral-400 text-xs">No explicit values cataloged.</li>
                )}
              </ul>
            </div>

            {/* Vibe & Aesthetic */}
            <div className="warm-card p-5 border border-neutral-200/80 space-y-3 bg-white">
              <h4 className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                🎨 Club Vibe &amp; Aesthetic
              </h4>
              <ul className="space-y-2 text-sm">
                {culture.aesthetic?.length > 0 ? (
                  culture.aesthetic.map((a, i) => (
                    <li key={i} className="flex items-center gap-2 text-neutral-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                      <span>{a}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-neutral-400 text-xs">Aesthetic is emerging naturally.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Jargon Dictionary */}
          {culture.jargon?.length > 0 && (
            <div className="warm-card p-5 border border-neutral-200/80 space-y-3 bg-white">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                📖 Community Slang &amp; Terms
              </h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {culture.jargon.map((j, i) => {
                  const [term, def] = j.includes(":") ? j.split(":") : [j, ""];
                  return (
                    <div key={i} className="p-3 rounded-xl bg-[#F9FAFB] border border-neutral-200/70 text-xs">
                      <span className="font-bold text-neutral-900 block">{term.trim()}</span>
                      {def && <span className="text-neutral-500 text-[11px] mt-0.5 block">{def.trim()}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Member Controls & Weekly summary */}
          {isMember && (
            <div className="pt-4 border-t border-neutral-200/80 flex items-center justify-between text-xs text-neutral-500">
              <button
                type="button"
                onClick={() => setShowSummaryModal(true)}
                className="text-violet-700 hover:text-violet-900 transition-colors flex items-center gap-1.5 font-bold cursor-pointer"
              >
                <span>📜</span> View Weekly Summary
              </button>

              {!isCreator && (
                <button
                  type="button"
                  onClick={handleLeave}
                  disabled={actionLoading}
                  className="text-red-600 hover:text-red-800 transition-colors cursor-pointer font-medium"
                >
                  Leave community
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Weekly Summary Modal */}
      {showSummaryModal && (
        <WeeklySummaryModal cultureId={id} onClose={() => setShowSummaryModal(false)} />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="warm-card p-6 w-full max-w-md border border-neutral-200 shadow-2xl space-y-4 bg-white rounded-3xl">
            <h3 className="text-lg font-bold text-neutral-900">Edit Community</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs text-neutral-600 font-semibold block mb-1">Club Symbol</label>
                <input
                  type="text"
                  value={editSymbol}
                  onChange={(e) => setEditSymbol(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAFB] border border-neutral-200 text-neutral-900 text-sm focus:bg-white focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-600 font-semibold block mb-1">Description</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FAFB] border border-neutral-200 text-neutral-900 text-sm focus:bg-white focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <GlowButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </GlowButton>
                <GlowButton type="submit" variant="primary" size="sm" loading={actionLoading}>
                  Save Changes
                </GlowButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
