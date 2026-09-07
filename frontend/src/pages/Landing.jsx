import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="text-center py-24">
      <h1 className="text-4xl font-bold tracking-tight mb-4">Micro Culture</h1>
      <p className="text-neutral-400 max-w-xl mx-auto mb-8">
        A place where anyone can start a fictional micro-culture — its own
        vibe, values, and jargon — and AI keeps it alive with a new ritual
        every day.
      </p>
      <div className="flex justify-center gap-4">
        <Link to="/explore" className="px-5 py-2 border border-neutral-700 rounded-full">
          Explore cultures
        </Link>
        <Link to="/signup" className="px-5 py-2 bg-white text-black rounded-full">
          Start one
        </Link>
      </div>
    </div>
  );
}
