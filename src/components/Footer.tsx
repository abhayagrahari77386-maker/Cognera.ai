import { Twitter, Linkedin, Github, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/cognera-logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-12 relative">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Cognera AI" className="h-9 w-9 rounded-lg" />
              <span className="font-display font-bold text-xl">
                Cognera <span className="text-gradient">AI</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Think Deeper. Solve Smarter. Smarter choices for a smarter career.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/#home" className="hover:text-primary transition">Home</Link></li>
              <li><Link to="/explore" className="hover:text-primary transition">Explore Careers</Link></li>
              <li><Link to="/#how" className="hover:text-primary transition">Roadmaps</Link></li>
              <li><Link to="/counselor" className="hover:text-primary transition">AI Counselor</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">Connect</h4>
            <div className="flex gap-3">
              {[Twitter, Linkedin, Github, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="glass p-2.5 rounded-xl hover:border-primary/50 hover:shadow-glow hover:-translate-y-0.5 transition-all"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border/50 text-center text-sm text-muted-foreground">
          © 2026 Cognera AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
