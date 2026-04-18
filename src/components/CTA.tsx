import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section id="cta" className="py-20 lg:py-32">
      <div className="container">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#3B82F6] p-12 md:p-24 text-center shadow-elevated border border-[#2563EB]">
          {/* Subtle accent bloom */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-50" />
          
          <div className="relative max-w-3xl mx-auto">
            <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
              Ready to build your future with AI guidance?
            </h2>
            <p className="text-xl text-blue-50 mb-12 max-w-xl mx-auto font-medium">
              Join thousands of students who turned confusion into clarity with Cognera AI.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/assessment")}
              className="bg-white text-[#3B82F6] hover:bg-blue-50 text-lg font-bold px-10 py-8 rounded-full shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Your Journey <Flame className="ml-2 h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
