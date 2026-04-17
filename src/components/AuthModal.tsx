import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame, Mail, Lock, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export type AuthMode = "login" | "signup";

interface AuthModalProps {
  open: boolean;
  mode: AuthMode;
  onOpenChange: (open: boolean) => void;
  onModeChange: (mode: AuthMode) => void;
}

const AuthModal = ({ open, mode, onOpenChange, onModeChange }: AuthModalProps) => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Reset form when modal closes or mode switches
  useEffect(() => {
    if (!open) {
      setForm({ fullName: "", email: "", password: "", confirmPassword: "" });
    }
  }, [open, mode]);

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "login") {
      if (!form.email || !form.password) {
        toast({ title: "Missing fields", description: "Email and password are required.", variant: "destructive" });
        return;
      }
      toast({ title: "Welcome back!", description: "Login successful." });
      onOpenChange(false);
      return;
    }

    // Signup
    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      toast({ title: "Missing fields", description: "All fields are required.", variant: "destructive" });
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please confirm your password.", variant: "destructive" });
      return;
    }
    toast({ title: "Account created!", description: "Welcome to Cognera AI." });
    onOpenChange(false);
  };

  const isLogin = mode === "login";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-strong border-primary/20 bg-background/80 backdrop-blur-2xl shadow-glow">
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Flame className="h-6 w-6 text-primary-foreground" />
          </div>
          <DialogTitle className="text-2xl font-display font-bold tracking-tight text-center">
            {isLogin ? "Welcome back" : "Create your account"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isLogin
              ? "Sign in to continue your career journey."
              : "Start discovering your perfect career path with AI."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Jane Doe"
                  value={form.fullName}
                  onChange={handleChange("fullName")}
                  className="pl-9 bg-background/50"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange("email")}
                className="pl-9 bg-background/50"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {isLogin && (
                <button
                  type="button"
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                  onClick={() => toast({ title: "Reset link sent", description: "Check your email." })}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange("password")}
                className="pl-9 bg-background/50"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  className="pl-9 bg-background/50"
                  required
                />
              </div>
            </div>
          )}

          <Button type="submit" variant="hero" className="w-full mt-2">
            {isLogin ? "Login" : "Create Account"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => onModeChange(isLogin ? "signup" : "login")}
            className="text-primary font-medium hover:text-primary/80 transition-colors"
          >
            {isLogin ? "Signup" : "Login"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
