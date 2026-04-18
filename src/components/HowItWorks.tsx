import { useNavigate } from "react-router-dom";
import { UserCircle, Cpu, Map, MessageCircle, ArrowRight } from "lucide-react";

const steps = [
  { icon: UserCircle, title: "Enter Details", desc: "Share your interests, skills & goals.", path: "/assessment" },
  { icon: Cpu, title: "AI Analysis", desc: "Our AI analyzes your unique profile.", path: "/assessment" },
  { icon: Map, title: "Get Roadmap", desc: "Receive a personalized career path.", path: "/assessment" },
  { icon: MessageCircle, title: "Chat & Explore", desc: "Refine with our AI counselor.", path: "/counselor" },
];

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <section id="how" className="py-20 lg:py-28 relative bg-[#F8FAFC]">
      <div className="container relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex bg-[#DBEAFE] px-4 py-2 rounded-full text-sm mb-6">
            <span className="text-[#1D4ED8] font-medium">⚡ Process</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-[#0F172A]">
            How <span className="text-[#3B82F6]">Cognera</span> works
          </h2>
          <p className="text-[#64748B] text-lg">Four simple steps to clarity.</p>
        </div>

        <div className="relative">
          {/* connecting line */}
          <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-px bg-[#E2E8F0]" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div 
                key={s.title} 
                onClick={() => navigate(s.path)}
                className="relative flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="relative mb-6">
                  <div className="relative w-24 h-24 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft flex items-center justify-center group-hover:scale-105 transition-all duration-300">
                    <s.icon className="h-10 w-10 text-[#3B82F6]" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#3B82F6] flex items-center justify-center text-xs font-bold text-white shadow-soft">
                      {i + 1}
                    </div>
                  </div>
                </div>
                <h3 className="font-display text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground max-w-xs">{s.desc}</p>

                {i < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-10 -right-6 h-6 w-6 text-primary/60" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
