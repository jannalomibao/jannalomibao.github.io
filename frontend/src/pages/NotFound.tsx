import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-32 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-6">404</p>
      <h1 className="font-display text-6xl md:text-8xl text-ink">Nothing here.</h1>
      <Link
        to="/"
        data-cursor-hover
        className="inline-flex items-center gap-2 mt-10 text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent transition-colors"
      >
        <ArrowLeft size={16} /> Back home
      </Link>
    </div>
  );
}
