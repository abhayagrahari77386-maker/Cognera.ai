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
  const [prediction, setPrediction] = useState<Record<string, unknown> | null>(null);

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
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");
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
    <div className="min-h-screen bg-[#F8FAFC] text-[#334155] overflow-x-hidden">
      <Navbar />

      <main className="container pt-32 pb-20">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-[#DBEAFE] border border-[#BFDBFE] px-4 py-2 rounded-full text-xs font-bold mb-6">
              <Sparkles className="h-4 w-4 text-[#3B82F6]" />
              <span className="text-[#1D4ED8]">AI Career Intelligence</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-[#0F172A]">
              Unlock Your <span className="text-[#3B82F6]">Potential</span>
            </h1>
            <p className="text-[#64748B] text-lg max-w-xl mx-auto">
              Answer 10 short questions and let our advanced AI engine map your ideal career roadmap.
            </p>
          </div>

          {/* Stepper */}
          <div className="mb-12">
            <div className="flex items-center justify-between gap-2 md:gap-4 relative">
              {STEPS.map((s, idx) => {
                const isActive = step === s.id;
                const isDone = step > s.id;
                return (
                  <div key={s.id} className="flex-1 flex items-center gap-2 md:gap-4 relative z-10">
                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                      <div
                        className={`relative h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 border-2 ${
                          isDone
                            ? "bg-[#3B82F6] border-[#3B82F6] text-white"
                            : isActive
                            ? "bg-white border-[#3B82F6] text-[#3B82F6] shadow-soft"
                            : "bg-[#F1F5F9] border-[#E2E8F0] text-[#94A3B8]"
                        }`}
                      >
                        {isDone ? <Check className="h-5 w-5" /> : s.id}
                      </div>
                      <span
                        className={`text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors ${
                          isActive || isDone ? "text-[#0F172A]" : "text-[#94A3B8]"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className="flex-1 h-[2px] bg-[#E2E8F0] rounded-full overflow-hidden mb-6">
                        <div
                          className={`h-full bg-[#3B82F6] transition-all duration-700 ${
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
          <div className="bg-white border border-[#E5E7EB] rounded-[2rem] p-6 md:p-12 shadow-soft animate-scale-in">
            {step === 1 && (
              <div className="space-y-8 animate-fade-up">
                <div>
                  <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Personal Profile</h2>
                  <p className="text-[#64748B] font-medium italic">Let's start with your basic educational background.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="e.g. Abhay Agrahari"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-14 bg-[#F8FAFC] border-[#E2E8F0] focus-visible:ring-[#3B82F6]/20 transition-all rounded-xl text-base px-5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-14 bg-[#F8FAFC] border-[#E2E8F0] focus-visible:ring-[#3B82F6]/20 transition-all rounded-xl text-base px-5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Education Level</Label>
                  <Select value={education} onValueChange={setEducation}>
                    <SelectTrigger className="h-14 bg-[#F8FAFC] border-[#E2E8F0] rounded-xl text-base">
                      <SelectValue placeholder="Select your current education" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {EDUCATION_LEVELS.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end pt-4">
                  <Button variant="hero" size="lg" onClick={handleNext} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-10 h-14 rounded-xl font-bold shadow-soft">
                    Continue to Skills
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-fade-up">
                <div>
                  <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Strengths & Goals</h2>
                  <p className="text-[#64748B] font-medium italic">
                    Tell us what you're good at and what you aspire to be.
                  </p>
                </div>

                {/* Interests */}
                <div className="space-y-4">
                  <Label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Interests & Domains</Label>
                  <div className="flex flex-wrap gap-2.5">
                    {INTEREST_OPTIONS.map((i) => {
                      const active = interests.includes(i);
                      return (
                        <button
                          type="button"
                          key={i}
                          onClick={() => toggleInterest(i)}
                          className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all duration-300 ${
                            active
                              ? "bg-[#3B82F6] text-white border-[#3B82F6] shadow-soft scale-105"
                              : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:border-[#3B82F6]/50"
                          }`}
                        >
                          {i}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-4">
                  <Label htmlFor="skills" className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Key Skills</Label>
                  <div className="flex gap-3">
                    <Input
                      id="skills"
                      placeholder="Type skill (e.g. Python) & Enter"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      className="h-14 bg-[#F8FAFC] border-[#E2E8F0] focus-visible:ring-[#3B82F6]/20 rounded-xl"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-14 w-14 flex-shrink-0 rounded-xl border-[#E2E8F0]"
                      onClick={() => addSkill()}
                    >
                      <Plus className="h-6 w-6 text-[#3B82F6]" />
                    </Button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 pt-2">
                      {skills.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB]"
                        >
                          {s}
                          <button
                            type="button"
                            onClick={() => removeSkill(s)}
                            className="hover:text-[#EF4444] transition-colors"
                            aria-label={`Remove ${s}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Goals */}
                <div className="space-y-2">
                  <Label htmlFor="goals" className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Ultimate Career Goals</Label>
                  <Textarea
                    id="goals"
                    rows={4}
                    placeholder="Describe your long-term vision or dream job in detail…"
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    className="bg-[#F8FAFC] border-[#E2E8F0] focus-visible:ring-[#3B82F6]/20 rounded-xl resize-none p-5 text-base"
                  />
                </div>

                <div className="space-y-6 pt-4 border-t border-[#F1F5F9]">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-[#0F172A]">AI Behavioral Analysis</h3>
                      <p className="text-xs text-[#64748B] font-medium">Answer these to get high-confidence career predictions.</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateAiQuestions}
                      disabled={questionsLoading}
                      className="rounded-xl border-[#3B82F6]/20 text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white font-bold h-11"
                    >
                      {questionsLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Questions
                        </>
                      )}
                    </Button>
                  </div>

                  {aiQuestions.length > 0 ? (
                    <div className="space-y-6 animate-fade-up">
                      {aiQuestions.map((question, index) => (
                        <div key={`${question}-${index}`} className="space-y-3">
                          <p className="text-sm font-bold text-[#334155]">
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
                            className="bg-[#F8FAFC] border-[#E2E8F0] focus-visible:ring-[#3B82F6]/20 rounded-xl resize-none p-4"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#F8FAFC] border border-dashed border-[#E2E8F0] p-8 rounded-2xl text-center">
                      <p className="text-sm text-[#64748B] font-medium">
                        Click "Generate Questions" to let AI interview you for better accuracy.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between gap-4 pt-4">
                  <Button variant="ghost" size="lg" onClick={() => setStep(1)} className="font-bold text-[#64748B] h-14 px-8">
                    Go Back
                  </Button>
                  <Button variant="hero" size="lg" onClick={handleAnalyze} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white h-14 px-10 rounded-xl font-bold shadow-soft">
                    Analyze My Career <Flame className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="py-8 flex flex-col items-center animate-fade-up">
                {loading ? (
                  <div className="text-center">
                    <div className="relative h-20 w-20 mb-10 mx-auto">
                      <div className="relative h-full w-full rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center shadow-soft">
                        <Loader2 className="h-8 w-8 text-[#3B82F6] animate-spin" />
                      </div>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-bold mb-3 text-[#0F172A]">
                      Deep Intelligence <span className="text-[#3B82F6]">Processing</span>
                    </h2>
                    <p className="text-[#64748B] text-lg max-w-sm mx-auto font-medium">
                      Our algorithms are mapping your psyche to thousands of career trajectories…
                    </p>
                  </div>
                ) : prediction ? (
                  <div className="w-full space-y-12">
                    <div className="text-center">
                      <div className="h-20 w-20 rounded-3xl bg-[#3B82F6] flex items-center justify-center shadow-elevated mb-8 mx-auto rotate-3">
                        <Sparkles className="h-10 w-10 text-white" />
                      </div>
                      <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#0F172A]">
                        Predicted Fit: <span className="text-[#3B82F6]">{prediction?.predictedField || "Career Path"}</span>
                      </h2>
                      <div className="flex items-center justify-center gap-3 mb-6">
                        <Badge variant="outline" className="border-[#3B82F6]/30 text-[#3B82F6] bg-[#EFF6FF] px-4 py-1.5 font-bold uppercase tracking-widest text-[10px]">{prediction?.careerCluster || "General"}</Badge>
                        <span className="text-sm font-bold text-[#10B981]">{prediction?.confidence || 0}% Confidence</span>
                      </div>
                      <p className="text-[#64748B] text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                        "{prediction?.finalAdvice || "Continue exploring your potential."}"
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="bg-white border border-[#E5E7EB] p-8 rounded-[2rem] shadow-soft">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-[#0F172A]">
                          <Check className="h-6 w-6 text-[#10B981]" /> Why This Fits You
                        </h3>
                        <ul className="space-y-4">
                          {(prediction?.whyThisFieldFits || []).map((reason: string, i: number) => (
                            <li key={i} className="text-[15px] font-medium text-[#475569] flex gap-3">
                              <span className="text-[#3B82F6] text-xl leading-none font-black">•</span> {reason}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-[#0F172A] p-8 rounded-[2rem] shadow-elevated text-white overflow-hidden relative">
                        <div className="absolute -top-10 -right-10 opacity-10">
                          <Flame className="w-40 h-40 text-orange-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-3 relative z-10">
                          <Flame className="h-6 w-6 text-[#F59E0B]" /> Core Traits Detected
                        </h3>
                        <div className="flex flex-wrap gap-2 relative z-10">
                          {(prediction?.topTraitsDetected || []).map((trait: string, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-white/10 hover:bg-white/20 border-transparent text-white px-3 py-1 font-bold">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-[#0F172A] border-b border-[#F1F5F9] pb-4">Strategic Execution Roadmap</h3>
                      <div className="space-y-6 relative ml-4 border-l-2 border-[#DBEAFE] pl-10 pt-2 pb-2">
                        {((prediction as Record<string, unknown>)?.roadmap as Array<{ step: number; title: string; details: string }> || []).map((item, i: number) => (
                          <div key={i} className="relative">
                            <div className="absolute -left-[54px] top-0 h-10 w-10 rounded-2xl bg-white border-2 border-[#3B82F6] text-[#3B82F6] flex items-center justify-center font-bold text-sm shadow-soft">
                              {item.step}
                            </div>
                            <div>
                              <h4 className="font-bold text-lg text-[#0F172A] mb-1">{item.title}</h4>
                              <p className="text-[#64748B] text-sm leading-relaxed">{item.details}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-soft">
                        <h4 className="text-[10px] font-bold text-[#94A3B8] mb-4 uppercase tracking-widest">Education Path</h4>
                        <ul className="text-sm font-bold text-[#334155] space-y-2">
                          {(prediction?.recommendedPathway?.degreeOptions || []).map((opt: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] mt-1.5 shrink-0" />
                              {opt}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-soft">
                        <h4 className="text-[10px] font-bold text-[#94A3B8] mb-4 uppercase tracking-widest">Crucial Exams</h4>
                        <ul className="text-sm font-bold text-[#334155] space-y-2">
                          {((prediction as Record<string, unknown>)?.entranceExams as Array<{ exam: string; purpose?: string }> || []).map((exam, i: number) => (
                            <li key={i} title={exam?.purpose} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] mt-1.5 shrink-0" />
                              {exam?.exam}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-soft">
                        <h4 className="text-[10px] font-bold text-[#94A3B8] mb-4 uppercase tracking-widest">Potential Roles</h4>
                        <ul className="text-sm font-bold text-[#334155] space-y-2">
                          {(prediction?.jobRoles || []).map((role: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-1.5 shrink-0" />
                              {role}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {prediction?.backupField && (
                      <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-6 rounded-2xl">
                        <h4 className="text-[10px] font-bold text-[#94A3B8] mb-2 uppercase tracking-widest flex items-center gap-2">
                          <Check className="h-4 w-4" /> Contingency Pathway
                        </h4>
                        <p className="text-sm font-medium text-[#475569]">
                          <span className="font-bold text-[#0F172A]">{prediction?.backupField?.field}</span> — {prediction?.backupField?.reason}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8 border-t border-[#F1F5F9]">
                      <Button variant="outline" size="lg" onClick={() => { setStep(1); setPrediction(null); }} className="font-bold h-14 rounded-xl px-10 border-[#E2E8F0] text-[#64748B]">
                        Retake Evaluation
                      </Button>
                      <Button variant="hero" size="lg" onClick={() => navigate("/explore")} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white h-14 rounded-xl px-12 font-bold shadow-soft">
                        Discover Career Cards
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="h-24 w-24 rounded-[2rem] bg-[#ECFDF5] border border-[#D1FAE5] flex items-center justify-center shadow-soft mb-8 mx-auto -rotate-6">
                      <Check className="h-12 w-12 text-[#10B981]" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#0F172A]">
                      Your Insights Are <span className="text-[#3B82F6]">Ready</span>
                    </h2>
                    <p className="text-[#64748B] text-lg max-w-md mb-10 mx-auto font-medium">
                      We've compiled your high-precision career blueprints and strategic roadmaps.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button variant="outline" size="lg" onClick={() => { setStep(1); }} className="h-14 px-8 rounded-xl font-bold text-[#64748B]">
                        Restart
                      </Button>
                      <Button variant="hero" size="lg" onClick={() => navigate("/")} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white h-14 px-12 rounded-xl font-bold shadow-soft">
                        Go to Dashboard
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
