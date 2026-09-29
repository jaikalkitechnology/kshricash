import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Users, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const roles = [
    {
      title: "Admin Panel",
      description: "Master control for platform-wide settings, compliance, and monitoring",
      icon: Shield,
      path: "/admin",
      color: "bg-gradient-primary text-primary-foreground",
    },
    {
      title: "Partner Dashboard",
      description: "White-label management, agent control, and business analytics",
      icon: Users,
      path: "/partner",
      color: "bg-gradient-accent text-accent-foreground",
    },
    {
      title: "User Dashboard",
      description: "Personal wallet, bill payments, and transaction history",
      icon: Wallet,
      path: "/user",
      color: "bg-success text-success-foreground",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-primary-foreground drop-shadow-lg">
          VasuPay
        </h1>
        <p className="text-xl md:text-2xl text-primary-foreground/90 font-medium">
          Digital Seva for Every Bharat Bill
        </p>
        <p className="text-primary-foreground/80 mt-2">
          Powered by Paramvasu Technologies Pvt. Ltd.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl w-full">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <Card
              key={role.path}
              className="p-8 hover:shadow-glow transition-all cursor-pointer group"
              onClick={() => navigate(role.path)}
            >
              <div className={`${role.color} p-4 rounded-lg inline-flex mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{role.title}</h2>
              <p className="text-muted-foreground mb-6">{role.description}</p>
              <Button className="w-full" variant="outline">
                Access Dashboard
              </Button>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 text-center text-primary-foreground/70">
        <p className="text-sm">© 2025 Paramvasu Technologies Pvt. Ltd. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Index;
