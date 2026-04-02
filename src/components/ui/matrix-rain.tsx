"use client";

import { useEffect, useRef, useCallback } from "react";

const WORDS = [
  "wilson", "CI", "95%", "z-score", "p<0.05", "σ", "μ", "Σ", "n=20",
  "win_rate", "0.62", "percentile", "outlier", "mean()", "std()",
  "fetch()", "async", "await", "return", "const", "=>", "null",
  "import", "export", "true", "false", "0x00D68F", "parseInt",
  "if(p<α)", "reject", "H0", "χ²", "df=14", "R²=0.87",
  "map()", "filter()", "reduce()", "{}", "[]", "===", "!==",
  "data[i]", "for(;;)", "while", "break", "catch", "try",
  "0.321", "0.584", "±1.96", "ln(x)", "∫dx", "Δ", "λ",
];
const FONT_SIZE = 11;
const LINE_HEIGHT = 16;
const COL_WIDTH = 90;
const BASE_SPEED = 0.3;
const MOUSE_RADIUS = 200;

interface Drop {
  x: number;
  y: number;
  speed: number;
  tokens: string[];
  length: number;
  opacity: number;
}

const randomToken = () => WORDS[Math.floor(Math.random() * WORDS.length)];

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const dropsRef = useRef<Drop[]>([]);
  const rafRef = useRef<number>(0);

  const createDrop = useCallback((x: number, canvasHeight: number): Drop => {
    const length = 6 + Math.floor(Math.random() * 14);
    return {
      x,
      y: -Math.random() * canvasHeight,
      speed: BASE_SPEED + Math.random() * 0.5,
      tokens: Array.from({ length }, randomToken),
      length,
      opacity: 0.12 + Math.random() * 0.15,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      const cols = Math.floor(canvas.width / COL_WIDTH);
      dropsRef.current = Array.from({ length: cols }, (_, i) =>
        createDrop(i * COL_WIDTH + 10 + Math.random() * 20, canvas.height)
      );
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    window.addEventListener("mousemove", handleMouse);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      ctx.font = `${FONT_SIZE}px monospace`;

      for (const drop of dropsRef.current) {
        const dx = drop.x - mx;
        const dy = drop.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseInfluence = Math.max(0, 1 - dist / MOUSE_RADIUS);

        const speed = drop.speed + mouseInfluence * 1.8;
        drop.y += speed;

        if (drop.y - drop.length * LINE_HEIGHT > canvas.height) {
          drop.y = -drop.length * LINE_HEIGHT;
          drop.speed = BASE_SPEED + Math.random() * 0.5;
          drop.tokens = Array.from({ length: drop.length }, randomToken);
        }

        // Randomly mutate a token
        if (Math.random() < 0.01) {
          const idx = Math.floor(Math.random() * drop.length);
          drop.tokens[idx] = randomToken();
        }

        const baseOpacity = drop.opacity + mouseInfluence * 0.45;

        for (let j = 0; j < drop.length; j++) {
          const cy = drop.y - j * LINE_HEIGHT;
          if (cy < -LINE_HEIGHT || cy > canvas.height + LINE_HEIGHT) continue;

          const fade = 1 - j / drop.length;
          const alpha = baseOpacity * fade;

          if (j === 0) {
            ctx.fillStyle = `rgba(0, 214, 143, ${Math.min(alpha * 2.5, 1)})`;
          } else {
            ctx.fillStyle = `rgba(0, 214, 143, ${alpha})`;
          }

          ctx.fillText(drop.tokens[j], drop.x, cy);
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, [createDrop]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
