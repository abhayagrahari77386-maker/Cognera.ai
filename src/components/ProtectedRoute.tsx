import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2, Lock, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#334155] flex flex-col items-center justify-center">
        <div className="relative h-20 w-20 mb-8 mx-auto">
          <div className="relative h-full w-full rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center shadow-soft">
            <Loader2 className="h-8 w-8 text-[#3B82F6] animate-spin" />
          </div>
        </div>
        <p className="text-[#64748B] font-bold text-sm tracking-widest uppercase animate-pulse">Establishing Session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#334155] overflow-x-hidden flex flex-col">
        <Navbar />
        
        <main className="flex-1 container pt-48 pb-24 flex flex-col items-center justify-center text-center animate-fade-up">
          <div className="bg-white p-12 md:p-16 rounded-[2.5rem] border border-[#E5E7EB] shadow-elevated max-w-xl relative overflow-hidden">
            {/* Corner accent */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#3B82F6]/5 rounded-full blur-2xl" />
            
            <div className="h-20 w-20 rounded-3xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-10 mx-auto shadow-sm">
              <Lock className="h-10 w-10 text-[#3B82F6]" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-[#0F172A]">
              Premium Access <span className="text-[#3B82F6]">Required</span>
            </h1>
            
            <p className="text-[#64748B] text-lg font-medium mb-10 leading-relaxed">
              Unlock personalized career intelligence, roadmaps, and AI counseling by signing into your professional dashboard.
            </p>
            
            <div className="flex flex-col gap-6">
              <div className="text-sm font-bold p-5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-[#475569] flex flex-col items-center gap-2">
                <span className="text-[#94A3B8] uppercase tracking-widest text-[10px]">Action Required</span>
                <span>Please use the <strong className="text-[#3B82F6]">Login / Signup</strong> icons in the top bar.</span>
              </div>
              
              <Link to="/explore">
                <Button variant="ghost" className="font-bold text-[#64748B] hover:text-[#3B82F6] hover:bg-[#F1F5F9] h-12">
                  Browse Career Directory <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
