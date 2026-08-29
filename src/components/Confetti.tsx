import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  delay: number;
  distance: number;
  duration: number;
}

const COLORS = [
  "var(--color-primary)",
  "var(--color-primary-glow)",
  "var(--color-accent)",
  "var(--color-secondary)",
  "var(--color-foreground)",
];

export function ConfettiBurst({ active, origin = "center" }: { active: boolean; origin?: "center" | "bottom" }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) return;
    setVisible(true);
    const next: Particle[] = Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 20,
      y: origin === "bottom" ? 90 : 55,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 4 + Math.random() * 5,
      rotation: Math.random() * 360,
      delay: Math.random() * 120,
      distance: 60 + Math.random() * 90,
      duration: 700 + Math.random() * 400,
    }));
    setParticles(next);
    const id = window.setTimeout(() => {
      setVisible(false);
      setParticles([]);
    }, 1400);
    return () => window.clearTimeout(id);
  }, [active, origin]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="confetti-particle absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`,
            animationDelay: `${p.delay}ms`,
            "--cp-distance": `${p.distance}px`,
            "--cp-duration": `${p.duration}ms`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
