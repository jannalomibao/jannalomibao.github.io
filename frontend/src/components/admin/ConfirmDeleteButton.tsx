import { useState } from "react";

// Two-step inline confirm instead of a native window.confirm() — keeps the
// destructive-action confirmation in the same visual language as the rest
// of the admin UI, and is deterministic to drive in Playwright (no native
// dialog event handling required).
export default function ConfirmDeleteButton({
  onConfirm,
  label = "Delete",
}: {
  onConfirm: () => void;
  label?: string;
}) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2 text-xs">
        <span className="text-ink-soft">Delete?</span>
        <button
          type="button"
          onClick={onConfirm}
          className="text-accent hover:underline"
        >
          Confirm
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-ink-soft hover:text-ink hover:underline"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-xs text-ink-soft hover:text-accent"
    >
      {label}
    </button>
  );
}
