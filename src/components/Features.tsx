import { useNavigate } from "react-router-dom";
import { Bot, BarChart3, Compass, Target } from "lucide-react";

const features = [
  {
    icon: Bot,
    emoji: "🤖",
    title: "AI Counselor",
    desc: "Chat with an intelligent counselor that understands your strengths, interests, and goals.",
    color: "bg-[#DBEAFE] text-[#1D4ED8]",
    path: "/counselor",
  },
  {
    icon: BarChart3,
    emoji: "📊",
    title: "Skill Gap Analyzer",
    desc: "Identify the exact skills you need to land your dream career — with precision.",
    color: "bg-[#F1F5F9] text-[#475569]",
    path: "/skill-gap",
  },
  {
    icon: Compass,
    emoji: "🧭",
    title: "Career Roadmap",
    desc: "Personalized step-by-step roadmaps designed by AI for your unique journey.",
    color: "bg-[#EFF6FF] text-[#2563EB]",
    path: "/assessment",
  },
  {
    icon: Target,
    emoji: "🎯",
    title: "Career Match",
    desc: "Discover careers that perfectly align with your personality and aspirations.",
    color: "bg-[#F0FDF4] text-[#166534]",
    path: "/assessment",
  },
];

const Features = () => {
  const navigate = useNavigate();

  return (
    <section id="features" className="py-20 lg:py-28 relative bg-white">
      <div className="container relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex bg-[#DBEAFE] px-4 py-2 rounded-full text-sm mb-6">
            <span className="text-[#1D4ED8] font-medium">✦ Premium Features</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-[#0F172A]">
            Everything you need to <span className="text-[#3B82F6]">choose smarter</span>
          </h2>
          <p className="text-[#64748B] text-lg">
            Four powerful AI tools working together to map your future.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              onClick={() => navigate(f.path)}
              className="group relative bg-white border border-[#E5E7EB] rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated cursor-pointer"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className={`relative inline-flex p-3 rounded-xl ${f.color} mb-6`}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3 flex items-center gap-2 text-[#0F172A]">
                {f.title} <span className="text-base">{f.emoji}</span>
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
