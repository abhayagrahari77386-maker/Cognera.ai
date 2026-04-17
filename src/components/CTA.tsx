import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section id="cta" className="py-20 lg:py-28">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-12 md:p-20 text-center shadow-elevated">
          <div className="absolute inset-0 grid-bg opacity-20" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-glow/30 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/40 rounded-full blur-3xl animate-float" />

          <div className="relative max-w-3xl mx-auto">
            <h2 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Ready to build your future with{" "}
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                AI guidance?
              </span>
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-10 max-w-xl mx-auto">
              Join thousands of students who turned confusion into clarity with Cognera AI.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/assessment")}
              className="bg-background text-foreground hover:bg-background/90 text-base font-semibold px-8 py-6 rounded-full shadow-2xl hover:scale-105 transition-transform"
            >
              Start Your Journey <Flame className="ml-2 h-5 w-5 text-secondary" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
