import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Brain, Upload, FileText, ChevronRight, CheckCircle2, XCircle, ArrowRight, Loader2, Clock, IndianRupee } from "lucide-react";
import { extractTextFromPDF } from "@/lib/pdfParser";

// The Backend API URL mapping
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");

export default function SkillGap() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [targetCareer, setTargetCareer] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Results State
  const [result, setResult] = useState<{
    targetCareer: string;
    estimatedTimePattern: string;
    estimatedSalary: string;
    currentSkills: string[];
    missingSkills: string[];
    roadmap: { step: number; title: string; details: string }[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        toast({
          title: "Invalid File Type",
          description: "Please upload your CV in PDF format.",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({ title: "Missing CV", description: "Please upload your CV (PDF) first.", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      // 1. Extract text purely on the frontend
      const cvText = await extractTextFromPDF(file);
      
      if (!cvText || cvText.trim().length < 50) {
        throw new Error("Could not extract enough readable text from this PDF. Please ensure it is a text-based PDF.");
      }

      // 2. Send plain text + target to backend API
      const response = await fetch(`${API_URL}/api/skill-gap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, targetCareer }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to analyze skill gap. Please try again later.");
      }

      const data = await response.json();
      setResult(data);
      
      toast({
        title: "Analysis Complete!",
        description: "Your personalized skill gap roadmap is ready.",
      });
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during analysis.";
      console.error(error);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 pt-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-sm font-medium mb-2 text-primary">
            <Brain className="w-4 h-4" /> Professional Analysis
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">AI Skill Gap Analyzer</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Upload your CV and specify your target career. Our AI will analyze your current experience, 
            identify critical missing skills, and generate a step-by-step roadmap to bridge the gap.
          </p>
        </div>

        {/* Input Form Section */}
        <div className="glass p-6 md:p-8 rounded-2xl border border-primary/10 shadow-lg space-y-6">
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Left Col: Upload */}
            <div className="space-y-4">
              <label className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                Step 1: Upload CV / Resume
              </label>
              
              {!file ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-primary/30 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition-all group"
                >
                  <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">Click to browse</h3>
                  <p className="text-xs text-muted-foreground">PDF formatting only (Max 5MB)</p>
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="border border-primary/20 bg-primary/5 rounded-xl p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4 truncate">
                    <div className="bg-primary/20 p-3 rounded-lg flex-shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="truncate">
                      <h4 className="font-semibold text-sm truncate">{file.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearFile} className="text-destructive hover:text-destructive/80 hover:bg-destructive/10">
                    Remove
                  </Button>
                </div>
              )}
            </div>

            {/* Right Col: Target Career */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <label className="text-sm font-semibold tracking-wide text-muted-foreground uppercase flex items-center gap-2">
                  Step 2: Target Career <span className="text-xs font-normal bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">Optional</span>
                </label>
                <div className="space-y-2">
                  <Input 
                    placeholder="e.g. Data Scientist, Product Manager..." 
                    className="h-14 bg-background/50 border-primary/20 text-lg px-4"
                    value={targetCareer}
                    onChange={(e) => setTargetCareer(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground px-1">
                    If left blank, our AI will analyze your CV and automatically suggest the best-fitting career for you!
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || !file}
                className="w-full h-14 text-lg font-semibold shadow-xl shadow-primary/20"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" /> Analyzing CV Data...
                  </>
                ) : (
                  <>
                    Detect Skill Gap <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>

          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="mt-12 space-y-8 animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Analysis Results for <span className="text-primary">{result.targetCareer}</span></h2>
              <p className="text-muted-foreground mb-6">Based on the rigorous comparison of your CV with standard industry requirements.</p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {result.estimatedTimePattern && (
                  <div className="flex items-center gap-2 glass px-4 py-2 rounded-full border border-primary/20 bg-background/50">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Estimated Time to Bridge Gap: <span className="text-foreground">{result.estimatedTimePattern}</span></span>
                  </div>
                )}
                {result.estimatedSalary && (
                  <div className="flex items-center gap-2 glass px-4 py-2 rounded-full border border-green-500/20 bg-green-500/5">
                    <IndianRupee className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">Potential Starting Salary: <span className="text-foreground">{result.estimatedSalary}</span></span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Acquired Skills */}
              <div className="glass p-6 rounded-xl border border-green-500/20 bg-green-500/5">
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 text-green-400">
                  <CheckCircle2 className="w-5 h-5" /> Verified Current Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.currentSkills.length > 0 ? result.currentSkills.map((skill, idx) => (
                    <span key={idx} className="bg-green-500/10 border border-green-500/30 text-green-400 px-3 py-1 text-sm rounded-full">
                      {skill}
                    </span>
                  )) : (
                    <span className="text-muted-foreground text-sm italic">No directly relevant skills detected in document.</span>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="glass p-6 rounded-xl border border-destructive/20 bg-destructive/5">
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 text-destructive">
                  <XCircle className="w-5 h-5" /> The Skill Gap
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.length > 0 ? result.missingSkills.map((skill, idx) => (
                    <span key={idx} className="bg-destructive/10 border border-destructive/30 text-destructive px-3 py-1 text-sm rounded-full">
                      {skill}
                    </span>
                  )) : (
                    <span className="text-muted-foreground text-sm italic">You have all the core skills required! Excellent match.</span>
                  )}
                </div>
              </div>
            </div>

            {/* AI Roadmap */}
            {result.roadmap && result.roadmap.length > 0 && (
              <div className="glass p-8 rounded-2xl border border-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Brain className="w-48 h-48" />
                </div>
                
                <h3 className="text-2xl font-bold mb-6">Your Personal Roadmap</h3>
                <p className="text-muted-foreground mb-8">Follow this recommended pathway to acquire your missing skills effectively.</p>
                
                <div className="space-y-6 relative z-10">
                  {result.roadmap.map((step, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/20 text-primary font-bold flex-shrink-0 border border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                        {step.step || idx + 1}
                      </div>
                      <div className="border border-border/50 bg-background/50 rounded-xl p-5 flex-1 shadow-sm">
                        <h4 className="font-bold text-lg mb-2 text-foreground">{step.title}</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">{step.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
