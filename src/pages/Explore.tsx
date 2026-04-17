import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Search, Sparkles, ArrowRight, Filter, Loader2, Check, Flame } from "lucide-react";
import { toast } from "sonner";

type Category =
  | "Technology"
  | "Medical"
  | "Business"
  | "Design"
  | "Government"
  | "Finance";

type SalaryBucket = "0-5" | "5-10" | "10-20" | "20+";

interface Career {
  id: string;
  title: string;
  category: Category;
  salaryMin: number; // LPA
  salaryMax: number; // LPA
  skills: string[];
  blurb: string;
}

interface RoadmapStep {
  step: number;
  title: string;
  details: string;
}

interface RoadmapData {
  title: string;
  overview: string;
  steps: RoadmapStep[];
  skills: string[];
  exams: string[];
  startingIncomeLPA: number;
  salaryRange: string;
  salaryEvidence: string[];
  verified: boolean;
}

const EMPTY_ROADMAP: RoadmapData = {
  title: "",
  overview: "",
  steps: [],
  skills: [],
  exams: [],
  startingIncomeLPA: 0,
  salaryRange: "",
  salaryEvidence: [],
  verified: false,
};

const CAREERS: Career[] = [
  {
    id: "swe",
    title: "Software Developer",
    category: "Technology",
    salaryMin: 6,
    salaryMax: 35,
    skills: ["JavaScript", "React", "Node.js", "Git", "DSA"],
    blurb: "Build apps, products and platforms used by millions.",
  },
  {
    id: "ds",
    title: "Data Scientist",
    category: "Technology",
    salaryMin: 8,
    salaryMax: 40,
    skills: ["Python", "SQL", "ML", "Statistics", "Pandas"],
    blurb: "Turn data into insights and predictive models.",
  },
  {
    id: "uiux",
    title: "UI/UX Designer",
    category: "Design",
    salaryMin: 5,
    salaryMax: 25,
    skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
    blurb: "Design intuitive, beautiful product experiences.",
  },
  {
    id: "cyber",
    title: "Cybersecurity Analyst",
    category: "Technology",
    salaryMin: 7,
    salaryMax: 30,
    skills: ["Networking", "Linux", "SIEM", "Pen Testing"],
    blurb: "Defend systems, data, and people from cyber threats.",
  },
  {
    id: "doctor",
    title: "Doctor",
    category: "Medical",
    salaryMin: 8,
    salaryMax: 50,
    skills: ["Biology", "Empathy", "Diagnosis", "MBBS"],
    blurb: "Diagnose, treat and care for patients across specialties.",
  },
  {
    id: "ba",
    title: "Business Analyst",
    category: "Business",
    salaryMin: 6,
    salaryMax: 22,
    skills: ["Excel", "SQL", "Power BI", "Communication"],
    blurb: "Bridge business goals with data-driven decisions.",
  },
  {
    id: "ias",
    title: "Civil Services (IAS/IPS)",
    category: "Government",
    salaryMin: 7,
    salaryMax: 25,
    skills: ["GS", "Polity", "Essay", "Leadership"],
    blurb: "Serve the nation through administration and policy.",
  },
  {
    id: "ca",
    title: "Chartered Accountant",
    category: "Finance",
    salaryMin: 7,
    salaryMax: 40,
    skills: ["Accounting", "Tax", "Audit", "Excel"],
    blurb: "Master finance, audit, taxation and advisory.",
  },
  {
    id: "pm",
    title: "Product Manager",
    category: "Business",
    salaryMin: 12,
    salaryMax: 60,
    skills: ["Strategy", "Analytics", "Roadmapping", "Communication"],
    blurb: "Lead products from idea to launch and growth.",
  },
  {
    id: "ml",
    title: "AI / ML Engineer",
    category: "Technology",
    salaryMin: 10,
    salaryMax: 70,
    skills: ["Python", "PyTorch", "LLMs", "MLOps"],
    blurb: "Build intelligent systems powered by modern AI.",
  },
  {
    id: "graphic",
    title: "Graphic Designer",
    category: "Design",
    salaryMin: 4,
    salaryMax: 18,
    skills: ["Illustrator", "Photoshop", "Branding", "Typography"],
    blurb: "Craft visuals that communicate ideas instantly.",
  },
  {
    id: "ib",
    title: "Investment Banker",
    category: "Finance",
    salaryMin: 15,
    salaryMax: 80,
    skills: ["Finance", "Modeling", "Valuation", "Excel"],
    blurb: "Advise on capital raising, M&A, and big deals.",
  },
];

