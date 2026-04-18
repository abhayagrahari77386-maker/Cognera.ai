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
    <div className="min-h-screen bg-[#F8FAFC] text-[#334155] pb-20 pt-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#DBEAFE] border border-[#BFDBFE] px-4 py-2 rounded-full text-sm font-semibold mb-2 text-[#1D4ED8]">
            <Brain className="w-4 h-4" /> Professional Analysis
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0F172A]">AI Skill Gap Analyzer</h1>
          <p className="text-[#64748B] text-lg max-w-2xl mx-auto">
            Upload your CV and specify your target career. Our AI will analyze your experience, 
            identify critical missing skills, and generate a step-by-step roadmap.
          </p>
        </div>

        {/* Input Form Section */}
        <div className="bg-white p-6 md:p-10 rounded-[2rem] border border-[#E5E7EB] shadow-soft space-y-8">
          <div className="grid md:grid-cols-2 gap-10">
            
            {/* Left Col: Upload */}
            <div className="space-y-4">
              <label className="text-xs font-bold tracking-widest uppercase text-[#94A3B8]">
                Step 1: Upload CV / Resume
              </label>
              
              {!file ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#E2E8F0] rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#F8FAFC] hover:border-[#3B82F6] transition-all group bg-[#F8FAFC]/50"
                >
                  <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl mb-4 group-hover:scale-105 transition-transform shadow-sm">
                    <Upload className="w-8 h-8 text-[#3B82F6]" />
                  </div>
                  <h3 className="font-bold text-[#0F172A] mb-1">Click to browse CV</h3>
                  <p className="text-xs text-[#64748B]">PDF document only (Max 5MB)</p>
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="border border-[#3B82F6]/20 bg-[#EFF6FF] rounded-2xl p-6 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4 truncate">
                    <div className="bg-white p-3 rounded-xl border border-[#DBEAFE] flex-shrink-0">
                      <FileText className="w-6 h-6 text-[#3B82F6]" />
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-[#0F172A] text-sm truncate">{file.name}</h4>
                      <p className="text-xs text-[#64748B] font-medium">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearFile} className="text-[#EF4444] hover:text-[#DC2626] hover:bg-red-50 font-bold">
                    Remove
                  </Button>
                </div>
              )}
            </div>

            {/* Right Col: Target Career */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <label className="text-xs font-bold tracking-widest text-[#94A3B8] uppercase flex items-center gap-2">
                  Step 2: Target Career <span className="text-[10px] font-bold bg-[#F1F5F9] text-[#64748B] px-2 py-0.5 rounded border border-[#E2E8F0]">Optional</span>
                </label>
                <div className="space-y-3">
                  <Input 
                    placeholder="e.g. Data Scientist, Product Manager..." 
                    className="h-14 bg-white border-[#E2E8F0] text-lg px-5 focus-visible:ring-[#3B82F6]/20 rounded-xl"
                    value={targetCareer}
                    onChange={(e) => setTargetCareer(e.target.value)}
                  />
                  <p className="text-xs text-[#64748B] px-1 font-medium italic">
                    If left blank, our AI will suggest the best-fitting career for you based on your CV profile.
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || !file}
                className="w-full h-14 text-lg font-bold bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-elevated rounded-xl"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" /> Analyzing Profile...
                  </>
                ) : (
                  <>
                    Analyze Skill Gap <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>

          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="mt-12 space-y-8 animate-in slide-in-from-bottom-5 fade-in duration-500">
            <div className="text-center">
              <div className="h-1 w-20 bg-[#3B82F6] rounded-full mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-3 text-[#0F172A]">Analysis for <span className="text-[#3B82F6]">{result.targetCareer}</span></h2>
              <p className="text-[#64748B] mb-8 max-w-xl mx-auto">Based on the rigorous comparison of your profile with industry benchmarks.</p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-10">
                {result.estimatedTimePattern && (
                  <div className="flex items-center gap-3 bg-white border border-[#E2E8F0] px-5 py-3 rounded-2xl shadow-soft">
                    <Clock className="w-5 h-5 text-[#3B82F6]" />
                    <span className="text-sm font-bold text-[#64748B]">Time to Bridge Gap: <span className="text-[#0F172A]">{result.estimatedTimePattern}</span></span>
                  </div>
                )}
                {result.estimatedSalary && (
                  <div className="flex items-center gap-3 bg-white border border-[#E2E8F0] px-5 py-3 rounded-2xl shadow-soft">
                    <IndianRupee className="w-5 h-5 text-[#10B981]" />
                    <span className="text-sm font-bold text-[#64748B]">Potential Salary: <span className="text-[#0F172A]">{result.estimatedSalary}</span></span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Acquired Skills */}
              <div className="bg-white border border-[#E2E8F0] p-8 rounded-[2rem] shadow-soft">
                <h3 className="font-bold text-lg flex items-center gap-3 mb-6 text-[#10B981]">
                  <CheckCircle2 className="w-6 h-6" /> Current Strengths
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.currentSkills.length > 0 ? result.currentSkills.map((skill, idx) => (
                    <span key={idx} className="bg-[#ECFDF5] border border-[#D1FAE5] text-[#047857] px-4 py-1.5 text-xs font-bold rounded-full">
                      {skill}
                    </span>
                  )) : (
                    <span className="text-[#64748B] text-sm italic">No relevant skills detected in the document yet.</span>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="bg-white border border-[#E2E8F0] p-8 rounded-[2rem] shadow-soft">
                <h3 className="font-bold text-lg flex items-center gap-3 mb-6 text-[#EF4444]">
                  <XCircle className="w-6 h-6" /> Skills to Acquire
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills.length > 0 ? result.missingSkills.map((skill, idx) => (
                    <span key={idx} className="bg-[#FEF2F2] border border-[#FEE2E2] text-[#B91C1C] px-4 py-1.5 text-xs font-bold rounded-full">
                      {skill}
                    </span>
                  )) : (
                    <span className="text-[#64748B] text-sm italic">You have all the core skills required! Excellent.</span>
                  )}
                </div>
              </div>
            </div>

            {/* AI Roadmap */}
            {result.roadmap && result.roadmap.length > 0 && (
              <div className="bg-[#0F172A] p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden text-white shadow-elevated">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Brain className="w-64 h-64 text-[#3B82F6]" />
                </div>
                
                <h3 className="text-3xl font-bold mb-4 relative z-10">Strategic Roadmap</h3>
                <p className="text-blue-200/80 mb-10 relative z-10 font-medium">Follow this step-by-step pathway to acquire your missing skills effectively.</p>
                
                <div className="space-y-8 relative z-10">
                  {result.roadmap.map((step, idx) => (
                    <div key={idx} className="flex gap-6 items-start group">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#3B82F6] text-white font-bold flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                        {step.step || idx + 1}
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-6 flex-1 backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                        <h4 className="font-bold text-xl mb-3 text-white">{step.title}</h4>
                        <p className="text-blue-100/70 text-sm leading-relaxed">{step.details}</p>
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
