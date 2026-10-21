"use client";

import { useEffect, useRef, useState } from "react";

export type Frame = { src: string; alt: string };

const HOLD_MS = 5200;

// Pictures of the same framing that slowly replace each other, like light
// shifting in a room. It waits while off screen or in a hidden tab, and shows
// only the first picture under reduced motion.
export default function Crossfade({
  frames,
  width,
  height,
}: {
  frames: Frame[];
  width: number;
  height: number;
}) {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (frames.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visible = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.25 },
    );
    if (ref.current) io.observe(ref.current);
    const timer = window.setInterval(() => {
      if (visible && document.visibilityState === "visible") {
        setIndex((i) => (i + 1) % frames.length);
      }
    }, HOLD_MS);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, [frames.length]);

  return (
    <div className="crossfade" ref={ref}>
      {frames.map((frame, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={frame.src}
          src={frame.src}
          width={width}
          height={height}
          alt={i === index ? frame.alt : ""}
          aria-hidden={i === index ? undefined : true}
          loading="lazy"
          decoding="async"
          className={i === index ? "is-shown" : undefined}
        />
      ))}
    </div>
  );
}
