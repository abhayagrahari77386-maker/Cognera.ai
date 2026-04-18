import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Flame, ArrowRight, Sparkles, Map, Target } from "lucide-react";
import heroImg from "@/assets/hero-ai.jpg";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section id="home" className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-[#F8FAFC] border-b border-[#E2E8F0]">
      <div className="container relative grid lg:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <div className="space-y-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-[#F1F5F9] border border-[#E2E8F0] px-4 py-2 rounded-full text-sm">
            <Sparkles className="h-4 w-4 text-[#3B82F6]" />
            <span className="text-[#64748B]">AI-Powered Career Intelligence</span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] text-[#0F172A]">
            Confused About Your{" "}
            <span className="text-[#3B82F6]">Career Path?</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
            Cognera AI helps you discover the right career using AI-powered analysis,
            skill evaluation, and personalized roadmaps.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button variant="hero" size="lg" onClick={() => navigate("/assessment")}>
              Start Assessment <Flame className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="glass" size="lg" onClick={() => navigate("/explore")}>
              Explore Careers <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            {[
              { icon: Sparkles, label: "AI Analysis", path: "/assessment" },
              { icon: Map, label: "Roadmaps", path: "/counselor" },
              { icon: Target, label: "Skill Gap Analyzer", path: "/skill-gap" },
            ].map((tag) => (
              <div
                key={tag.label}
                onClick={() => navigate(tag.path)}
                className="cursor-pointer bg-white border border-[#E5E7EB] px-4 py-2 rounded-full text-sm flex items-center gap-2 hover:border-[#3B82F6] transition-all shadow-soft text-[#334155]"
              >
                <tag.icon className="h-4 w-4 text-[#3B82F6]" />
                <span>{tag.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="relative animate-scale-in">
          <div className="relative bg-white rounded-3xl p-3 shadow-elevated border border-border">
            <img
              src={heroImg}
              alt="Discover job opportunities suited to your skills"
              className="rounded-2xl w-full aspect-[4/3] object-contain bg-[#F1F5F9]"
            />
          </div>
          {/* Floating chips */}
          <div className="absolute -top-4 -left-4 bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 animate-float shadow-soft">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#3B82F6]" />
              <span className="text-sm font-medium text-[#0F172A]">98% Match Rate</span>
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 animate-float-slow shadow-soft">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#3B82F6]" />
              <span className="text-sm font-medium text-[#0F172A]">50K+ Careers Mapped</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
