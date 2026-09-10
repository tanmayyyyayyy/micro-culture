import { Link } from "react-router-dom";
import GlassPanel from "./GlassPanel.jsx";
import CultureEmblem from "./CultureEmblem.jsx";

export default function CultureCard({ culture, actionText, actionLink, isMember = false }) {
  if (!culture) return null;

  return (
    <GlassPanel interactive className="group p-5 flex flex-col justify-between h-full">
      <Link to={`/cultures/${culture._id}`} className="block">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <CultureEmblem
              symbol={culture.symbol}
              color={culture.color}
              size="md"
            />
            <div>
              <h3 className="font-semibold text-neutral-100 group-hover:text-white transition-colors flex items-center gap-2">
                {culture.name}
                {isMember && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Member
                  </span>
                )}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {culture.membersCount ?? (culture.members?.length || 1)} members
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed mb-4">
          {culture.description}
        </p>

        {culture.vibeWords?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {culture.vibeWords.slice(0, 3).map((word, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-0.5 rounded-md bg-neutral-800/80 text-neutral-300 border border-neutral-700/60"
              >
                #{word}
              </span>
            ))}
          </div>
        )}
      </Link>

      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
        <Link
          to={`/cultures/${culture._id}`}
          className="text-neutral-400 hover:text-white transition-colors"
        >
          View Charter
        </Link>
        {actionLink ? (
          <Link
            to={actionLink}
            className="inline-flex items-center gap-1 font-medium text-violet-400 hover:text-violet-300 transition-colors"
          >
            {actionText || "Today's Rite"} →
          </Link>
        ) : (
          <Link
            to={`/cultures/${culture._id}`}
            className="inline-flex items-center gap-1 font-medium text-neutral-300 hover:text-white transition-colors"
          >
            Enter →
          </Link>
        )}
      </div>
    </GlassPanel>
  );
}
