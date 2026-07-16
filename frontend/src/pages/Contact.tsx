import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { profile } from "@/data/content";
import Reveal from "@/components/ui/Reveal";

type Status = "idle" | "submitting" | "success";

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const message = String(form.get("message") || "").trim();

    const nextErrors: Record<string, string> = {};
    if (!name) nextErrors.name = "Name is required.";
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "A valid email is required.";
    if (!message) nextErrors.message = "Message is required.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // No backend wired up yet — this simulates submission.
    // TODO: POST to NestJS API once the backend is available.
    setStatus("submitting");
    setTimeout(() => setStatus("success"), 600);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-10 py-16 md:py-24">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-6 flex items-center gap-3">
          <span className="w-8 h-px bg-accent inline-block" />
          Contact
        </p>
        <h1 className="font-display text-5xl md:text-7xl text-ink leading-[1.02]">
          Let's talk.
        </h1>
        <p className="text-lg text-ink-soft mt-6 max-w-lg">
          Open to opportunities, collaborations, or just a good conversation about software.
          Reach out directly or use the form below.
        </p>
        <a
          href={`mailto:${profile.email}`}
          className="inline-flex items-center gap-2 mt-6 text-ink border-b border-ink pb-1 hover:text-accent hover:border-accent transition-colors"
          data-cursor-hover
        >
          {profile.email} <ArrowUpRight size={16} />
        </a>
      </Reveal>

      <Reveal delay={0.1} className="mt-16">
        {status === "success" ? (
          <div className="flex items-center gap-3 rounded-2xl border border-line p-8 text-ink">
            <CheckCircle2 className="text-accent" size={24} />
            <p>Thanks for reaching out — I'll get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm text-ink-soft mb-2">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="w-full bg-transparent border-b border-line focus:border-ink outline-none py-3 text-ink transition-colors"
                placeholder="Your name"
              />
              {errors.name && <p className="text-accent text-sm mt-2">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm text-ink-soft mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="w-full bg-transparent border-b border-line focus:border-ink outline-none py-3 text-ink transition-colors"
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-accent text-sm mt-2">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="message" className="block text-sm text-ink-soft mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className="w-full bg-transparent border-b border-line focus:border-ink outline-none py-3 text-ink transition-colors resize-none"
                placeholder="What's on your mind?"
              />
              {errors.message && <p className="text-accent text-sm mt-2">{errors.message}</p>}
            </div>

            <button
              type="submit"
              disabled={status === "submitting"}
              data-cursor-hover
              className="inline-flex items-center gap-2 bg-ink text-paper px-6 py-3.5 rounded-full text-sm hover:bg-accent transition-colors disabled:opacity-60"
            >
              {status === "submitting" ? "Sending..." : "Send message"}
            </button>
          </form>
        )}
      </Reveal>
    </div>
  );
}
