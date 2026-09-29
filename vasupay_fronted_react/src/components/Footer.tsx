import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Facebook, Instagram, Twitter } from "lucide-react";
import logo from '../../public/logo.png';

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="VasuPay Logo" className="rounded-lg" />
            </div>
            <p className="text-background/70 text-sm mb-4">
              Digital Seva for Every Bharat Bill
            </p>
            <p className="text-background/60 text-xs">
              A brand of Paramvasu Technologies Pvt. Ltd.
            </p>


            {/* Social Icons */}
        <div className="flex justify-start gap-6 mt-10">
          <a
            href="https://facebook.com"
            target="_blank"
            className="text-background/70 hover:text-accent transition-colors"
          >
            <Facebook className="h-5 w-5" />
          </a>

          <a
            href="https://instagram.com"
            target="_blank"
            className="text-background/70 hover:text-accent transition-colors"
          >
            <Instagram className="h-5 w-5" />
          </a>

          <a
            href="https://twitter.com"
            target="_blank"
            className="text-background/70 hover:text-accent transition-colors"
          >
            <Twitter className="h-5 w-5" />
          </a>
        </div>
          </div>


          

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link to="/" className="hover:text-accent transition-colors">Home</Link></li>
              <li><Link to="/#services" className="hover:text-accent transition-colors">Services</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><Link to="/terms" className="hover:text-accent transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link to="/refund" className="hover:text-accent transition-colors">Refund & Cancellation</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>

            <ul className="space-y-4 text-sm text-background/70">

              {/* Office Address */}
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-background">Office Address:</span>
                  <p className="mt-1">
                    B1/A, Ground Floor, Anand India Business Hub, Behind Shree Mahalaxmi Hospital,
                    Deepak Hospital Road, Mira Road East, Thane, Maharashtra – 401107
                  </p>
                </div>
              </li>

              {/* Regd Address */}
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-background">Regd. Address:</span>
                  <p className="mt-1">
                    Sh N B1/a, H N 01, Ground, Mahavir Nagar, Deepak Hos, Mira Road,
                    Thane, Maharashtra, India, 401107
                  </p>
                </div>
              </li>

              {/* Email */}
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href="mailto:info@paramvasu.com" className="hover:text-accent transition-colors">
                  info@paramvasu.com
                </a>
              </li>

              {/* Phone */}
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href="tel:+912235039927" className="hover:text-accent transition-colors">
                  +91 22 350 399 27
                </a>
              </li>
            </ul>
          </div>
        </div>

        

        <div className="border-t border-background/20 mt-12 pt-8 text-center text-sm text-background/60">
          <p>© {new Date().getFullYear()} All rights reserved. Paramvasu Technologies Pvt. Ltd.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
