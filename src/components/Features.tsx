import { useNavigate } from "react-router-dom";
import { Bot, BarChart3, Compass, Target } from "lucide-react";

const features = [
  {
    icon: Bot,
    emoji: "🤖",
    title: "AI Counselor",
    desc: "Chat with an intelligent counselor that understands your strengths, interests, and goals.",
    color: "from-primary to-primary-glow",
    path: "/counselor",
  },
  {
    icon: BarChart3,
    emoji: "📊",
    title: "Skill Gap Analyzer",
    desc: "Identify the exact skills you need to land your dream career — with precision.",
    color: "from-secondary to-primary",
    path: "/skill-gap",
  },
  {
    icon: Compass,
    emoji: "🧭",
    title: "Career Roadmap",
    desc: "Personalized step-by-step roadmaps designed by AI for your unique journey.",
    color: "from-primary to-secondary",
    path: "/assessment",
  },
  {
    icon: Target,
    emoji: "🎯",
    title: "Career Match",
    desc: "Discover careers that perfectly align with your personality and aspirations.",
    color: "from-secondary to-primary-glow",
    path: "/assessment",
  },
];

const Features = () => {
  const navigate = useNavigate();

  return (
    <section id="features" className="py-20 lg:py-28 relative">
      <div className="glow-orb w-[400px] h-[400px] bg-secondary/30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="container relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex glass px-4 py-2 rounded-full text-sm mb-6">
            <span className="text-primary">✦ Premium Features</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Everything you need to <span className="text-gradient">choose smarter</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Four powerful AI tools working together to map your future.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              onClick={() => navigate(f.path)}
              className="group relative glass rounded-2xl p-6 transition-all duration-500 hover:-translate-y-2 hover:border-primary/40 hover:shadow-glow cursor-pointer"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity" />
              <div className={`relative inline-flex p-3 rounded-xl bg-gradient-to-br ${f.color} mb-4 shadow-glow`}>
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-2">
                {f.title} <span className="text-base">{f.emoji}</span>
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
