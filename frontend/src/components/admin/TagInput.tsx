import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

// Type a value, press Enter or "," to add it as a tag. Used for `stack`
// here (story 003) and reused for `skills` in story 005 — kept generic
// rather than project-specific.
export default function TagInput({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function commitDraft() {
    const value = draft.trim();
    if (value && !values.includes(value)) {
      onChange([...values, value]);
    }
    setDraft("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
    } else if (e.key === "Backspace" && draft === "" && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  function removeAt(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label htmlFor={`tag-input-${label}`} className="block text-sm text-ink-soft mb-2">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-2 border-b border-line focus-within:border-ink py-2 transition-colors">
        {values.map((value, i) => (
          <span
            key={value}
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-line text-ink-soft"
          >
            {value}
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label={`Remove ${value}`}
              className="hover:text-accent"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          id={`tag-input-${label}`}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitDraft}
          placeholder={values.length === 0 ? "Type and press Enter" : ""}
          className="flex-1 min-w-[8ch] bg-transparent outline-none text-sm text-ink py-1"
        />
      </div>
    </div>
  );
}
