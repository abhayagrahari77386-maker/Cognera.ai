import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Trash2 } from "lucide-react";

type Role = "user" | "ai";
interface Message {
  id: string;
  role: Role;
  text: string;
}

interface InterviewTurn {
  question: string;
  answer: string;
  dimensionKey?: string;
}

const SUGGESTIONS = [
  "What career suits me?",
  "I am confused between engineering and design",
  "Which skills should I learn for the future?",
  "Is data science a good career?",
];

const GREETING =
  "Hi! I'm your Cognera AI Career Counselor. 🤖\n\nTell me about your interests, strengths, or what's confusing you about your career — I'll help you find clarity.";

const Counselor = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: "greet", role: "ai", text: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [interviewMode, setInterviewMode] = useState(false);
  const [interviewTurns, setInterviewTurns] = useState<InterviewTurn[]>([]);
  const [currentInterviewQuestion, setCurrentInterviewQuestion] = useState("");
  const [currentDimensionKey, setCurrentDimensionKey] = useState("");
  const [interviewProgress, setInterviewProgress] = useState(0);
  const [interviewTarget, setInterviewTarget] = useState(14);
  const scrollRef = useRef<HTMLDivElement>(null);
  const interviewSessionIdRef = useRef<string>(crypto.randomUUID());

  useEffect(() => {
    const storedTurns = localStorage.getItem("cognera_interview_turns");
    if (!storedTurns) return;
    try {
      const parsed = JSON.parse(storedTurns) as InterviewTurn[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setInterviewTurns(parsed);
      }
    } catch (error) {
      console.error("Failed to parse stored interview turns", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cognera_interview_turns", JSON.stringify(interviewTurns));
  }, [interviewTurns]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const startInterview = async () => {
    if (typing) return;
    setInterviewMode(true);
    setInterviewTurns([]);
    setCurrentInterviewQuestion("");
    setCurrentDimensionKey("");
    setInterviewProgress(0);
    setInterviewTarget(14);
    interviewSessionIdRef.current = crypto.randomUUID();
    setTyping(true);
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "ai",
        text: "Great! I will ask one question at a time. I will continue until I have enough clarity for your best-fit career prediction.",
      },
    ]);

    try {
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");
      const response = await fetch(`${API_URL}/api/interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: interviewSessionIdRef.current,
          qaHistory: [],
        }),
      });
      if (!response.ok) throw new Error("Failed to start interview");
      const data = await response.json();
      const firstQuestion = data?.question || "Tell me about subjects that you enjoy the most.";
      setCurrentInterviewQuestion(firstQuestion);
      setCurrentDimensionKey(String(data?.dimensionKey || ""));
      setInterviewProgress(Number(data?.progress || 0));
      setInterviewTarget(Number(data?.targetQuestions || 14));
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "ai", text: firstQuestion }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "ai",
          text: "I couldn't start the interview right now. Please try again.",
        },
      ]);
      setInterviewMode(false);
      setInterviewTurns([]);
      setCurrentInterviewQuestion("");
      setCurrentDimensionKey("");
      setInterviewProgress(0);
      setInterviewTarget(14);
    } finally {
      setTyping(false);
    }
  };

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || typing) return;
    
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      if (interviewMode) {
        const nextTurns = [
          ...interviewTurns,
          {
            question: currentInterviewQuestion || `Question ${interviewTurns.length + 1}`,
            answer: text,
            dimensionKey: currentDimensionKey || undefined,
          },
        ];
        setInterviewTurns(nextTurns);

        const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");
        const response = await fetch(`${API_URL}/api/interview`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: interviewSessionIdRef.current,
            qaHistory: nextTurns,
          }),
        });

        if (!response.ok) throw new Error("Failed to continue interview");
        const data = await response.json();

        if (data?.done && data?.prediction) {
          const p = data.prediction;
          const compared = (p.comparedFieldScores || [])
            .slice(0, 5)
            .map((x: { field: string; score: number; reason: string }) => `- ${x.field}: ${x.score}/100 (${x.reason})`)
            .join("\n");
          const rejected = (p.rejectedFields || [])
            .slice(0, 3)
            .map((x: { field: string; reason: string }) => `- ${x.field}: ${x.reason}`)
            .join("\n");

          const resultText = `Best-fit field: ${p.predictedField}\nCluster: ${p.careerCluster}\nConfidence: ${p.confidence}%\n\nWhy this fits:\n- ${(p.whyThisFieldFits || []).join("\n- ")}\n\nCompared fields:\n${compared || "- Analysis completed across major clusters."}\n\nLower-fit fields:\n${rejected || "- Not enough mismatch data provided."}\n\nNext steps:\n- ${(p.nextSteps || []).join("\n- ")}`;
          setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "ai", text: resultText }]);
          setInterviewMode(false);
          setCurrentInterviewQuestion("");
          setCurrentDimensionKey("");
          setInterviewProgress(Number(data?.progress || nextTurns.length));
        } else {
          setCurrentInterviewQuestion(data?.question || "Thanks. Tell me more.");
          setCurrentDimensionKey(String(data?.dimensionKey || ""));
          setInterviewProgress(Number(data?.progress || nextTurns.length));
          setInterviewTarget(Number(data?.targetQuestions || 14));
          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: "ai", text: data?.question || "Thanks. Tell me more." },
          ]);
        }
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.concat(userMsg).map(m => ({
            role: m.role === "ai" ? "assistant" : "user",
            content: m.text
          }))
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      console.log("Chat response data:", data);
      
      if (!data.text) {
        throw new Error("AI returned empty response");
      }

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "ai", text: data.text },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "ai", text: "I'm sorry, I'm having trouble connecting right now. Please try again later." },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([{ id: "greet", role: "ai", text: GREETING }]);
    setInterviewMode(false);
    setInterviewTurns([]);
    setCurrentInterviewQuestion("");
    setCurrentDimensionKey("");
    setInterviewProgress(0);
    setInterviewTarget(14);
    localStorage.removeItem("cognera_interview_turns");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#334155] overflow-x-hidden">
      <Navbar />

      <main className="container max-w-4xl pt-32 pb-16">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-[#DBEAFE] border border-[#BFDBFE] px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="h-4 w-4 text-[#3B82F6]" />
            <span className="text-[#1D4ED8]">Powered by Cognera AI</span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-[#0F172A]">
            AI Career <span className="text-[#3B82F6]">Counselor</span> 🤖
          </h1>
          <p className="text-[#64748B] text-lg mt-4 max-w-xl mx-auto">
            Get instant, intelligent guidance on your career path, skills, and goals.
          </p>
        </div>

        {/* Chat card */}
        <div className="bg-white rounded-[2rem] overflow-hidden border border-[#E5E7EB] shadow-elevated">
          {/* Card header */}
          <div className="flex items-center gap-4 px-6 py-5 border-b border-[#F1F5F9] bg-white">
            <div className="relative w-12 h-12 rounded-2xl bg-[#3B82F6] grid place-items-center font-bold text-white shadow-soft">
              AI
              <span className="absolute -right-0.5 -bottom-0.5 w-3.5 h-3.5 rounded-full bg-[#10B981] ring-2 ring-white" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-[#0F172A]">Cognera Expert</div>
              <div className="text-xs font-semibold text-[#10B981] flex items-center gap-1.5Caps">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                Active now · Ready to help
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearChat} className="text-[#64748B] hover:text-[#EF4444] hover:bg-red-50 font-bold transition-all">
              <Trash2 className="h-4 w-4 mr-2" /> Clear
            </Button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="h-[500px] overflow-y-auto px-6 py-8 flex flex-col gap-6 bg-[#F8FAFC]/30"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3.5 max-w-[85%] animate-fade-up ${
                  m.role === "user" ? "self-end flex-row-reverse" : "self-start"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl grid place-items-center text-[10px] font-black tracking-tighter flex-shrink-0 animate-scale-in border ${
                    m.role === "user"
                      ? "bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]"
                      : "bg-[#3B82F6] text-white border-[#2563EB]"
                  }`}
                >
                  {m.role === "user" ? "YOU" : "AI"}
                </div>
                <div
                  className={`px-5 py-4 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap break-words shadow-sm transition-all ${
                    m.role === "user"
                      ? "bg-[#3B82F6] text-white rounded-tr-none"
                      : "bg-white border border-[#E5E7EB] text-[#334155] rounded-tl-none"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex gap-3.5 max-w-[85%] self-start animate-fade-up">
                <div className="w-9 h-9 rounded-xl grid place-items-center text-[10px] font-black tracking-tighter bg-[#3B82F6] text-white border border-[#2563EB] flex-shrink-0">
                  AI
                </div>
                <div className="px-5 py-4 rounded-2xl bg-white border border-[#E5E7EB] rounded-tl-none shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="px-6 pt-6 pb-2">
            <h4 className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3 px-1">Common Questions</h4>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={startInterview}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-all shadow-soft"
              >
                Start Career Analysis Interview
              </button>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569] hover:border-[#3B82F6] hover:text-[#3B82F6] hover:bg-white transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Input row */}
          <div className="p-6">
            {interviewMode && (
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="flex-1 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#3B82F6] transition-all duration-500" 
                    style={{ width: `${(Math.min(interviewProgress, interviewTarget) / interviewTarget) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-black text-[#64748B] uppercase tracking-tighter">
                  Analysis Progress: {Math.min(interviewProgress, interviewTarget)}/{interviewTarget}
                </span>
              </div>
            )}
            <form
              className="flex gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={interviewMode ? "Provide your detailed answer..." : "Ask your career question…"}
                className="flex-1 h-14 rounded-2xl bg-[#F8FAFC] border-[#E5E7EB] focus-visible:ring-[#3B82F6]/20 text-base px-6 font-medium"
                aria-label="Type your career question"
              />
              <Button type="submit" variant="hero" className="h-14 rounded-2xl px-8 bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-soft font-bold" disabled={!input.trim() || typing}>
                <Send className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Send Message</span>
              </Button>
            </form>
          </div>
        </div>

        <p className="text-center mt-6 text-xs font-medium text-[#94A3B8]">
          Shift + Enter for new line. AI suggestions are for guidance only.
        </p>
      </main>

      <Footer />
    </div>
  );
};

export default Counselor;
