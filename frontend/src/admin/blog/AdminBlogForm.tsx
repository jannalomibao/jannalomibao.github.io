import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminApiError } from "@/admin/api/client";
import { createPost, listPosts, updatePost } from "./api";
import { emptyPostForm, type PostFormValues } from "./types";

export default function AdminBlogForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [values, setValues] = useState<PostFormValues>(emptyPostForm);
  const [loading, setLoading] = useState(isEdit);
  const [notFound, setNotFound] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    listPosts()
      .then((posts) => {
        const post = posts.find((p) => p.id === id);
        if (!post) {
          setNotFound(true);
          return;
        }
        setValues({
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          imageUrl: post.imageUrl,
          readMinutes: post.readMinutes,
          published: post.published,
        });
      })
      .catch((err: Error) => setErrors([err.message]))
      .finally(() => setLoading(false));
  }, [id]);

  function update<K extends keyof PostFormValues>(key: K, value: PostFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      if (isEdit && id) {
        const { slug: _slug, ...rest } = values;
        await updatePost(id, rest);
      } else {
        // Create mode never sends `published` — see api.ts's comment on why.
        const { published: _published, ...rest } = values;
        await createPost(rest);
      }
      navigate("/admin/blog");
    } catch (err) {
      setErrors(err instanceof AdminApiError ? err.messages : ["Something went wrong."]);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-ink-soft text-sm">Loading…</p>;
  }

  if (notFound) {
    return <p className="text-ink-soft text-sm">Post not found.</p>;
  }

  return (
    <div className="max-w-xl">
      <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-3">
        {isEdit ? "Edit post" : "New post"}
      </p>
      <h1 className="font-display text-3xl text-ink mb-8">
        {isEdit ? values.title || "Edit post" : "New post"}
      </h1>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="slug" className="block text-sm text-ink-soft mb-2">
            Slug
          </label>
          <input
            id="slug"
            type="text"
            required
            disabled={isEdit}
            value={values.slug}
            onChange={(e) => update("slug", e.target.value)}
            placeholder="my-post-slug"
            className="w-full bg-transparent border-b border-line focus:border-ink outline-none py-3 text-ink transition-colors disabled:text-ink-soft disabled:cursor-not-allowed"
          />
          {isEdit && (
            <p className="text-xs text-ink-soft mt-1">Slug can't be changed after creation.</p>
          )}
        </div>

        <div>
          <label htmlFor="title" className="block text-sm text-ink-soft mb-2">
            Title
          </label>
          <input
            id="title"
            type="text"
            required
            value={values.title}
            onChange={(e) => update("title", e.target.value)}
            className="w-full bg-transparent border-b border-line focus:border-ink outline-none py-3 text-ink transition-colors"
          />
        </div>

        <div>
          <label htmlFor="excerpt" className="block text-sm text-ink-soft mb-2">
            Excerpt
          </label>
          <input
            id="excerpt"
            type="text"
            required
            value={values.excerpt}
            onChange={(e) => update("excerpt", e.target.value)}
            className="w-full bg-transparent border-b border-line focus:border-ink outline-none py-3 text-ink transition-colors"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm text-ink-soft mb-2">
            Content
          </label>
          <textarea
            id="content"
            required
            rows={6}
            value={values.content}
            onChange={(e) => update("content", e.target.value)}
            className="w-full bg-transparent border-b border-line focus:border-ink outline-none py-3 text-ink transition-colors resize-none"
          />
        </div>

        <div>
          <label htmlFor="imageUrl" className="block text-sm text-ink-soft mb-2">
            Image URL
          </label>
          <input
            id="imageUrl"
            type="text"
            required
            value={values.imageUrl}
            onChange={(e) => update("imageUrl", e.target.value)}
            className="w-full bg-transparent border-b border-line focus:border-ink outline-none py-3 text-ink transition-colors"
          />
        </div>

        <div>
          <label htmlFor="readMinutes" className="block text-sm text-ink-soft mb-2">
            Read minutes
          </label>
          <input
            id="readMinutes"
            type="number"
            min={1}
            required
            value={values.readMinutes}
            onChange={(e) => update("readMinutes", Number(e.target.value))}
            className="w-32 bg-transparent border-b border-line focus:border-ink outline-none py-3 text-ink transition-colors"
          />
        </div>

        {/* Publish toggle only exists in edit mode — new posts always start
            as drafts (docs/07-api-contract.md §5), so there's nothing to
            toggle until the post exists. */}
        {isEdit && (
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={values.published}
              onChange={(e) => update("published", e.target.checked)}
            />
            Published
          </label>
        )}

        {errors.length > 0 && (
          <ul role="alert" className="text-accent text-sm space-y-1">
            {errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 bg-ink text-paper px-6 py-3.5 rounded-full text-sm hover:bg-accent transition-colors disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
