import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24-48 hours.",
    });
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Office Address",
      details: ["Paramvasu Technologies Pvt. Ltd.", "B1/A, Ground Floor, Anand India Business Hub, Behind Shree Mahalaxmi Hospital, Deepak Hospital Road, Mira Road East, Thane, Maharashtra – 401107"],
    },
    {
      icon: Mail,
      title: "Email",
      details: ["info@paramvasu.com", "support@paramvasu.com"],
    },
    {
      icon: Phone,
      title: "Phone",
      details: ["+91 22 350 399 27"],
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Monday - Saturday", "9:00 AM - 7:00 PM IST"],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      <section className="relative pt-24 pb-16 md:pb-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-primary-dark/80"></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center">
            {/* Badge/Indicator */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-primary-foreground text-sm font-medium">Contact Support</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4">
              Get in Touch
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-6">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>

            {/* Quick Contact Links */}
            {/* <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Button variant="secondary" className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20">
                <Phone className="h-4 w-4 mr-2" />
                Call Now
              </Button>
              <Button variant="secondary" className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20">
                <Mail className="h-4 w-4 mr-2" />
                Email Us
              </Button>
            </div> */}
          </div>
        </div>

      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 99999 99999"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="How can we help?"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Your message..."
                      rows={5}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full sm:w-auto">
                    Send Message
                  </Button>
                </form>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <info.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">{info.title}</h3>
                      {info.details.map((detail, i) => (
                        <p key={i} className="text-muted-foreground text-sm">{detail}</p>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
