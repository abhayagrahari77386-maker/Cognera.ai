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
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");
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
    <div className="min-h-screen bg-[#F8FAFC] text-[#334155] overflow-x-hidden">
      <Navbar />

      <main className="container pt-32 pb-20">
        {/* Header */}
        <section className="text-center max-w-3xl mx-auto mb-12 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#DBEAFE] border border-[#BFDBFE] mb-6">
            <Sparkles className="h-4 w-4 text-[#3B82F6]" />
            <span className="text-xs font-semibold text-[#1D4ED8]">
              Career Discovery
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-4 text-[#0F172A]">
            Explore <span className="text-[#3B82F6]">Careers</span>
          </h1>
          <p className="text-[#64748B] text-lg">
            Search roles, filter by salary and category, and discover what fits
            your strengths.
          </p>
        </section>

        {/* Search + Filters */}
        <section className="max-w-5xl mx-auto mb-12">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 md:p-8 shadow-soft">
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search careers, skills, or roles…"
                  className="pl-9 h-12 bg-white border-[#E2E8F0] focus-visible:ring-[#3B82F6]/20"
                />
              </div>
              <Button variant="hero" size="lg" className="md:w-60 w-full bg-[#3B82F6] text-white hover:bg-[#2563EB]">
                <Search className="mr-1 h-5 w-5" /> Search
              </Button>
            </div>
            
            <div className="mt-4">
              <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider block mb-3">Filter by Category</span>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`text-sm px-4 py-2 rounded-lg border transition-all ${
                      category === c
                        ? "bg-[#3B82F6] border-[#3B82F6] text-white shadow-soft"
                        : "bg-[#F1F5F9] border-[#E2E8F0] text-[#334155] hover:border-[#3B82F6]/50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-[#F1F5F9]">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#64748B] uppercase">Experience Level</label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as "All" | Category)}
                >
                  <SelectTrigger className="bg-white border-[#E2E8F0] h-11">
                    <SelectValue placeholder="All Domains" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#64748B] uppercase">Salary Range</label>
                <Select
                  value={salary}
                  onValueChange={(v) => setSalary(v as SalaryBucket | "all")}
                >
                  <SelectTrigger className="bg-white border-[#E2E8F0] h-11">
                    <SelectValue placeholder="Any Compensation" />
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
            </div>
          </div>

          <div className="text-sm text-[#64748B] mt-5 px-1 font-medium italic">
            Found{" "}
            <span className="text-[#0F172A] font-bold">
              {filtered.length}
            </span>{" "}
            {filtered.length === 1 ? "career" : "careers"} matching your criteria
          </div>
        </section>

        {/* Career grid */}
        <section className="max-w-7xl mx-auto">
          {filtered.length === 0 ? (
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-16 text-center animate-fade-up shadow-soft">
              <div className="bg-[#F1F5F9] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="h-8 w-8 text-[#94A3B8]" />
              </div>
              <p className="text-lg font-bold text-[#0F172A] mb-2">
                No matching careers found
              </p>
              <p className="text-[#64748B]">
                Try adjusting your filters or search terms for a broader range of results.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((c, i) => (
                <article
                  key={c.id}
                  style={{ animationDelay: `${i * 30}ms` }}
                  className="group relative bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-up flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <Badge
                      variant="outline"
                      className="border-[#DBEAFE] text-[#3B82F6] bg-[#EFF6FF] px-2.5 py-1"
                    >
                      {c.category}
                    </Badge>
                    <span className="text-xs font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-1 rounded-md">
                      ₹{c.salaryMin}–{c.salaryMax} LPA
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold mb-2 text-[#0F172A] group-hover:text-[#3B82F6] transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-sm text-[#64748B] mb-6 line-clamp-2">
                    {c.blurb}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-8 mt-auto">
                    {c.skills.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRoadmap(c)}
                    className="w-full border-[#3B82F6]/20 text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white transition-all font-bold"
                  >
                    View Roadmap <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Dialog open={showRoadmap} onOpenChange={setShowRoadmap}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white p-0">
          {loadingRoadmap ? (
            <div className="py-24 flex flex-col items-center text-center px-6">
              <Loader2 className="h-12 w-12 text-[#3B82F6] animate-spin mb-6" />
              <DialogTitle className="text-2xl font-bold text-[#0F172A]">Crafting Roadmap</DialogTitle>
              <DialogDescription className="text-[#64748B] text-lg max-w-sm">
                Our AI is building a comprehensive path for <span className="text-[#0F172A] font-bold">{selectedCareer?.title || "your selected career"}</span>...
              </DialogDescription>
            </div>
          ) : roadmap ? (
            <div className="relative">
              <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] p-8">
                <DialogHeader>
                  <DialogTitle className="text-2xl md:text-3xl font-bold text-[#0F172A]">
                    Career Path: <span className="text-[#3B82F6]">{roadmap.title}</span>
                  </DialogTitle>
                  <DialogDescription className="mt-4 text-[#334155] text-base leading-relaxed">
                    {roadmap.overview}
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="p-8 space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-1 w-8 bg-[#3B82F6] rounded-full" />
                    <h4 className="font-bold text-lg text-[#0F172A] uppercase tracking-wide">Path to Success</h4>
                  </div>
                  
                  <div className="space-y-6 relative ml-4 border-l-2 border-[#DBEAFE] pl-8 pb-4">
                    {roadmap.steps.map((step, i: number) => (
                      <div key={i} className="relative group">
                        <div className="absolute -left-[45px] top-1 h-8 w-8 rounded-full bg-white border-2 border-[#3B82F6] text-[#3B82F6] flex items-center justify-center font-bold text-sm shadow-soft">
                          {step.step}
                        </div>
                        <div>
                          <h5 className="font-bold text-base text-[#0F172A] mb-1">{step.title}</h5>
                          <p className="text-sm text-[#64748B] leading-relaxed">{step.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-soft">
                    <h5 className="text-xs font-bold text-[#94A3B8] mb-4 uppercase tracking-widest flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#3B82F6]" /> Required Skills
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {roadmap.skills.map((s, i: number) => (
                        <Badge key={i} variant="secondary" className="bg-[#EFF6FF] text-[#2563EB] border-transparent hover:bg-[#DBEAFE] transition-colors">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl shadow-soft">
                    <h5 className="text-xs font-bold text-[#94A3B8] mb-4 uppercase tracking-widest flex items-center gap-2">
                      <Flame className="h-4 w-4 text-[#F59E0B]" /> Key Exams
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {roadmap.exams.map((e, i: number) => (
                        <Badge key={i} variant="outline" className="border-[#FDE68A] text-[#B45309] bg-[#FFFBEB]">{e}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-[#3B82F6] p-6 rounded-2xl text-white shadow-elevated">
                  <div className="text-xs font-bold text-blue-100 mb-2 uppercase tracking-widest">Typical Salary (India)</div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold">₹{roadmap.salaryRange}</span>
                    <span className="text-blue-100">LPA</span>
                  </div>
                  <div className="text-sm text-blue-50 font-medium">
                    Initial intake: ₹{roadmap.startingIncomeLPA} LPA
                  </div>
                </div>

                <div className="bg-[#F1F5F9] p-5 rounded-2xl border border-[#E2E8F0]">
                  <div className="text-xs font-bold text-[#64748B] mb-3 uppercase tracking-wider">
                    Verification & Market Insights
                  </div>
                  <ul className="space-y-2">
                    {roadmap.salaryEvidence.map((item, i: number) => (
                      <li key={i} className="text-xs text-[#334155] flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#3B82F6] mt-1 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Explore;
