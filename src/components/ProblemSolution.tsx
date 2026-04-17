import { X, Check } from "lucide-react";

const problems = ["No proper guidance", "Confusion about future", "Wrong career choices", "Wasted years & money"];
const solutions = ["AI-powered Recommendations", "Personalized Roadmaps", "Skill Gap Analysis", "Real career insights"];

const ProblemSolution = () => {
  return (
    <section className="py-20 lg:py-28 relative">
      <div className="container relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            From <span className="text-destructive">chaos</span> to <span className="text-gradient">clarity</span>
          </h2>
          <p className="text-muted-foreground text-lg">See the difference Cognera AI makes.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Problem */}
          <div className="relative glass rounded-3xl p-8 border-destructive/20 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-destructive/20 rounded-full blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/30 text-destructive text-sm font-semibold mb-6">
                <X className="h-4 w-4" /> Without Cognera
              </div>
              <h3 className="font-display text-2xl font-bold mb-6">The struggle is real</h3>
              <ul className="space-y-4">
                {problems.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <div className="mt-1 p-1 rounded-full bg-destructive/20">
                      <X className="h-4 w-4 text-destructive" />
                    </div>
                    <span className="text-muted-foreground">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Solution */}
          <div className="relative glass rounded-3xl p-8 border-success/30 overflow-hidden shadow-glow">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-success/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary/20 rounded-full blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/30 text-success text-sm font-semibold mb-6">
                <Check className="h-4 w-4" /> With Cognera AI
              </div>
              <h3 className="font-display text-2xl font-bold mb-6">A clear path forward</h3>
              <ul className="space-y-4">
                {solutions.map((s) => (
                  <li key={s} className="flex items-start gap-3">
                    <div className="mt-1 p-1 rounded-full bg-success/20">
                      <Check className="h-4 w-4 text-success" />
                    </div>
                    <span className="text-foreground font-medium">{s}</span>
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
