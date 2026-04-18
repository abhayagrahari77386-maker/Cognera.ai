import { Twitter, Linkedin, Github, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/cognera-logo.png";

const Footer = () => {
  return (
    <footer className="bg-[#F1F5F9] border-t border-border py-16 relative">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-10 mb-10">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Cognera AI" className="h-10 w-10 rounded-lg" />
              <span className="font-display font-bold text-xl text-[#0F172A]">
                Cognera <span className="text-[#3B82F6]">AI</span>
              </span>
            </Link>
            <p className="text-sm text-[#64748B] max-w-xs">
              Think Deeper. Solve Smarter. Smarter choices for a smarter career.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-[#0F172A]">Quick Links</h4>
            <ul className="space-y-2 text-sm text-[#64748B]">
              <li><Link to="/#home" className="hover:text-primary transition">Home</Link></li>
              <li><Link to="/explore" className="hover:text-primary transition">Explore Careers</Link></li>
              <li><Link to="/#how" className="hover:text-primary transition">Roadmaps</Link></li>
              <li><Link to="/counselor" className="hover:text-primary transition">AI Counselor</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-[#0F172A]">Connect</h4>
            <div className="flex gap-3">
              {[Twitter, Linkedin, Github, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="bg-white border border-border p-2.5 rounded-xl hover:border-primary/50 hover:shadow-soft hover:-translate-y-0.5 transition-all text-[#475569]"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border/50 text-center text-sm text-[#64748B]">
          © 2026 Cognera AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
