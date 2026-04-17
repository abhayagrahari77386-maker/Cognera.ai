import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Flame, ArrowRight, Sparkles, Map, Target } from "lucide-react";
import heroImg from "@/assets/hero-ai.jpg";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section id="home" className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
      {/* Background grid + glows */}
      <div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
      <div className="glow-orb w-[500px] h-[500px] bg-primary/40 -top-32 -left-32 animate-float-slow" />
      <div className="glow-orb w-[400px] h-[400px] bg-secondary/40 top-40 right-0 animate-float" />

      <div className="container relative grid lg:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <div className="space-y-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">AI-Powered Career Intelligence</span>
          </div>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05]">
            Confused About Your{" "}
            <span className="text-gradient">Career Path?</span>
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
              { icon: Sparkles, label: "AI Analysis" },
              { icon: Map, label: "Roadmaps" },
              { icon: Target, label: "Skill Gap Check" },
            ].map((tag) => (
              <div
                key={tag.label}
                className="glass px-4 py-2 rounded-full text-sm flex items-center gap-2 hover:border-primary/40 transition-all hover:shadow-glow"
              >
                <tag.icon className="h-4 w-4 text-primary" />
                <span>{tag.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="relative animate-scale-in">
          <div className="absolute inset-0 bg-gradient-primary opacity-30 blur-3xl rounded-full" />
          <div className="relative glass rounded-3xl p-3 shadow-elevated animate-pulse-glow">
            <img
              src={heroImg}
              alt="Discover job opportunities suited to your skills"
              className="rounded-2xl w-full aspect-[4/3] object-contain bg-background/40"
            />
          </div>
          {/* Floating chips */}
          <div className="absolute -top-4 -left-4 glass rounded-xl px-4 py-3 animate-float shadow-glow">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium">98% Match Rate</span>
            </div>
          </div>
          <div className="absolute -bottom-4 -right-4 glass rounded-xl px-4 py-3 animate-float-slow shadow-glow-purple">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium">50K+ Careers Mapped</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
