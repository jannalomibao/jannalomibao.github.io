import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { posts } from "@/data/content";
import Reveal from "@/components/ui/Reveal";
import ParallaxImage from "@/components/ui/ParallaxImage";

export default function Blog() {
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-6 flex items-center gap-3">
          <span className="w-8 h-px bg-accent inline-block" />
          Writing
        </p>
        <h1 className="font-display text-5xl md:text-7xl text-ink leading-[1.02] max-w-3xl">
          Notes on building things.
        </h1>
      </Reveal>

      <div className="mt-20 divide-y divide-line border-t border-line">
        {posts.map((post, i) => (
          <Reveal key={post.slug} delay={i * 0.05}>
            <Link
              to={`/blog/${post.slug}`}
              data-cursor-hover
              className="group flex flex-col md:flex-row md:items-center gap-6 py-10"
            >
              <div className="w-full md:w-56 shrink-0">
                <ParallaxImage
                  src={post.image}
                  alt={post.title}
                  className="aspect-[4/3] rounded-xl"
                  imgClassName="transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-widest text-ink-soft mb-2">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  · {post.readMinutes} min read
                </p>
                <h2 className="font-display text-2xl md:text-3xl text-ink group-hover:text-accent transition-colors">
                  {post.title}
                </h2>
                <p className="text-ink-soft mt-2 max-w-xl">{post.excerpt}</p>
              </div>
              <ArrowUpRight
                size={22}
                className="shrink-0 text-ink-soft transition-all duration-300 group-hover:text-accent group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
