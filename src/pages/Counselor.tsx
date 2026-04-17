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
            .map((x: any) => `- ${x.field}: ${x.score}/100 (${x.reason})`)
            .join("\n");
          const rejected = (p.rejectedFields || [])
            .slice(0, 3)
            .map((x: any) => `- ${x.field}: ${x.reason}`)
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
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />

      {/* Background atmosphere */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="glow-orb animate-float-slow" style={{ top: -120, left: -120, width: 420, height: 420, background: "hsl(217 92% 60% / 0.55)" }} />
        <div className="glow-orb animate-float-slow" style={{ bottom: -160, right: -120, width: 480, height: 480, background: "hsl(262 83% 58% / 0.5)" }} />
        <div className="grid-bg absolute inset-0 opacity-40" />
      </div>

      <main className="container max-w-4xl pt-32 pb-16">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Powered by Cognera AI</span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl mt-5">
            AI Career <span className="text-gradient">Counselor</span> 🤖
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Ask anything about your career confusion and get AI guidance instantly.
          </p>
        </div>

        {/* Chat card */}
        <div className="glass rounded-3xl overflow-hidden border border-primary/20 shadow-elevated">
          {/* Card header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-primary/10 bg-card/50">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-primary grid place-items-center font-bold text-primary-foreground shadow-glow">
              AI
              <span className="absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full bg-success ring-2 ring-card" />
            </div>
            <div className="flex-1">
              <div className="font-semibold">Cognera Counselor</div>
              <div className="text-xs text-muted-foreground">Online · ready to help</div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearChat} className="text-muted-foreground hover:text-foreground">
              <Trash2 className="h-4 w-4 mr-1" /> Clear
            </Button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="h-[460px] overflow-y-auto px-6 py-6 flex flex-col gap-4"
            style={{
              background:
                "radial-gradient(circle at 20% 0%, hsl(217 92% 60% / 0.08), transparent 40%), radial-gradient(circle at 80% 100%, hsl(262 83% 58% / 0.08), transparent 40%)",
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 max-w-[82%] animate-scale-in ${
                  m.role === "user" ? "self-end flex-row-reverse" : "self-start"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl grid place-items-center text-xs font-bold flex-shrink-0 ${
                    m.role === "user"
                      ? "bg-secondary/25 text-primary-glow"
                      : "bg-gradient-primary text-primary-foreground"
                  }`}
                >
                  {m.role === "user" ? "You" : "AI"}
                </div>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                    m.role === "user"
                      ? "bg-gradient-primary text-primary-foreground rounded-br-md shadow-glow"
                      : "bg-card/85 border border-primary/15 rounded-bl-md backdrop-blur-md"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex gap-2.5 max-w-[82%] self-start animate-scale-in">
                <div className="w-8 h-8 rounded-xl grid place-items-center text-xs font-bold bg-gradient-primary text-primary-foreground">
                  AI
                </div>
                <div className="px-4 py-3 rounded-2xl bg-card/85 border border-primary/15 rounded-bl-md backdrop-blur-md">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-glow animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-glow animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-glow animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-2 px-5 pt-4">
            <button
              type="button"
              onClick={startInterview}
              className="px-3.5 py-2 rounded-full text-xs bg-primary/15 border border-primary/40 text-foreground hover:border-primary/70 hover:bg-primary/20 transition-all"
            >
              Start AI Interview (adaptive)
            </button>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="px-3.5 py-2 rounded-full text-xs bg-card/70 border border-primary/20 text-muted-foreground hover:text-foreground hover:border-primary/55 hover:bg-primary/10 hover:-translate-y-0.5 transition-all"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input row */}
          {interviewMode && (
            <div className="px-5 pt-3 text-xs text-muted-foreground">
              Interview progress: {Math.min(interviewProgress, interviewTarget)}/{interviewTarget}
            </div>
          )}
          <form
            className="flex gap-2.5 p-4 md:p-5 border-t border-primary/10 bg-card/40"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={interviewMode ? "Type your answer..." : "Type your career question…"}
              className="flex-1 h-12 rounded-2xl bg-card/85 border-primary/20 focus-visible:border-primary/70 focus-visible:ring-primary/15"
              aria-label="Type your career question"
            />
            <Button type="submit" variant="hero" className="h-12 rounded-2xl px-5" disabled={!input.trim() || typing}>
              <Send className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Send</span>
            </Button>
          </form>
        </div>

        <p className="text-center mt-5 text-xs text-muted-foreground">
          Tip: Press <kbd className="px-1.5 py-0.5 rounded border border-primary/20 bg-card">Enter</kbd> to send. Responses are AI-generated suggestions, not professional advice.
        </p>
      </main>

      <Footer />
    </div>
  );
};

export default Counselor;
