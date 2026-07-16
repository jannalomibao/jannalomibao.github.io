import { useEffect, useRef } from "react";

export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const move = (e: MouseEvent) => {
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
    };

    const grow = () => {
      el.style.width = "40px";
      el.style.height = "40px";
      el.style.backgroundColor = "var(--color-accent)";
    };

    const shrink = () => {
      el.style.width = "14px";
      el.style.height = "14px";
      el.style.backgroundColor = "var(--color-ink)";
    };

    const over = (e: MouseEvent) => {
      if ((e.target as Element).closest?.("a, button, [data-cursor-hover]")) grow();
    };
    const out = (e: MouseEvent) => {
      if ((e.target as Element).closest?.("a, button, [data-cursor-hover]")) shrink();
    };

    window.addEventListener("mousemove", move);
    document.addEventListener("mouseover", over);
    document.addEventListener("mouseout", out);

    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", over);
      document.removeEventListener("mouseout", out);
    };
  }, []);

  return <div ref={ref} className="custom-cursor hidden md:block" />;
}
