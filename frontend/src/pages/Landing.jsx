import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client.js";

// 8 floating community stickers matching the reference image layout
const FLOATING_STICKERS = [
  {
    id: "game-night",
    name: "Game Night",
    symbol: "🎮",
    subtext: "8.2K members",
    bg: "#F3E8FF",
    border: "#E9D5FF",
    arrow: false,
    rotation: -3,
    floatAnim: "animate-float-a",
    desktop: { left: 4, top: 6 },
    mobile: { left: 3, top: 1.5 },
  },
  {
    id: "gateverse",
    name: "GATEverse",
    symbol: "📚",
    subtext: "12.4K members",
    badge: "✦",
    bg: "#FEF3C7",
    border: "#FDE68A",
    arrow: false,
    rotation: 1.5,
    floatAnim: "animate-float-b",
    desktop: { left: 3, top: 28 },
    mobile: null,
  },
  {
    id: "lo-fi-lounge",
    name: "Lo-Fi Lounge",
    symbol: "🎧",
    subtext: "4.8K members",
    bg: "#FCE7F3",
    border: "#FBCFE8",
    arrow: true,
    rotation: -2,
    floatAnim: "animate-float-c",
    desktop: { left: 4, top: 52 },
    mobile: { left: 3, top: 51 },
  },
  {
    id: "wander-notes",
    name: "Wander Notes",
    symbol: "✈️",
    subtext: "6.1K members",
    bg: "#CCFBF1",
    border: "#99F6E4",
    arrow: true,
    rotation: 3,
    floatAnim: "animate-float-a",
    desktop: { left: 6, top: 76 },
    mobile: { left: 3, top: 87 },
  },
  {
    id: "boundary-club",
    name: "Boundary Club",
    symbol: "🏏",
    subtext: "9.3K members",
    bg: "#D1FAE5",
    border: "#A7F3D0",
    arrow: true,
    rotation: -3,
    floatAnim: "animate-float-c",
    desktop: { left: 74, top: 7 },
    mobile: { left: 52, top: 1.5 },
  },
  {
    id: "pixel-playground",
    name: "Pixel Playground",
    symbol: "🎨",
    subtext: "5.2K members",
    bg: "#EDE9FE",
    border: "#DDD6FE",
    arrow: true,
    rotation: 2.5,
    floatAnim: "animate-float-b",
    desktop: { left: 76, top: 28 },
    mobile: null,
  },
  {
    id: "frame-by-frame",
    name: "Frame by Frame",
    symbol: "📷",
    subtext: "3.9K members",
    bg: "#E0F2FE",
    border: "#BAE6FD",
    arrow: true,
    rotation: -2,
    floatAnim: "animate-float-a",
    desktop: { left: 75, top: 52 },
    mobile: { left: 52, top: 51 },
  },
  {
    id: "movie-circle",
    name: "Movie Circle",
    symbol: "🍿",
    subtext: "7.1K members",
    bg: "#FFE4E6",
    border: "#FECDD3",
    arrow: false,
    rotation: 2.5,
    floatAnim: "animate-float-c",
    desktop: { left: 71, top: 76 },
    mobile: { left: 52, top: 87 },
  },
];

// Popular communities row matching reference image
const POPULAR_ROW = [
  { name: "GATEverse",        symbol: "📚", count: "12.4K members", bg: "#FEF3C7" },
  { name: "Pixel Playground",  symbol: "🎨", count: "5.2K members",  bg: "#EDE9FE" },
  { name: "Boundary Club",     symbol: "🏏", count: "9.3K members",  bg: "#D1FAE5" },
  { name: "Lo-Fi Lounge",       symbol: "🎧", count: "4.8K members",  bg: "#FCE7F3" },
  { name: "Frame by Frame",    symbol: "📷", count: "3.9K members",  bg: "#E0F2FE" },
  { name: "Movie Circle",      symbol: "🍿", count: "7.1K members",  bg: "#FFE4E6" },
  { name: "Game Night",        symbol: "🎮", count: "8.2K members",  bg: "#F3E8FF" },
];

