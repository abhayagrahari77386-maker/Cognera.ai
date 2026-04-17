import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Flame, Loader2, Plus, Sparkles, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const INTEREST_OPTIONS = [
  "Technology",
  "Medical",
  "Business",
  "Design",
  "Government",
  "Arts",
  "Finance",
  "Education",
];

const EDUCATION_LEVELS = [
  "10th Pass",
  "12th Pass",
  "Diploma",
  "Undergraduate",
  "Graduate",
  "Postgraduate",
];

const STEPS = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Skills & Interests" },
  { id: 3, label: "AI Analysis" },
];

const Assessment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);

  // Step 1
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [education, setEducation] = useState("");

  // Step 2
  const [interests, setInterests] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [goals, setGoals] = useState("");
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [aiAnswers, setAiAnswers] = useState<Record<number, string>>({});
  const [questionsLoading, setQuestionsLoading] = useState(false);

  useEffect(() => {
    document.title = "AI Career Assessment | Cognera AI";
  }, []);

  const toggleInterest = (i: string) =>
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );

  const addSkill = (val?: string) => {
    const v = (val ?? skillInput).trim();
    if (!v) return;
    if (skills.includes(v)) return;
    setSkills([...skills, v]);
    setSkillInput("");
  };

  const removeSkill = (s: string) =>
    setSkills(skills.filter((x) => x !== s));

  const validateStep1 = () => {
    if (!fullName.trim() || !email.trim() || !education) {
      toast({
        title: "Missing fields",
        description: "Please fill in your name, email, and education level.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    // Relaxed validation: allow submission even with empty interests, skills, or goals
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => Math.min(3, s + 1));
  };

  const handleAnalyze = async () => {
    if (!validateStep2()) return;
    setStep(3);
    setLoading(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          education,
          interests,
          skills,
          goals,
          aiQuestionAnswers: aiQuestions.map((question, index) => ({
            question,
            answer: aiAnswers[index] || "",
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get prediction");
      }

      const data = await response.json();
      setPrediction(data);
      toast({
        title: "Analysis complete ✨",
        description: "Your personalized career insights are ready.",
      });
    } catch (error) {
      console.error("Error analyzing:", error);
      toast({
        title: "Analysis failed",
        description: "There was an error generating your career roadmap. Please try again.",
        variant: "destructive",
      });
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const generateAiQuestions = async () => {
    setQuestionsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/assessment-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          education,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate AI questions");
      }

      const data = await response.json();
      const generated = Array.isArray(data.questions) ? data.questions : [];
      setAiQuestions(generated);
      setAiAnswers({});
      toast({
        title: "AI questions ready",
        description: "Answer these to improve behavior and interest analysis.",
      });
    } catch (error) {
      console.error("Error generating questions:", error);
      toast({
        title: "Failed to generate AI questions",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setQuestionsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="glow-orb bg-primary/30 w-[500px] h-[500px] -top-32 -left-32 animate-float-slow" />
        <div className="glow-orb bg-secondary/30 w-[600px] h-[600px] top-1/2 -right-40 animate-float" />
        <div className="absolute inset-0 grid-bg opacity-30" />
      </div>

      <main className="container pt-32 pb-20">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-up">
            <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs font-medium mb-5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">AI Career Assessment</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
              Find your <span className="text-gradient">perfect career path</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Answer a few quick questions and let our AI craft a personalized roadmap for your future.
            </p>
          </div>

          {/* Stepper */}
          <div className="mb-10">
            <div className="flex items-center justify-between gap-2 md:gap-4">
              {STEPS.map((s, idx) => {
                const isActive = step === s.id;
                const isDone = step > s.id;
                return (
                  <div key={s.id} className="flex-1 flex items-center gap-2 md:gap-4">
                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                      <div
                        className={`relative h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500 ${
                          isDone
                            ? "bg-gradient-primary text-primary-foreground shadow-glow"
                            : isActive
                            ? "bg-gradient-primary text-primary-foreground shadow-glow animate-pulse-glow"
                            : "glass text-muted-foreground"
                        }`}
                      >
                        {isDone ? <Check className="h-5 w-5" /> : s.id}
                      </div>
                      <span
                        className={`text-[11px] md:text-xs font-medium whitespace-nowrap transition-colors ${
                          isActive || isDone ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className="flex-1 h-[2px] bg-border/50 rounded-full overflow-hidden -mt-6">
                        <div
                          className={`h-full bg-gradient-primary transition-all duration-700 ${
                            step > s.id ? "w-full" : "w-0"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card */}
          <div className="glass rounded-3xl p-6 md:p-10 shadow-card animate-scale-in">
            {step === 1 && (
              <div className="space-y-6 animate-fade-up">
                <div>
                  <h2 className="text-2xl font-semibold mb-1">Basic Info</h2>
                  <p className="text-sm text-muted-foreground">Tell us a little about yourself.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-12 bg-background/40 border-border focus-visible:ring-primary/60 focus-visible:border-primary/60 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 bg-background/40 border-border focus-visible:ring-primary/60 focus-visible:border-primary/60 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Education Level</Label>
                  <Select value={education} onValueChange={setEducation}>
                    <SelectTrigger className="h-12 bg-background/40 border-border">
                      <SelectValue placeholder="Select your education level" />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end pt-2">
                  <Button variant="hero" size="lg" onClick={handleNext}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-up">
                <div>
                  <h2 className="text-2xl font-semibold mb-1">Skills & Interests</h2>
                  <p className="text-sm text-muted-foreground">
                    Help our AI understand what drives you.
                  </p>
                </div>

                {/* Interests */}
                <div className="space-y-3">
                  <Label>Interests</Label>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map((i) => {
                      const active = interests.includes(i);
                      return (
                        <button
                          type="button"
                          key={i}
                          onClick={() => toggleInterest(i)}
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${
                            active
                              ? "bg-gradient-primary text-primary-foreground border-transparent shadow-glow scale-105"
                              : "glass border-border hover:border-primary/50 hover:text-foreground text-muted-foreground"
                          }`}
                        >
                          {i}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-3">
                  <Label htmlFor="skills">Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      id="skills"
                      placeholder="Type a skill and press Enter"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      className="h-12 bg-background/40 border-border focus-visible:ring-primary/60 focus-visible:border-primary/60"
                    />
                    <Button
                      type="button"
                      variant="glass"
                      size="icon"
                      className="h-12 w-12 flex-shrink-0"
                      onClick={() => addSkill()}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {skills.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-primary/15 border border-primary/30 text-foreground"
                        >
                          {s}
                          <button
                            type="button"
                            onClick={() => removeSkill(s)}
                            className="hover:text-destructive transition-colors"
                            aria-label={`Remove ${s}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Goals */}
                <div className="space-y-2">
                  <Label htmlFor="goals">Career Goals</Label>
                  <Textarea
                    id="goals"
                    rows={4}
                    placeholder="Describe your career goals or dream job…"
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    className="bg-background/40 border-border focus-visible:ring-primary/60 focus-visible:border-primary/60 resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <Label>AI Behavior & Interest Questions</Label>
                    <Button
                      type="button"
                      variant="glass"
                      size="sm"
                      onClick={generateAiQuestions}
                      disabled={questionsLoading}
                    >
                      {questionsLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        "Ask AI Questions"
                      )}
                    </Button>
                  </div>

                  {aiQuestions.length > 0 ? (
                    <div className="space-y-4">
                      {aiQuestions.map((question, index) => (
                        <div key={`${question}-${index}`} className="space-y-2">
                          <p className="text-sm font-medium text-foreground">
                            {index + 1}. {question}
                          </p>
                          <Textarea
                            rows={2}
                            placeholder="Write your answer..."
                            value={aiAnswers[index] || ""}
                            onChange={(e) =>
                              setAiAnswers((prev) => ({
                                ...prev,
                                [index]: e.target.value,
                              }))
                            }
                            className="bg-background/40 border-border focus-visible:ring-primary/60 focus-visible:border-primary/60 resize-none"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Click "Ask AI Questions" to get personalized behavior and interest questions.
                    </p>
                  )}
                </div>

                <div className="flex justify-between gap-3 pt-2">
                  <Button variant="glass" size="lg" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button variant="hero" size="lg" onClick={handleAnalyze}>
                    Analyze with AI <Flame className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="py-6 flex flex-col items-center animate-fade-up">
                {loading ? (
                  <div className="text-center">
                    <div className="relative h-24 w-24 mb-6 mx-auto">
                      <div className="absolute inset-0 rounded-full bg-gradient-primary blur-2xl opacity-60 animate-pulse-glow" />
                      <div className="relative h-full w-full rounded-full glass flex items-center justify-center">
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                      </div>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">
                      Analyzing your <span className="text-gradient">profile</span>
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Our AI is crunching your interests, skills, and goals to map the perfect career paths for you…
                    </p>
                  </div>
                ) : prediction ? (
                  <div className="w-full space-y-8">
                    <div className="text-center">
                      <div className="h-20 w-20 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow mb-6 mx-auto">
                        <Sparkles className="h-10 w-10 text-primary-foreground" />
                      </div>
                      <h2 className="text-3xl md:text-4xl font-bold mb-2">
                        Your Best Fit: <span className="text-gradient">{prediction?.predictedField || "Career Path"}</span>
                      </h2>
                      <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                        <Badge variant="outline" className="border-primary/30">{prediction?.careerCluster || "General"}</Badge>
                        <span>{prediction?.confidence || 0}% Match Confidence</span>
                      </div>
                      <p className="text-muted-foreground max-w-2xl mx-auto italic">
                        "{prediction?.finalAdvice || "Continue exploring your potential."}"
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="glass-strong p-6 rounded-2xl border border-primary/20">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                          <Check className="h-5 w-5 text-primary" /> Why This Fits You
                        </h3>
                        <ul className="space-y-2">
                          {(prediction?.whyThisFieldFits || []).map((reason: string, i: number) => (
                            <li key={i} className="text-sm flex gap-2">
                              <span className="text-primary font-bold">•</span> {reason}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="glass-strong p-6 rounded-2xl border border-secondary/20">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                          <Flame className="h-5 w-5 text-secondary" /> Top Traits Detected
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {(prediction?.topTraitsDetected || []).map((trait: string, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-bold border-b pb-2">Recommended Career Roadmap</h3>
                      <div className="space-y-4">
                        {(prediction?.roadmap || []).map((item: any, i: number) => (
                          <div key={i} className="flex gap-4 items-start">
                            <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0 font-bold text-sm">
                              {item.step}
                            </div>
                            <div>
                              <h4 className="font-bold">{item.title}</h4>
                              <p className="text-sm text-muted-foreground">{item.details}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="glass p-4 rounded-xl">
                        <h4 className="text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">Education Path</h4>
                        <ul className="text-sm space-y-1">
                          {(prediction?.recommendedPathway?.degreeOptions || []).map((opt: string, i: number) => (
                            <li key={i}>• {opt}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="glass p-4 rounded-xl">
                        <h4 className="text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">Entrance Exams</h4>
                        <ul className="text-sm space-y-1">
                          {(prediction?.entranceExams || []).map((exam: any, i: number) => (
                            <li key={i} title={exam?.purpose}>• {exam?.exam}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="glass p-4 rounded-xl">
                        <h4 className="text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">Job Roles</h4>
                        <ul className="text-sm space-y-1">
                          {(prediction?.jobRoles || []).map((role: string, i: number) => (
                            <li key={i}>• {role}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {prediction?.backupField && (
                      <div className="bg-muted/30 p-4 rounded-xl border border-dashed border-muted-foreground/30">
                        <h4 className="text-sm font-bold text-muted-foreground mb-1">Backup Recommendation</h4>
                        <p className="text-sm">
                          <span className="font-bold text-foreground">{prediction?.backupField?.field}</span>: {prediction?.backupField?.reason}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-center gap-3 pt-6 border-t">
                      <Button variant="glass" size="lg" onClick={() => { setStep(1); setPrediction(null); }}>
                        Retake Assessment
                      </Button>
                      <Button variant="hero" size="lg" onClick={() => navigate("/explore")}>
                        Explore More Careers
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="h-20 w-20 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow mb-6 mx-auto">
                      <Check className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">
                      Your insights are <span className="text-gradient">ready</span>
                    </h2>
                    <p className="text-muted-foreground max-w-md mb-6 mx-auto">
                      We've prepared a personalized career roadmap based on your assessment.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button variant="glass" size="lg" onClick={() => { setStep(1); }}>
                        Retake
                      </Button>
                      <Button variant="hero" size="lg" onClick={() => navigate("/")}>
                        View Recommendations
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Assessment;