const CATEGORIES: ("All" | Category)[] = [
  "All",
  "Technology",
  "Medical",
  "Business",
  "Design",
  "Government",
  "Finance",
];

const SALARY_BUCKETS: { id: SalaryBucket | "all"; label: string }[] = [
  { id: "all", label: "Any salary" },
  { id: "0-5", label: "0–5 LPA" },
  { id: "5-10", label: "5–10 LPA" },
  { id: "10-20", label: "10–20 LPA" },
  { id: "20+", label: "20+ LPA" },
];

function inSalary(c: Career, b: SalaryBucket | "all") {
  if (b === "all") return true;
  if (b === "0-5") return c.salaryMin <= 5;
  if (b === "5-10") return c.salaryMax >= 5 && c.salaryMin <= 10;
  if (b === "10-20") return c.salaryMax >= 10 && c.salaryMin <= 20;
  return c.salaryMax >= 20;
}

const Explore = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | Category>("All");
  const [salary, setSalary] = useState<SalaryBucket | "all">("all");
  
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CAREERS.filter((c) => {
      const matchesQ =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.skills.some((s) => s.toLowerCase().includes(q));
      const matchesCat = category === "All" || c.category === category;
      const matchesSal = inSalary(c, salary);
      return matchesQ && matchesCat && matchesSal;
    });
  }, [query, category, salary]);

  const fetchRoadmapByTitle = async (careerTitle: string) => {
    const cleanTitle = careerTitle.trim();
    if (!cleanTitle) {
      toast.error("Please enter a career title first.");
      return;
    }

    const matched = CAREERS.find((item) => item.title.toLowerCase() === cleanTitle.toLowerCase()) || null;
    setSelectedCareer(matched);
    setLoadingRoadmap(true);
    setShowRoadmap(true);
    setRoadmap(EMPTY_ROADMAP);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/roadmap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ careerTitle: cleanTitle }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch roadmap");
      }

      const data = (await response.json()) as RoadmapData;
      if (!data.verified) {
        throw new Error("Roadmap is not API-verified yet.");
      }
      setRoadmap(data);
    } catch (error) {
      console.error("Roadmap error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate trusted roadmap. Please try again."
      );
      setShowRoadmap(false);
    } finally {
      setLoadingRoadmap(false);
    }
  };

  const handleRoadmap = async (c: Career) => {
    await fetchRoadmapByTitle(c.title);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="glow-orb bg-primary/30 w-[420px] h-[420px] -top-20 -left-20 animate-float-slow" />
        <div className="glow-orb bg-secondary/30 w-[460px] h-[460px] top-1/2 -right-24 animate-float" />
      </div>

      <main className="container pt-32 pb-20">
        {/* Header */}
        <section className="text-center max-w-3xl mx-auto mb-10 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-5">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">
              Career Discovery
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Explore <span className="text-gradient">Careers</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Search roles, filter by salary and category, and discover what fits
            your strengths.
          </p>
        </section>

        {/* Search + Filters */}
        <section className="max-w-5xl mx-auto mb-10">
          <div className="glass-strong rounded-2xl p-4 md:p-5 shadow-card">
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search careers, skills, or roles…"
                  className="pl-9 h-12 bg-background/40 border-border/60 focus-visible:ring-primary/40"
                />
              </div>
              <Button variant="hero" size="lg" className="md:w-auto w-full">
                <Search className="mr-1 h-4 w-4" /> Search
              </Button>
            </div>
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full md:w-auto border-primary/30 hover:border-primary/60 hover:bg-primary/10"
                onClick={() => fetchRoadmapByTitle(query)}
              >
                View Roadmap For "{query.trim() || "Typed Career"}"
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr] gap-3 mt-4 items-center">
              <div className="hidden md:flex items-center gap-2 text-muted-foreground text-sm">
                <Filter className="h-4 w-4" /> Filters
              </div>

              <Select
                value={category}
                onValueChange={(v) => setCategory(v as "All" | Category)}
              >
                <SelectTrigger className="bg-background/40 border-border/60">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={salary}
                onValueChange={(v) => setSalary(v as SalaryBucket | "all")}
              >
                <SelectTrigger className="bg-background/40 border-border/60">
                  <SelectValue placeholder="Salary range" />
                </SelectTrigger>
                <SelectContent>
                  {SALARY_BUCKETS.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    category === c
                      ? "bg-gradient-primary border-transparent text-primary-foreground shadow-glow"
                      : "border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="text-sm text-muted-foreground mt-4 px-1">
            Showing{" "}
            <span className="text-foreground font-semibold">
              {filtered.length}
            </span>{" "}
            {filtered.length === 1 ? "career" : "careers"}
          </div>
        </section>

        {/* Career grid */}
        <section className="max-w-7xl mx-auto">
          {filtered.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center animate-fade-up">
              <p className="text-lg font-semibold mb-1">
                No careers match your search.
              </p>
              <p className="text-sm text-muted-foreground">
                Try clearing filters or searching for a skill like “Python” or
                “Design”.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((c, i) => (
                <article
                  key={c.id}
                  style={{ animationDelay: `${i * 40}ms` }}
                  className="group relative bg-gradient-card glass rounded-2xl p-5 shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 animate-fade-up overflow-hidden"
                >
                  <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-start justify-between mb-3 relative">
                    <Badge
                      variant="outline"
                      className="border-primary/30 text-primary bg-primary/10"
                    >
                      {c.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      ₹{c.salaryMin}–{c.salaryMax} LPA
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold mb-1.5 relative">
                    {c.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 relative">
                    {c.blurb}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-5 relative">
                    {c.skills.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="text-[11px] px-2 py-1 rounded-md bg-muted/60 text-muted-foreground border border-border/60"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRoadmap(c)}
                    className="w-full border-primary/30 hover:border-primary/60 hover:bg-primary/10 relative"
                  >
                    View Roadmap <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Dialog open={showRoadmap} onOpenChange={setShowRoadmap}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {loadingRoadmap ? (
            <div className="py-20 flex flex-col items-center text-center">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <DialogTitle>Generating Roadmap</DialogTitle>
              <DialogDescription>
                Our AI is crafting a detailed career path for {selectedCareer?.title || query.trim() || "your selected career"}...
              </DialogDescription>
            </div>
          ) : roadmap ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl md:text-3xl font-bold">
                  Roadmap: <span className="text-gradient">{roadmap.title}</span>
                </DialogTitle>
                <DialogDescription className="mt-2">
                  {roadmap.overview}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 space-y-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-lg border-b pb-1">Path to Success</h4>
                  <div className="space-y-4">
                    {roadmap.steps.map((step, i: number) => (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="h-7 w-7 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 font-bold text-xs">
                          {step.step}
                        </div>
                        <div>
                          <h5 className="font-bold text-sm">{step.title}</h5>
                          <p className="text-xs text-muted-foreground">{step.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="glass p-4 rounded-xl">
                    <h5 className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-1">
                      <Check className="h-3 w-3" /> Key Skills
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {roadmap.skills.map((s, i: number) => (
                        <Badge key={i} variant="secondary" className="text-[10px]">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="glass p-4 rounded-xl">
                    <h5 className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-1">
                      <Flame className="h-3 w-3" /> Entrance Exams
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {roadmap.exams.map((e, i: number) => (
                        <Badge key={i} variant="outline" className="text-[10px] border-primary/30">{e}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                  <div className="text-xs font-bold text-primary mb-1 uppercase">Expected Salary (India)</div>
                  <div className="text-lg font-bold">{roadmap.salaryRange}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Starting income: ₹{roadmap.startingIncomeLPA} LPA
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-xl border border-border/60">
                  <div className="text-xs font-bold text-muted-foreground mb-2 uppercase">
                    API Salary Verification Notes
                  </div>
                  <ul className="space-y-1">
                    {roadmap.salaryEvidence.map((item, i: number) => (
                      <li key={i} className="text-xs text-muted-foreground">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Explore;
