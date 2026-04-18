import { X, Check } from "lucide-react";

const problems = ["No proper guidance", "Confusion about future", "Wrong career choices", "Wasted years & money"];
const solutions = ["AI-powered Recommendations", "Personalized Roadmaps", "Skill Gap Analysis", "Real career insights"];

const ProblemSolution = () => {
  return (
    <section className="py-20 lg:py-28 relative bg-white">
      <div className="container relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-[#0F172A]">
            From <span className="text-[#EF4444]">chaos</span> to <span className="text-[#3B82F6]">clarity</span>
          </h2>
          <p className="text-[#64748B] text-lg">See the difference Cognera AI makes.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Problem */}
          <div className="relative bg-white border border-[#E5E7EB] rounded-3xl p-8 overflow-hidden shadow-soft">
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[#EF4444] text-sm font-semibold mb-6">
                <X className="h-4 w-4" /> Without Cognera
              </div>
              <h3 className="font-display text-2xl font-bold mb-6 text-[#0F172A]">The struggle is real</h3>
              <ul className="space-y-4">
                {problems.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <div className="mt-1 p-1 rounded-full bg-red-100">
                      <X className="h-4 w-4 text-[#EF4444]" />
                    </div>
                    <span className="text-[#64748B]">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Solution */}
          <div className="relative bg-white border border-[#3B82F6]/30 rounded-3xl p-8 overflow-hidden shadow-elevated">
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#3B82F6] text-sm font-semibold mb-6">
                <Check className="h-4 w-4" /> With Cognera AI
              </div>
              <h3 className="font-display text-2xl font-bold mb-6 text-[#3B82F6]">A clear path forward</h3>
              <ul className="space-y-4">
                {solutions.map((s) => (
                  <li key={s} className="flex items-start gap-3">
                    <div className="mt-1 p-1 rounded-full bg-blue-100">
                      <Check className="h-4 w-4 text-[#3B82F6]" />
                    </div>
                    <span className="text-[#334155] font-medium">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
