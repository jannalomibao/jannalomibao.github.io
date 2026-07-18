import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Subtle scroll-driven depth parallax for images, applied site-wide
 * (docs/tasks/001-scroll-parallax-images.md). The y-offset lives on a
 * wrapping motion.div, not the <img> itself, so it never collides with the
 * plain-CSS `group-hover:scale-105` transform some call sites already put on
 * the image — two separate elements each own their own `transform`.
 */
export default function ParallaxImage({
  src,
  alt,
  className,
  imgClassName,
  offset = 15,
  children,
}: {
  src: string;
  alt: string;
  /** Outer box: aspect ratio, rounded corners, background — no overflow/position, owned here. */
  className?: string;
  /** Extra classes on the <img> itself, e.g. an existing hover-scale transition. */
  imgClassName?: string;
  /** Max px of vertical drift each direction. Design system §8: keep this in the 10–30px range. */
  offset?: number;
  /** Absolutely-positioned overlays/badges layered on top of the image, same stacking as before. */
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);

  return (
    <div
      ref={ref}
      data-testid="parallax-box"
      className={`relative overflow-hidden ${className ?? ""}`}
    >
      {/* Overscan (3rem taller than the box, centered) so the translateY range
          never reveals empty space at the top/bottom edge — comfortably covers
          the default ±15px offset with margin to spare. */}
      <motion.div
        data-testid="parallax-track"
        className="absolute inset-x-0 -top-6 -bottom-6"
        style={reduceMotion ? undefined : { y }}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`w-full h-full object-cover ${imgClassName ?? ""}`}
        />
      </motion.div>
      {children}
    </div>
  );
}
