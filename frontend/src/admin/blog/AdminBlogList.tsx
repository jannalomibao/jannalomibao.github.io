import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import ConfirmDeleteButton from "@/components/admin/ConfirmDeleteButton";
import { deletePost, listPosts } from "./api";
import type { AdminPost } from "./types";

export default function AdminBlogList() {
  const [posts, setPosts] = useState<AdminPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setError(null);
    listPosts()
      .then(setPosts)
      .catch((err: Error) => setError(err.message));
  }

  async function handleDelete(id: string) {
    try {
      await deletePost(id);
      setPosts((current) => current?.filter((p) => p.id !== id) ?? null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-3">Blog</p>
          <h1 className="font-display text-3xl text-ink">Manage posts</h1>
        </div>
        <Link
          to="/admin/blog/new"
          className="inline-flex items-center gap-2 bg-ink text-paper px-5 py-2.5 rounded-full text-sm hover:bg-accent transition-colors"
        >
          <Plus size={16} /> New post
        </Link>
      </div>

      {error && <p className="text-accent text-sm mb-4">{error}</p>}

      {posts === null && !error && <p className="text-ink-soft text-sm">Loading…</p>}

      {posts?.length === 0 && <p className="text-ink-soft text-sm">No posts yet.</p>}

      {posts && posts.length > 0 && (
        <div className="border-t border-line divide-y divide-line">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  aria-label={post.published ? "Published" : "Not published"}
                  title={post.published ? "Published" : "Not published"}
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    post.published ? "bg-accent" : "bg-line"
                  }`}
                />
                <span className="font-display text-lg text-ink truncate">{post.title}</span>
                <span className="text-xs text-ink-soft shrink-0">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <Link
                  to={`/admin/blog/${post.id}`}
                  className="text-xs text-ink-soft hover:text-ink"
                >
                  Edit
                </Link>
                <ConfirmDeleteButton onConfirm={() => handleDelete(post.id)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
