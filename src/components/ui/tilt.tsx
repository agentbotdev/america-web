"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { ReactNode } from "react";
import { useMediaQuery } from "@/lib/use-client-hooks";

// Tilt 3D al mover el mouse. PERFORMANCE: cachea el rect en enter (no getBoundingClientRect
// por evento), throttlea con requestAnimationFrame, y se DESACTIVA en touch (pointer:coarse)
// donde no aporta y solo suma JS. Así no genera jank en grids largos.
export function Tilt({
  children,
  className,
  max = 6,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rect = useRef<DOMRect | null>(null);
  const raf = useRef<number | null>(null);
  const fine = useMediaQuery("(pointer: fine)");

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), { stiffness: 200, damping: 20 });

  // En mobile/touch: render plano, sin listeners ni springs.
  if (!fine) return <div className={className}>{children}</div>;

  function enter() {
    rect.current = ref.current?.getBoundingClientRect() ?? null;
  }
  function move(e: React.MouseEvent<HTMLDivElement>) {
    if (raf.current) return;
    const cx = e.clientX;
    const cy = e.clientY;
    raf.current = requestAnimationFrame(() => {
      raf.current = null;
      const r = rect.current;
      if (!r) return;
      x.set((cx - r.left) / r.width - 0.5);
      y.set((cy - r.top) / r.height - 0.5);
    });
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <div className={className} style={{ perspective: 1000 }}>
      <motion.div
        ref={ref}
        onMouseEnter={enter}
        onMouseMove={move}
        onMouseLeave={reset}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
