import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Flame, LogOut, User as UserIcon } from "lucide-react";
import logo from "@/assets/cognera-logo.png";
import AuthModal, { type AuthMode } from "@/components/AuthModal";

import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { toast } from "@/hooks/use-toast";

type NavLink = { label: string; href: string; type: "anchor" | "route" };

const links: NavLink[] = [
  { label: "Home", href: "/#home", type: "route" },
  { label: "Explore Careers", href: "/explore", type: "route" },
  { label: "Skill Gap Analyzer", href: "/skill-gap", type: "route" },
  { label: "Roadmaps", href: "/#how", type: "route" },
  { label: "AI Counselor", href: "/counselor", type: "route" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [user, setUser] = useState<User | null>(null);

  const navigate = useNavigate();
  const goAssessment = () => {
    setOpen(false);
    navigate("/assessment");
  };

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setAuthOpen(true);
    setOpen(false);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged out", description: "You have been successfully logged out." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to log out.", variant: "destructive" });
    }
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || "User";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-strong py-3" : "py-5 bg-transparent"
      }`}
    >
      <nav className="container flex items-center justify-between">
        <a href="#home" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/40 blur-xl rounded-full group-hover:bg-primary/60 transition" />
            <img src={logo} alt="Cognera AI logo" className="relative h-12 w-12 md:h-14 md:w-14 rounded-xl object-contain" />
          </div>
          <span className="font-display font-bold text-2xl md:text-3xl tracking-tight">
            Cognera <span className="text-gradient">AI</span>
          </span>
        </a>

        <ul className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                to={l.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-0 after:bg-gradient-primary after:transition-all hover:after:w-full"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-foreground/80 font-medium bg-background/50 px-3 py-1.5 rounded-full border border-primary/20">
                <UserIcon className="h-4 w-4 text-primary" /> 
                {displayName}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-1.5" /> Logout
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => openAuth("login")}
              >
                Login
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-primary/30 hover:border-primary/60 hover:bg-primary/10"
                onClick={() => openAuth("signup")}
              >
                Signup
              </Button>
            </>
          )}
          <Button variant="hero" size="sm" onClick={goAssessment}>
            Start Assessment <Flame className="ml-1 h-4 w-4" />
          </Button>
        </div>

        <button
          className="lg:hidden p-2 rounded-lg glass"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden glass-strong mt-3 mx-4 rounded-2xl p-6 animate-scale-in">
          <ul className="flex flex-col gap-4 mb-4">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  to={l.href}
                  onClick={() => setOpen(false)}
                  className="block text-base font-medium text-muted-foreground hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
            {user ? (
              <>
                <div className="flex items-center gap-2 pl-2 py-2 text-sm text-foreground">
                  <UserIcon className="h-4 w-4 text-primary" /> {displayName}
                </div>
                <Button variant="ghost" onClick={handleLogout} className="justify-start text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => openAuth("login")}>Login</Button>
                <Button variant="outline" className="border-primary/30" onClick={() => openAuth("signup")}>Signup</Button>
              </>
            )}
            <Button variant="hero" onClick={goAssessment}>Start Assessment <Flame className="ml-1 h-4 w-4" /></Button>
          </div>
        </div>
      )}

      <AuthModal
        open={authOpen}
        mode={authMode}
        onOpenChange={setAuthOpen}
        onModeChange={setAuthMode}
      />
    </header>
  );
};

export default Navbar;