/**
 * Floating community sticker.
 * Fixed CSS-percentage position (no user dragging). Gentle automatic float
 * animation via the `animate-float-*` classes; click/tap navigates to the
 * community and is keyboard-accessible.
 */
function FloatingSticker({ item, culture }) {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const navigateToCommunity = () => {
    if (culture?._id) {
      navigate(`/cultures/${culture._id}`);
    } else {
      navigate(`/explore?q=${encodeURIComponent(item.name)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigateToCommunity();
    }
  };

  const config = isMobile ? item.mobile : item.desktop;
  if (isMobile && !item.mobile) return null;

  const memberCount = culture?.members?.length;
  const descriptor = memberCount
    ? `${memberCount} ${memberCount === 1 ? "member" : "members"}`
    : item.subtext;

  return (
    <div
      onClick={navigateToCommunity}
      onKeyDown={handleKeyDown}
      className="absolute select-none z-20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 rounded-full"
      style={{
        left: `${config.left}%`,
        top: `${config.top}%`,
      }}
      role="button"
      tabIndex={0}
      aria-label={`Community: ${item.name}`}
      title={`${item.name} — Click to view`}
    >
      <div
        className={`floating-sticker px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-full flex items-center gap-2 sm:gap-2.5 shadow-sm max-w-[135px] sm:max-w-none ${item.floatAnim} hover:shadow-md`}
        style={{
          backgroundColor: item.bg,
          border: `1.5px solid ${item.border}`,
          "--sticker-rotation": `${item.rotation || 0}deg`,
        }}
      >
        <span className="text-base sm:text-xl leading-none pointer-events-none flex-shrink-0">
          {item.symbol}
        </span>
        <div className="text-left pointer-events-none leading-tight min-w-0 flex-1">
          <div className="text-xs sm:text-sm font-extrabold text-[#17172B] tracking-tight truncate">
            {item.name}
          </div>
          <div className="text-[10px] text-[#687085] font-medium truncate">
            {descriptor}
          </div>
        </div>
        {item.arrow && (
          <span className="hidden sm:inline text-xs text-[#687085] ml-0.5 pointer-events-none font-bold">
            →
          </span>
        )}
        {item.badge && (
          <span className="hidden sm:inline text-xs text-amber-500 ml-0.5 pointer-events-none">
            {item.badge}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Landing() {
  const [cultures, setCultures] = useState([]);

  useEffect(() => {
    let mounted = true;
    api
      .get("/cultures")
      .then(({ data }) => {
        if (mounted && Array.isArray(data)) {
          setCultures(data);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const findId = (name) => {
    const key = name.toLowerCase().trim();
    const found = cultures.find((c) => c.name.toLowerCase().trim() === key);
    return found?._id || null;
  };

  return (
    <div className="space-y-16 pb-16 animate-fadeIn relative">

      {/* ══════════════════════════════════════════
          HERO SECTION — OPEN CANVAS
      ══════════════════════════════════════════ */}
      <div
        className="relative w-full min-h-[720px] sm:min-h-[660px] lg:min-h-[720px] flex flex-col items-center justify-center text-center overflow-hidden pt-6 pb-12"
      >
        {/* Soft pastel ambient background blobs */}
        <div
          className="pointer-events-none absolute -top-12 -left-20 w-80 h-80 rounded-full opacity-40"
          style={{ background: "#FDE68A", filter: "blur(65px)" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-10 -right-20 w-80 h-80 rounded-full opacity-35"
          style={{ background: "#DDD6FE", filter: "blur(65px)" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-6 left-10 w-72 h-72 rounded-full opacity-30"
          style={{ background: "#BAE6FD", filter: "blur(60px)" }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-10 right-16 w-72 h-72 rounded-full opacity-30"
          style={{ background: "#FECDD3", filter: "blur(60px)" }}
          aria-hidden="true"
        />

        {/* Hand-drawn Playful SVG Doodles (Reference mockup accents) */}
        {/* Top-left Sparkle */}
        <span
          className="hidden sm:block absolute left-[26%] top-[11%] text-amber-400 text-lg pointer-events-none select-none"
          aria-hidden="true"
        >
          ✦
        </span>
        {/* Top-right Green Squiggle above Boundary Club */}
        <svg
          className="hidden sm:block absolute right-[32%] top-[6%] w-7 h-4 text-emerald-400 pointer-events-none select-none"
          viewBox="0 0 30 15"
          fill="none"
          aria-hidden="true"
        >
          <path d="M2 12 Q 10 2 18 10 T 28 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        {/* Yellow Crown Doodle above Pixel Playground */}
        <svg
          className="hidden sm:block absolute right-[4%] top-[10%] w-7 h-5 text-amber-400 pointer-events-none select-none"
          viewBox="0 0 24 16"
          fill="none"
          aria-hidden="true"
        >
          <path d="M2 14 L 5 4 L 12 10 L 19 4 L 22 14 Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {/* Cyan Arcs under Wander Notes */}
        <svg
          className="hidden sm:block absolute left-[3%] top-[34%] w-6 h-6 text-teal-400 pointer-events-none select-none"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path d="M6 18 C 3 14 3 8 7 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 20 C 8 15 8 7 13 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {/* Pink Arcs beside Lo-Fi Lounge */}
        <svg
          className="hidden sm:block absolute left-[19%] top-[25%] w-6 h-6 text-pink-400 pointer-events-none select-none"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path d="M4 8 C 8 11 8 17 4 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M10 5 C 15 9 15 19 10 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>

        {/* Floating Community Stickers */}
        {FLOATING_STICKERS.map((sticker) => (
          <FloatingSticker
            key={sticker.id}
            item={sticker}
            culture={cultures.find((culture) => culture.name.toLowerCase().trim() === sticker.name.toLowerCase().trim())}
          />
        ))}

        {/* Top Playful Hand-Written Tagline */}
        <div className="relative z-10 mb-3 flex items-center justify-center gap-2 select-none">
          <span className="text-amber-400 text-sm">✦</span>
          <span
            className="text-xs sm:text-sm font-semibold tracking-wide italic"
            style={{ color: "#4B5563" }}
          >
            Real people.{" "}
            <span className="relative inline-block text-[#17172B]">
              Real interests.
              <svg
                className="absolute -bottom-1 left-0 w-full h-2 text-rose-400 pointer-events-none"
                viewBox="0 0 100 8"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M 2 5 Q 50 9 98 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </span>{" "}
            Real communities.
          </span>
          <span className="text-pink-400 text-sm">✦</span>
        </div>

        {/* Hero Headline */}
        <div className="relative z-10 max-w-3xl px-4 mx-auto space-y-4">
          <h1
            className="text-5xl sm:text-6xl lg:text-[76px] font-black tracking-tight leading-[1.08]"
            style={{ color: "#17172B" }}
          >
            Find your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500">
              people.
            </span>
          </h1>

          <p
            className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed font-medium"
            style={{ color: "#687085" }}
          >
            Join communities around anything you love.
            <br className="hidden sm:inline" />
            {" "}From tech and sports to music, books, art and beyond.
          </p>
        </div>

        {/* Hero Action Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-7 w-full px-6 sm:w-auto">
          <Link to="/explore" className="w-full sm:w-auto">
            <button
              className="w-full sm:w-auto px-7 py-3.5 rounded-full text-sm font-extrabold text-white transition-all duration-200 hover:opacity-95 active:scale-[0.97] shadow-md flex items-center justify-center gap-2 cursor-pointer"
              style={{ background: "#17172B" }}
            >
              <span>Explore communities</span>
              <span>→</span>
            </button>
          </Link>
          <Link to="/create" className="w-full sm:w-auto">
            <button
              className="w-full sm:w-auto px-7 py-3.5 rounded-full text-sm font-extrabold text-[#17172B] bg-white transition-all duration-200 hover:bg-neutral-50 active:scale-[0.97] shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              style={{ border: "1.5px solid rgba(23,23,43,0.12)" }}
            >
              <span>+ Create a community</span>
            </button>
          </Link>
        </div>

        {/* Social Proof Strip */}
        <div className="relative z-10 flex items-center justify-center gap-3 pt-6 select-none">
          <div className="flex items-center -space-x-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-amber-200 border-2 border-white flex items-center justify-center text-xs font-bold text-amber-900">
              A
            </div>
            <div className="w-7 h-7 rounded-full bg-purple-200 border-2 border-white flex items-center justify-center text-xs font-bold text-purple-900">
              P
            </div>
            <div className="w-7 h-7 rounded-full bg-pink-200 border-2 border-white flex items-center justify-center text-xs font-bold text-pink-900">
              D
            </div>
            <div className="w-7 h-7 rounded-full bg-emerald-200 border-2 border-white flex items-center justify-center text-xs font-bold text-emerald-900">
              R
            </div>
          </div>
          <span className="text-xs font-bold text-[#4B5563]">
            10K+ people already building together ❤️
          </span>
        </div>

        {/* Far Right Decorative Note */}
        <div className="hidden xl:block absolute right-8 bottom-12 text-right pointer-events-none select-none">
          <div className="text-xs font-bold text-purple-900/60 leading-tight">
            All Interests.
            <br />
            All People.
            <br />
            One Place.
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          HOW IT WORKS (5 CIRCULAR CONNECTED STEPS)
      ══════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4">
        <div
          className="warm-card p-6 sm:p-10 rounded-3xl space-y-8"
          style={{ border: "1.5px solid rgba(23,23,43,0.06)" }}
        >
          <div className="text-center space-y-1">
            <h2
              className="text-2xl sm:text-3xl font-black tracking-tight"
              style={{ color: "#17172B" }}
            >
              How it works
            </h2>
            <p className="text-sm font-medium" style={{ color: "#687085" }}>
              A simple loop. A more connected you.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 sm:gap-4 text-center relative">
            {/* Desktop wavy connecting loop */}
            <svg
              className="hidden sm:block absolute top-7 left-[8%] right-[8%] w-[84%] h-6 pointer-events-none z-0"
              viewBox="0 0 500 30"
              fill="none"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="stepLoopGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F472B6" />
                  <stop offset="25%" stopColor="#FBBF24" />
                  <stop offset="50%" stopColor="#A78BFA" />
                  <stop offset="75%" stopColor="#2DD4BF" />
                  <stop offset="100%" stopColor="#FB923C" />
                </linearGradient>
              </defs>
              <path
                d="M 10 15 Q 65 3 125 15 T 250 15 T 375 15 T 485 15"
                stroke="url(#stepLoopGrad)"
                strokeWidth="2"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />
              <path
                d="M 480 11 L 490 15 L 480 19"
                stroke="#FB923C"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Step 1: Join */}
            <div className="flex flex-col items-center space-y-2.5 relative z-10">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-xs transition-transform hover:scale-105"
                style={{ background: "#FCE7F3", color: "#EC4899" }}
              >
                👥
              </div>
              <h3 className="text-sm font-extrabold text-[#17172B]">Join</h3>
              <p className="text-xs text-[#687085] leading-relaxed">
                Find your community
              </p>
            </div>

            {/* Step 2: Discuss */}
            <div className="flex flex-col items-center space-y-2.5 relative z-10">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-xs transition-transform hover:scale-105"
                style={{ background: "#FEF3C7", color: "#D97706" }}
              >
                💬
              </div>
              <h3 className="text-sm font-extrabold text-[#17172B]">Discuss</h3>
              <p className="text-xs text-[#687085] leading-relaxed">
                Share ideas &amp; get help
              </p>
            </div>

            {/* Step 3: Do */}
            <div className="flex flex-col items-center space-y-2.5 relative z-10">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-xs transition-transform hover:scale-105"
                style={{ background: "#EDE9FE", color: "#7C3AED" }}
              >
                ⚡
              </div>
              <h3 className="text-sm font-extrabold text-[#17172B]">Do</h3>
              <p className="text-xs text-[#687085] leading-relaxed">
                Take part in activities
              </p>
            </div>

            {/* Step 4: Share */}
            <div className="flex flex-col items-center space-y-2.5 relative z-10">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-xs transition-transform hover:scale-105"
                style={{ background: "#CCFBF1", color: "#0D9488" }}
              >
                🔗
              </div>
              <h3 className="text-sm font-extrabold text-[#17172B]">Share</h3>
              <p className="text-xs text-[#687085] leading-relaxed">
                Show your progress
              </p>
            </div>

            {/* Step 5: Grow */}
            <div className="flex flex-col items-center space-y-2.5 col-span-2 sm:col-span-1 relative z-10">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-xs transition-transform hover:scale-105"
                style={{ background: "#FFEDD5", color: "#EA580C" }}
              >
                ✨
              </div>
              <h3 className="text-sm font-extrabold text-[#17172B]">Grow</h3>
              <p className="text-xs text-[#687085] leading-relaxed">
                The community remembers &amp; adapts with AI
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          POPULAR COMMUNITIES (HORIZONTAL CIRCLES)
      ══════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4">
        <div
          className="warm-card p-6 sm:p-8 rounded-3xl space-y-6"
          style={{ border: "1.5px solid rgba(23,23,43,0.06)" }}
        >
          <div>
            <h2
              className="text-xl sm:text-2xl font-black text-[#17172B]"
            >
              Popular communities
            </h2>
            <p className="text-xs sm:text-sm text-[#687085] mt-0.5">
              Find people who are into the same things.
            </p>
          </div>

          {/* Horizontal row of circular community avatars */}
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 scrollbar-none">
            {POPULAR_ROW.map((item) => {
              const targetId = findId(item.name);
              const link = targetId ? `/cultures/${targetId}` : `/explore?q=${encodeURIComponent(item.name)}`;
              return (
                <Link
                  key={item.name}
                  to={link}
                  className="flex flex-col items-center text-center shrink-0 group hover:scale-105 transition-transform duration-200"
                  style={{ width: "96px" }}
                >
                  <div
                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center text-2xl sm:text-3xl shadow-xs mb-2 transition-shadow group-hover:shadow-md"
                    style={{ background: item.bg }}
                  >
                    {item.symbol}
                  </div>
                  <div className="text-xs font-extrabold text-[#17172B] truncate w-full group-hover:text-purple-600 transition-colors">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-[#687085] font-medium truncate w-full mt-0.5">
                    {item.count}
                  </div>
                </Link>
              );
            })}

            {/* View All Button */}
            <Link
              to="/explore"
              className="flex flex-col items-center text-center shrink-0 group hover:scale-105 transition-transform duration-200"
              style={{ width: "80px" }}
            >
              <div className="w-14 h-14 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-base font-bold text-[#17172B] shadow-xs mb-2 group-hover:bg-neutral-200">
                →
              </div>
              <span className="text-xs font-bold text-[#687085]">
                View all
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          BOTTOM EDITORIAL SHOWCASE (4 CARDS)
      ══════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Card 1: A space for every passion */}
          <div
            className="warm-card p-6 rounded-3xl flex flex-col justify-between space-y-6 relative overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #FFFFFF 0%, #FFF8FA 100%)",
              border: "1.5px solid rgba(23,23,43,0.06)",
            }}
          >
            <div className="space-y-2">
              <h3 className="text-2xl font-black leading-tight text-[#17172B]">
                A space for every{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                  passion
                </span>
              </h3>
              <p className="text-xs text-[#687085] leading-relaxed">
                Build, learn, share and grow — together.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center -space-x-2">
                <div className="w-7 h-7 rounded-full bg-amber-200 border-2 border-white flex items-center justify-center text-[10px] font-bold">
                  A
                </div>
                <div className="w-7 h-7 rounded-full bg-purple-200 border-2 border-white flex items-center justify-center text-[10px] font-bold">
                  P
                </div>
                <div className="w-7 h-7 rounded-full bg-pink-200 border-2 border-white flex items-center justify-center text-[10px] font-bold">
                  D
                </div>
              </div>

              <Link to="/explore">
                <button
                  className="w-full py-2.5 rounded-full text-xs font-extrabold text-white cursor-pointer shadow-xs hover:opacity-90 active:scale-[0.97] transition-all"
                  style={{ background: "#17172B" }}
                >
                  Get started →
                </button>
              </Link>
            </div>
          </div>

          {/* Card 2: Interactive Mobile Screen Mockup */}
          <div
            className="warm-card p-5 rounded-3xl border space-y-3 relative shadow-xs"
            style={{
              background: "#FFFDF9",
              border: "1.5px solid rgba(23,23,43,0.08)",
            }}
          >
            {/* Mobile frame header */}
            <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-100 text-sm flex items-center justify-center">
                  🧑‍🎨
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-[#17172B]">Hey, Alex 👋</div>
                  <div className="text-[9px] text-[#94A3B8]">Good to see you!</div>
                </div>
              </div>
              <span className="text-xs text-[#94A3B8]">🔍</span>
            </div>

            {/* Inner items */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#17172B] text-[11px]">Your communities</div>
                  <div className="text-[9px] text-purple-700">8 joined</div>
                </div>
                <span className="text-[10px] text-purple-700">→</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#17172B] text-[11px]">Today's activity</div>
                  <div className="text-[9px] text-emerald-700">2 pending</div>
                </div>
                <span className="text-[10px] text-emerald-700">→</span>
              </div>

              <div className="p-2.5 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#17172B] text-[11px]">Your streak</div>
                  <div className="text-[9px] text-amber-700">12 days 🔥</div>
                </div>
                <span className="text-[10px] text-amber-700">→</span>
              </div>
            </div>

            {/* Mock bottom nav */}
            <div className="flex items-center justify-around pt-2 text-xs text-[#94A3B8] border-t border-neutral-100">
              <span>🏠</span>
              <span>➕</span>
              <span>👥</span>
              <span>👤</span>
            </div>
          </div>

          {/* Card 3: Not just another app */}
          <div
            className="warm-card p-6 rounded-3xl flex flex-col justify-between space-y-4 relative overflow-hidden"
            style={{
              background: "#FFFFFF",
              border: "1.5px solid rgba(23,23,43,0.06)",
            }}
          >
            <div className="space-y-1">
              <h3 className="text-xl font-black leading-tight text-[#17172B]">
                Not just another app.
              </h3>
              <p className="text-xs text-[#687085] leading-relaxed">
                A living, breathing community space.
              </p>
            </div>

            {/* Organic pastel note */}
            <div
              className="p-4 rounded-2xl relative space-y-1 text-xs font-extrabold"
              style={{
                background: "#FEF9C3",
                border: "1.5px solid #FDE047",
                color: "#854D0E",
              }}
            >
              <div>Ideas</div>
              <div>People</div>
              <div>Progress</div>
              <div>Together</div>
              <div className="text-right text-base">😊</div>
            </div>
          </div>

          {/* Card 4: Testimonial Quote */}
          <div
            className="warm-card p-6 rounded-3xl flex flex-col justify-between space-y-4 relative"
            style={{
              background: "#FFFFFF",
              border: "1.5px solid rgba(23,23,43,0.06)",
            }}
          >
            <span className="text-4xl font-serif text-pink-400 leading-none">
              “
            </span>
            <p className="text-xs sm:text-sm font-medium text-[#17172B] leading-relaxed italic">
              “Micro Culture helped me find people who actually get what I'm into. It feels alive.”
            </p>
            <div className="text-[11px] font-bold text-[#687085]">
              — A happy member
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
