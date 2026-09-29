import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield,
  Phone,
  Lock,
  Users,
  Building,
  UserCircle,
  ChevronDown,
  Copy,
  CheckCircle,
  Store,
  Briefcase,
  Network,
  Building2,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "../../public/logo.png";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, userRole } = useAuth();
  const { toast } = useToast();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  useEffect(() => {
    if (user && userRole) {
      if (userRole === "admin") navigate("/admin");
      else if (userRole === "partner") navigate("/partner");
      else if (userRole === "agent") navigate("/agent");
      else navigate("/user");
    }
  }, [user, userRole, navigate]);

  const mockAccounts = [
    {
      role: "Superadmin",
      phone: "9000000001",
      password: "Test@12345",
      icon: Shield,
      color: "bg-red-100 text-red-700 hover:bg-red-200",
      iconColor: "text-red-600",
    },
    {
      role: "White Label",
      phone: "9000000002",
      password: "Test@12345",
      icon: Building2,
      color: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
      iconColor: "text-indigo-600",
    },
    {
      role: "Agency",
      phone: "9000000003",
      password: "Test@12345",
      icon: Briefcase,
      color: "bg-orange-100 text-orange-700 hover:bg-orange-200",
      iconColor: "text-orange-600",
    },
    {
      role: "Distributor",
      phone: "9000000004",
      password: "Test@12345",
      icon: Network,
      color: "bg-cyan-100 text-cyan-700 hover:bg-cyan-200",
      iconColor: "text-cyan-600",
    },
    {
      role: "Partner",
      phone: "9000000005",
      password: "Test@12345",
      icon: Building,
      color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
      iconColor: "text-blue-600",
    },
    {
      role: "Retailer",
      phone: "9000000006",
      password: "Test@12345",
      icon: Store,
      color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
      iconColor: "text-emerald-600",
    },
    {
      role: "Merchant",
      phone: "9000000007",
      password: "Test@12345",
      icon: UserCircle,
      color: "bg-purple-100 text-purple-700 hover:bg-purple-200",
      iconColor: "text-purple-600",
    },
    {
      role: "Customer",
      phone: "9000000008",
      password: "Test@12345",
      icon: User,
      color: "bg-pink-100 text-pink-700 hover:bg-pink-200",
      iconColor: "text-pink-600",
    },
    {
      role: "Agent",
      phone: "9000000009",
      password: "Test@12345",
      icon: Users,
      color: "bg-green-100 text-green-700 hover:bg-green-200",
      iconColor: "text-green-600",
    },
  ];

  const handleMockLogin = (account: (typeof mockAccounts)[0]) => {
    setPhone(account.phone);
    setPassword(account.password);
    setIsSignUp(false);
    setSelectedAccount(account.role);

    toast({
      title: `${account.role} credentials loaded`,
      description: "Click 'Sign In' to continue",
    });
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    });
  };

  const handleAuth = async () => {
    if (!phone || !password || (isSignUp && !confirmPassword)) {
      toast({
        title: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const result = await signUp(phone, password, fullName);
        if (result.error) throw result.error;
        toast({
          title: "Account created successfully!",
          description: "You can now sign in",
        });
        setIsSignUp(false);
        setFullName("");
        setPhone("");
        setPassword("");
        setConfirmPassword("");
      } else {
        const result = await signIn(phone, password);
        if (result.error) throw result.error;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Authentication failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <img
              src={logo}
              alt="Kshricash Logo"
              className="mx-auto bg-vasu-deep rounded-[10%]"
            />
          </Link>
          <p className="text-gray-600 mt-2">Simple & Secure Payments</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardContent className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {isSignUp ? "Join us today" : "Sign in to continue"}
              </p>
            </div>

            <div className="space-y-4">
              {isSignUp && (
                <div>
                  <Label className="text-gray-700">Full Name</Label>
                  <Input
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label className="text-gray-700">Phone Number</Label>
                <Input
                  type="tel"
                  placeholder="9876543210"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-gray-700">Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isSignUp) handleAuth();
                  }}
                />
              </div>

              {isSignUp && (
                <div>
                  <Label className="text-gray-700">Confirm Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

              <Button
                onClick={handleAuth}
                className="w-full bg-gradient-to-r from-primary to-primary-dark hover:opacity-90 mt-6"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isSignUp ? "Creating..." : "Signing In..."}
                  </div>
                ) : isSignUp ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="text-center pt-4">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary hover:underline text-sm"
                >
                  {isSignUp
                    ? "Have an account? Sign In"
                    : "Need an account? Sign Up"}
                </button>
              </div>
            </div>

            {/* Quick Access with Dropdown */}
            <div className="pt-8 mt-8 border-t">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-600">
                  Quick Access
                </h3>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                    >
                      Select Role <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {mockAccounts.map((account) => {
                      const Icon = account.icon;
                      return (
                        <DropdownMenuItem
                          key={account.role}
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => handleMockLogin(account)}
                        >
                          <div className={`p-1 rounded ${account.color}`}>
                            <Icon className={`h-4 w-4 ${account.iconColor}`} />
                          </div>
                          <span>{account.role}</span>
                          {selectedAccount === account.role && (
                            <CheckCircle className="h-3 w-3 ml-auto text-green-500" />
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Selected Account Details */}
              {selectedAccount && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {
                        mockAccounts.find((a) => a.role === selectedAccount)
                          ?.role
                      }{" "}
                      Account
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => {
                        setPhone("");
                        setPassword("");
                        setSelectedAccount(null);
                      }}
                    >
                      Clear
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Phone className="h-3 w-3" />
                        <span>Phone:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-gray-800">
                          {
                            mockAccounts.find(
                              (a) => a.role === selectedAccount
                            )?.phone
                          }
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() =>
                            copyToClipboard(
                              mockAccounts.find(
                                (a) => a.role === selectedAccount
                              )?.phone || "",
                              "Phone"
                            )
                          }
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Lock className="h-3 w-3" />
                        <span>Password:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-gray-800">
                          {
                            mockAccounts.find(
                              (a) => a.role === selectedAccount
                            )?.password
                          }
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() =>
                            copyToClipboard(
                              mockAccounts.find(
                                (a) => a.role === selectedAccount
                              )?.password || "",
                              "Password"
                            )
                          }
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* All Accounts Grid */}
              <div className="grid grid-cols-3 gap-2">
                {mockAccounts.map((account) => {
                  const Icon = account.icon;
                  return (
                    <Button
                      key={account.role}
                      variant="outline"
                      size="sm"
                      onClick={() => handleMockLogin(account)}
                      className={`text-xs h-10 ${selectedAccount === account.role ? "ring-2 ring-primary" : ""}`}
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {account.role}
                    </Button>
                  );
                })}
              </div>

              <p className="text-xs text-gray-500 mt-2 text-center">
                Select a role to auto-fill credentials
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-gray-500 text-xs mt-8">
          Secure & encrypted platform &bull; &copy;{" "}
          {new Date().getFullYear()} Kshricash
        </p>
      </div>
    </div>
  );
};

export default Login;
