import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../../public/logo.png";

const PublicNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname, hash } = useLocation(); // ✅ Track both path + hash

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/#services" },
    { name: "About", href: "/#about" },
    { name: "Contact", href: "/contact" },
  ];

  // ✅ Decide which link is active
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return hash === `#${href.substring(2)}`;
    return pathname === href;
  };

  const handleNavClick = (href: string) => {
    setIsOpen(false);

    if (href.startsWith("/#")) {
      const element = document.getElementById(href.substring(2));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo + Bharat Connect mnemonic */}
          <Link to="/" className="flex min-w-0 items-center gap-3">
            {/* Wide wordmark: keep its aspect ratio; dark tile keeps the light "Kshri" text legible */}
            <span className="flex shrink-0 items-center rounded-lg bg-vasu-deep px-2 py-1 sm:px-3">
              <img
                src={logo}
                alt="Kshricash Logo"
                className="h-9 w-auto max-w-[55vw] object-contain sm:h-11 lg:h-12"
              />
            </span>
            <img
              src="/bharat-connect/logo.svg"
              alt="Bharat Connect"
              className="hidden h-8 w-auto shrink-0 sm:block"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`
                  text-muted-foreground hover:text-foreground transition-colors font-medium
                  ${isActive(link.href) ? "text-primary font-semibold" : ""}
                `}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Login Button */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              onClick={() => navigate("/login")}
              className="bg-primary hover:bg-primary/90"
            >
              Join Now
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[280px]">
              <div className="flex flex-col gap-6 mt-8">

                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className={`
                      text-lg font-medium transition-colors
                      ${isActive(link.href) ? "text-primary font-semibold" : "text-foreground"}
                    `}
                  >
                    {link.name}
                  </Link>
                ))}

                <Button
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/login");
                  }}
                  className="mt-4"
                >
                  Login
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
