"use client";

import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/lib/use-client-hooks";
import { Canvas } from "@react-three/fiber";
import { Float, Sparkles, MeshDistortMaterial, AdaptiveDpr } from "@react-three/drei";
import { useReducedMotion } from "motion/react";

// Blob de ambiente: icosaedro distorsionado (menos vértices que una esfera 64x64).
function Blob() {
  return (
    <Float speed={1.1} rotationIntensity={0.85} floatIntensity={1.2}>
      <mesh scale={2.2} position={[1.4, 0.2, 0]}>
        <icosahedronGeometry args={[1, 6]} />
        <MeshDistortMaterial color="#2f4d86" distort={0.38} speed={1.1} roughness={0.25} metalness={0.6} />
      </mesh>
    </Float>
  );
}

// PERFORMANCE: el 3D solo se monta en desktop + sin prefers-reduced-motion, y el render
// loop se PAUSA (frameloop="never") cuando el hero sale del viewport. En mobile/reduce
// no se monta nada (el glow CSS del hero queda de fondo). Esto ataca el "muy lenta".
export default function Hero3DScene() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const enabled = !reduce && isDesktop; // 3D solo en desktop + sin reduced-motion
  const [inView, setInView] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      rootMargin: "120px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [enabled]);

  if (reduce) return null;

  return (
    <div ref={ref} className="absolute inset-0">
      {enabled && (
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          frameloop={inView ? "always" : "never"}
        >
          <AdaptiveDpr pixelated />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1.3} color="#c3cbe0" />
          <directionalLight position={[-5, -2, 2]} intensity={0.7} color="#5e6f93" />
          <Blob />
          <Sparkles count={26} scale={[12, 8, 4]} size={2} speed={0.22} color="#c9d2e6" opacity={0.38} />
        </Canvas>
      )}
    </div>
  );
}
