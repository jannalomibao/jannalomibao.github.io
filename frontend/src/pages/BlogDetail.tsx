import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { posts } from "@/data/content";
import Reveal from "@/components/ui/Reveal";

export default function BlogDetail() {
  const { slug } = useParams();
  const post = posts.find((p) => p.slug === slug);

  if (!post) return <Navigate to="/blog" replace />;

  return (
    <article className="max-w-3xl mx-auto px-6 md:px-10 py-16 md:py-24">
      <Reveal>
        <Link
          to="/blog"
          data-cursor-hover
          className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink transition-colors mb-10"
        >
          <ArrowLeft size={16} /> Back to writing
        </Link>

        <p className="text-xs uppercase tracking-widest text-ink-soft mb-4">
          {new Date(post.date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}{" "}
          · {post.readMinutes} min read
        </p>
        <h1 className="font-display text-4xl md:text-6xl text-ink leading-[1.05]">
          {post.title}
        </h1>
      </Reveal>

      <Reveal delay={0.1} className="mt-12 rounded-2xl overflow-hidden aspect-video">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
      </Reveal>

      <Reveal delay={0.15} className="mt-12 space-y-6 text-lg text-ink-soft leading-relaxed">
        {post.content.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </Reveal>
    </article>
  );
}
