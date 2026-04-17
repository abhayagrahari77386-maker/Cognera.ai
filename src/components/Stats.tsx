import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 50000, suffix: "+", label: "Students Guided" },
  { value: 1200, suffix: "+", label: "Career Paths Available" },
  { value: 85000, suffix: "+", label: "Roadmaps Generated" },
];

const Counter = ({ end, suffix }: { end: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const start = Date.now();
          const tick = () => {
            const p = Math.min((Date.now() - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setCount(Math.floor(eased * end));
            if (p < 1) requestAnimationFrame(tick);
          };
          tick();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const Stats = () => {
  return (
    <section className="py-20 relative">
      <div className="container relative">
        <div className="grid md:grid-cols-3 gap-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className="glass rounded-2xl p-8 text-center hover:border-primary/40 hover:shadow-glow transition-all duration-500"
            >
              <div className="font-display text-5xl md:text-6xl font-bold text-gradient mb-2">
                <Counter end={s.value} suffix={s.suffix} />
              </div>
              <p className="text-muted-foreground font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
