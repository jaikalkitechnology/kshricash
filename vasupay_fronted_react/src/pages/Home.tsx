import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";
import {
  Shield, Users, Wallet, Zap, Building2, UserCheck,
  Smartphone, CreditCard, Receipt, TrendingUp, Lock, Headphones,
  Home as HomeIcon, Plane, Train, IndianRupee, Gift, Clock,
  Landmark, FileText, Fingerprint, BadgeCheck, Banknote,
  PiggyBank, Target, Eye, Star, ArrowRight, CheckCircle2,
  Mail, Phone, MapPin
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const userServices = [
    { icon: Receipt, title: "BBPS Bill Payments", desc: "Electricity, gas, water, broadband & more", highlight: true },

    { icon: HomeIcon, title: "Rent Payment", desc: "Pay rent with PAN verified landlord (3x/month limit)", badge: "KYC Required" },

    { icon: Shield, title: "Insurance", desc: "Life, health & vehicle insurance payments" },

    { icon: FileText, title: "PAN Card Apply", desc: "Apply for new PAN card online",badge: "Coming Soon" },

    // ⭐ Coming Soon Services Added
    { icon: Fingerprint, title: "Aadhaar Update", desc: "Update your Aadhaar details seamlessly", badge: "Coming Soon" },

    { icon: Plane, title: "Flight Booking", desc: "Book domestic & international flights", badge: "Coming Soon" },

    { icon: Train, title: "IRCTC Booking", desc: "Train ticket reservations", badge: "Coming Soon" },

    { icon: IndianRupee, title: "UPI Payment", desc: "Coming soon - unified payments", badge: "Coming Soon" },

    { icon: Gift, title: "Cashback Rewards", desc: "Earn cashback on every transaction", highlight: true, badge: "Coming Soon" },
  ];


  const agencyServices = [
    { icon: Banknote, title: "AEPS Services", desc: "Aadhaar Enabled Payment System for cash withdrawal", highlight: true, badge: "Coming Soon" },
    { icon: Receipt, title: "Bharat Connect", desc: "Complete bill payment solutions for customers", badge: "Coming Soon" },
    { icon: HomeIcon, title: "Rent Payment", desc: "User & landlord KYC with PAN verification", badge: "Coming Soon" }, //badge: "KYC Enabled"
    { icon: Shield, title: "Insurance Services", desc: "Sell insurance policies to customers", badge: "Coming Soon" },
    { icon: PiggyBank, title: "Loan Services", desc: "Personal, home & business loan applications", badge: "Coming Soon" },
    { icon: Landmark, title: "Bank Account Opening", desc: "Open savings & current accounts instantly", badge: "Coming Soon" },
    { icon: CreditCard, title: "Credit Card Apply", desc: "Apply for credit cards from major banks", badge: "Coming Soon" },
    { icon: Plane, title: "Flight Tickets", desc: "Book flights and earn commission", badge: "Coming Soon" },
    { icon: Train, title: "IRCTC Tickets", desc: "Railway ticket booking services", badge: "Coming Soon" },
    { icon: IndianRupee, title: "Fixed Commission", desc: "Earn fixed commission on every transaction", highlight: true, badge: "Coming Soon" },
  ];


  const partnerBenefits = [
    { icon: Users, title: "Multi-Agency Mapping", desc: "Onboard and manage unlimited agencies under your network" },
    { icon: TrendingUp, title: "Commission Earnings", desc: "Earn commission from all agency transactions automatically" },
    { icon: Building2, title: "White-Label Platform", desc: "Launch your own branded fintech platform" },
    { icon: BadgeCheck, title: "Real-time Dashboard", desc: "Track all agency activities and earnings live" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-primary" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16 md:py-24">
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
              <Zap className="h-4 w-4" />
              India's Leading Fintech Platform
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 animate-fade-in">
              Digital Seva for Every<br />
              <span className="text-accent">Bharat Bill</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-4xl mx-auto animate-fade-in">
              Empowering India with 100+ financial services. From bill payments to banking,
              insurance to investments - all on one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button
                size="lg"
                onClick={() => navigate("/login")}
                className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
              >
                Explore Services
              </Button>
            </div>

            {/* 👇 Add this line */}




            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">

              {[
                { value: "100+", label: "Services" },
                { value: "1M+", label: "Transactions" },
                { value: "10K+", label: "Agents" },
                { value: "500+", label: "Partners" },
              ].map((stat, index) => (
                <div key={index} className="relative bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-4 md:p-6">

                  {/* 👇 Add Expecting Soon ONLY on the first card */}
                  {index === 0 && (
                    <p className="absolute -top-5 left-0 text-red-500 text-xs font-semibold">
                      Expecting Soon...
                    </p>
                  )}

                  <div className="text-2xl md:text-4xl font-bold text-accent">{stat.value}</div>
                  <div className="text-sm text-primary-foreground/80">{stat.label}</div>
                </div>
              ))}

            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 bg-gradient-to-r from-accent/10 via-background to-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-primary mb-4">
                <Target className="h-5 w-5" />
                <span className="font-semibold">Our Vision</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Largest Fintech Ecosystem in India
              </h2>
              <p className="text-muted-foreground text-lg">
                Building India's most comprehensive financial services platform that connects
                every citizen, business, and service provider through technology.
              </p>
            </div>
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-accent mb-4">
                <Eye className="h-5 w-5" />
                <span className="font-semibold">Our Aim</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Financial Inclusion for All
              </h2>
              <p className="text-muted-foreground text-lg">
                Bringing banking, payments, and financial services to every corner of Bharat -
                from metros to villages, ensuring no one is left behind.
              </p>
            </div>
          </div>
        </div>
      </section>

 {/* User Services Section - Modern Gradient */}
<section id="services" className="py-24 bg-gradient-to-b from-background to-secondary/10">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-success/20 to-success/5 text-success px-6 py-3 rounded-full text-base font-semibold mb-6 border border-success/20 backdrop-blur-sm">
        <Wallet className="h-5 w-5" />
        For Users
      </div>
      <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
        All Your Financial Needs, One Platform
      </h2>
      <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
        Pay bills, book tickets, apply for services and earn cashback on every transaction
      </p>
    </div>
    
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {userServices.map((service, index) => (
        <div
          key={index}
          className={`group relative p-8 rounded-2xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-background to-secondary/5 border hover:shadow-2xl hover:border-success/20 ${
            service.highlight 
              ? 'border-success/30 shadow-lg shadow-success/10' 
              : 'border-border hover:shadow-xl'
          }`}
        >
          {service.badge && (
            <span className={`absolute top-6 right-6 text-xs px-3 py-1.5 rounded-full font-semibold backdrop-blur-sm ${
              service.badge === 'Coming Soon'
                ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                : 'bg-success/10 text-success border border-success/20'
            }`}>
              {service.badge}
            </span>
          )}
          
          <div className="mb-6">
            <div className={`inline-flex p-3 rounded-xl mb-4 ${
              service.highlight
                ? 'bg-gradient-to-br from-success/20 to-success/5'
                : 'bg-gradient-to-br from-secondary/10 to-background'
            }`}>
              <service.icon className="h-8 w-8 text-success" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-success transition-colors">
              {service.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">{service.desc}</p>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-success/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
        </div>
      ))}
    </div>
  </div>
</section>

{/* Agency Services Section - Professional */}
<section className="py-24 bg-gradient-to-b from-background via-secondary/20 to-background">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/20 to-primary/5 text-primary px-6 py-3 rounded-full text-base font-semibold mb-6 border border-primary/20 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          <span>For Agents & Agencies</span>
        </div>
      </div>
      
      <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
        Start Your Digital Business
        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
          With Kshricash
        </span>
      </h2>
      
      <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
        Become a Kshricash agent and offer 100+ services to your customers with fixed commission on every transaction
      </p>
    </div>

    {/* Services Grid */}
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      {agencyServices.map((service, index) => (
        <div
          key={index}
          className={`group relative p-6 rounded-xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
            service.highlight
              ? 'bg-gradient-to-br from-primary/5 via-transparent to-primary/5 border-primary/30 shadow-lg shadow-primary/10'
              : 'bg-card border-border hover:border-primary/30'
          }`}
        >
          {/* Badge */}
          {service.badge && (
            <span className="absolute -top-2 right-4 text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md">
              {service.badge}
            </span>
          )}

          {/* Icon */}
          <div className={`mb-4 p-3 rounded-lg inline-flex transition-all duration-300 ${
            service.highlight
              ? 'bg-gradient-to-br from-primary/20 to-primary/5 shadow-sm'
              : 'bg-primary/10 group-hover:bg-primary/15'
          }`}>
            <service.icon className="h-7 w-7 text-primary" />
          </div>

          {/* Content */}
          <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            {service.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {service.desc}
          </p>

          {/* Hover Indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      ))}
    </div>

    {/* Commission CTA */}
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border border-primary/20 p-8 md:p-12">
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 to-transparent rounded-full -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent/5 to-transparent rounded-full translate-y-24 -translate-x-24" />
      
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 p-4 rounded-xl shadow-lg">
              <IndianRupee className="h-8 w-8 text-accent" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Earn Fixed Commission
            </h3>
            <p className="text-muted-foreground max-w-xl">
              Get guaranteed commission on every successful transaction.
            </p>
          </div>
        </div>
        
        {/* <button className="px-8 py-3 bg-gradient-to-r from-primary to-primary/80 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:scale-105">
          Start Earning Today
        </button> */}
      </div>
    </div>
  </div>
</section>

      {/* Partner Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Building2 className="h-4 w-4" />
                For Partners
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Build Your Fintech Empire
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Partner with Kshricash to create your own network of agencies.
                Map unlimited agents, manage their services, and earn commission from every transaction they process.
              </p>
              <div className="space-y-4">
                {partnerBenefits.map((benefit, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="bg-accent/10 p-2 rounded-lg shrink-0">
                      <benefit.icon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{benefit.title}</h4>
                      <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-accent via-accent to-accent-dark rounded-3xl p-8 text-accent-foreground">
              <h3 className="text-2xl font-bold mb-6">Why Partner with Kshricash?</h3>
              <ul className="space-y-4">
                {[
                  "Zero setup cost to start",
                  "Complete technology platform provided",
                  "Dedicated partner success manager",
                  "Real-time commission tracking",
                  "Training & support for your agents",
                  "Marketing materials provided",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent-foreground/80 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                size="lg"
                onClick={() => navigate("/login")}
                className="w-full mt-8 bg-foreground text-background hover:bg-foreground/90"
              >
                Become a Partner
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-8 text-primary-foreground">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Star className="h-6 w-6 text-accent" />
                  Our Mission
                </h3>
                <p className="text-primary-foreground/90 mb-8 text-lg">
                  To empower every Indian with seamless digital payment solutions,
                  bridging the gap between traditional and digital India through technology and trust.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary-foreground/10 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-accent">100+</div>
                    <div className="text-sm text-primary-foreground/80">Financial Services</div>
                  </div>
                  <div className="bg-primary-foreground/10 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-accent">Pan India</div>
                    <div className="text-sm text-primary-foreground/80">Network Coverage</div>
                  </div>
                  <div className="bg-primary-foreground/10 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-accent">24/7</div>
                    <div className="text-sm text-primary-foreground/80">Support Available</div>
                  </div>
                  <div className="bg-primary-foreground/10 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-accent">100%</div>
                    <div className="text-sm text-primary-foreground/80">Secure Platform</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                About Kshricash
              </h2>
              <p className="text-muted-foreground mb-4 text-lg">
                Kshricash is a flagship fintech service of <strong className="text-foreground">Paramvasu Technologies Pvt. Ltd.</strong>,
                building India's largest digital financial services ecosystem.
              </p>
              <p className="text-muted-foreground mb-4">
                Our platform integrates BBPS, AEPS, banking, insurance, travel, and numerous other services
                under one unified system - making financial services accessible to every Indian.
              </p>
              <p className="text-muted-foreground mb-8">
                With a rapidly growing network of partners and agents across India, we're committed to
                achieving complete financial inclusion - truly "Digital Seva for Every Bharat Bill".
              </p>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Bharat Connect Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Bank-Grade Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Get in Touch
            </h2>
            <p className="text-muted-foreground text-lg">
              Have questions? We're here to help you succeed.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="p-6 text-center hover:shadow-lg transition-all">
              <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Email Us</h3>
              <a href="mailto:info@paramvasu.com" className="text-primary hover:underline">
                info@paramvasu.com
              </a>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-all">
              <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Phone className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Call Us</h3>
              <a href="tel:+912235039927" className="text-primary hover:underline">
                +91 22 350 399 27
              </a>
            </Card>
            {/* <Card className="p-6 text-center hover:shadow-lg transition-all">
              <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Visit Us</h3>
              <p className="text-muted-foreground text-sm">
                Sh N B1/a, H N 01, Ground,<br /> Mahavir Nagar, Deepak Hos, Mira Road, Thane, Maharashtra, India, 401107
              </p>
            </Card> */}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary-dark to-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-10 w-64 h-64 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Transform Your Financial Journey?
          </h2>
          <p className="text-primary-foreground/90 mb-8 text-lg max-w-2xl mx-auto">
            Join thousands of users, partners, and agents who trust Kshricash for their digital financial needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-10 py-6 shadow-lg"
            >
              Join Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/contact")}
              className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-10 py-6 shadow-lg"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;