"use client";

import { useLayoutEffect, useRef } from "react";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function ReactiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const orbsRef = useRef({
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    x3: 0,
    y3: 0,
  });
  const rafRef = useRef<number>(0);
  const hasMouseRef = useRef(false);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function setSize() {
      const c = canvasRef.current;
      if (!c) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      c.width = w;
      c.height = h;
      if (!hasMouseRef.current) {
        mouseRef.current.x = w / 2;
        mouseRef.current.y = h / 2;
        orbsRef.current.x1 = w / 2;
        orbsRef.current.y1 = h / 2;
        orbsRef.current.x2 = w / 2;
        orbsRef.current.y2 = h / 2;
        orbsRef.current.x3 = w / 2;
        orbsRef.current.y3 = h / 2;
      }
    }

    function handleMouseMove(e: MouseEvent) {
      hasMouseRef.current = true;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    }

    setSize();
    window.addEventListener("resize", setSize);
    window.addEventListener("mousemove", handleMouseMove);

    let start: number;
    function loop(t: number) {
      const c = canvasRef.current;
      if (!c || !ctx) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      if (!start) start = t;
      start = t;

      const { x: tx, y: ty } = mouseRef.current;
      const orbs = orbsRef.current;

      // Orb 1 (Leader): fast ease toward mouse
      orbs.x1 = lerp(orbs.x1, tx, 0.1);
      orbs.y1 = lerp(orbs.y1, ty, 0.1);

      // Orb 2 (Trailer): slower ease toward Orb 1
      orbs.x2 = lerp(orbs.x2, orbs.x1, 0.05);
      orbs.y2 = lerp(orbs.y2, orbs.y1, 0.05);

      // Orb 3 (Drifter): toward Orb 2 + sine-wave oscillation
      const drift = Math.sin(t * 0.0008) * 80;
      const driftY = Math.cos(t * 0.0006) * 80;
      orbs.x3 = lerp(orbs.x3, orbs.x2 + drift, 0.05);
      orbs.y3 = lerp(orbs.y3, orbs.y2 + driftY, 0.05);

      const w = c.width;
      const h = c.height;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "screen";

      // Orb 1: Hot Pink/Red, radius 600
      const g1 = ctx.createRadialGradient(
        orbs.x1, orbs.y1, 0,
        orbs.x1, orbs.y1, 600
      );
      g1.addColorStop(0, "rgba(255, 50, 50, 0.4)");
      g1.addColorStop(1, "rgba(255, 50, 50, 0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w, h);

      // Orb 2: Deep Blue/Purple, radius 800
      const g2 = ctx.createRadialGradient(
        orbs.x2, orbs.y2, 0,
        orbs.x2, orbs.y2, 800
      );
      g2.addColorStop(0, "rgba(50, 50, 255, 0.3)");
      g2.addColorStop(1, "rgba(50, 50, 255, 0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w, h);

      // Orb 3: Teal/Cyan, radius 700
      const g3 = ctx.createRadialGradient(
        orbs.x3, orbs.y3, 0,
        orbs.x3, orbs.y3, 700
      );
      g3.addColorStop(0, "rgba(0, 200, 200, 0.2)");
      g3.addColorStop(1, "rgba(0, 200, 200, 0)");
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, w, h);

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", setSize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 h-full w-full bg-hot-black"
      style={{ filter: "blur(120px)" }}
      aria-hidden
    />
  );
}
