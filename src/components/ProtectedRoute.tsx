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
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
        <div className="relative h-24 w-24 mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-primary blur-xl opacity-50 animate-pulse-glow" />
          <div className="relative h-full w-full rounded-full glass flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        </div>
        <p className="text-muted-foreground font-medium animate-pulse">Verifying access...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col">
        <Navbar />
        
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="glow-orb bg-primary/30 w-[420px] h-[420px] top-1/4 left-1/2 -translate-x-1/2 animate-float-slow" />
        </div>

        <main className="flex-1 container pt-40 pb-20 flex flex-col items-center justify-center text-center animate-fade-up">
          <div className="h-20 w-20 rounded-full bg-gradient-primary/20 flex items-center justify-center mb-6 shadow-glow border border-primary/30">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Access <span className="text-gradient">Restricted</span>
          </h1>
          
          <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8">
            You need to be logged in to access this premium feature. Create a free account or login to continue your career journey.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="text-sm font-medium px-4 py-2 border border-primary/30 bg-primary/10 rounded-full text-foreground/80 flex items-center">
              Please use the <strong className="mx-1 text-foreground">Login / Signup</strong> buttons in the navigation bar above.
            </div>
            
            <Link to="/explore">
              <Button variant="ghost" className="hover:text-primary transition-colors">
                Explore Careers instead <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
