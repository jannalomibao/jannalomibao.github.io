import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { getPost } from "@/api/posts";
import { ApiError } from "@/api/client";
import Reveal from "@/components/ui/Reveal";
import ParallaxImage from "@/components/ui/ParallaxImage";
import Skeleton from "@/components/ui/Skeleton";
import { ErrorMessage } from "@/components/ui/AsyncState";

export default function BlogDetail() {
  const { slug } = useParams();
  const { data: post, loading, error } = useApi(() => getPost(slug!), [slug]);

  const notFound = error instanceof ApiError && error.status === 404;

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
      </Reveal>

      {loading && (
        <div className="mt-4 space-y-6">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="aspect-video rounded-2xl mt-8" />
        </div>
      )}

      {notFound && (
        <ErrorMessage message="This post doesn't exist, or isn't published anymore." />
      )}

      {error && !notFound && <ErrorMessage message="Couldn't load this post right now." />}

      {!loading && !error && post && (
        <>
          <Reveal>
            <p className="text-xs uppercase tracking-widest text-ink-soft mb-4">
              {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString("en-US", {
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

          <Reveal delay={0.1} className="mt-12">
            <ParallaxImage
              src={post.imageUrl}
              alt={post.title}
              className="rounded-2xl aspect-video"
            />
          </Reveal>

          <Reveal delay={0.15} className="mt-12 space-y-6 text-lg text-ink-soft leading-relaxed">
            {post.content.split(/\n\n+/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </Reveal>
        </>
      )}
    </article>
  );
}
