import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SeedTestAccounts = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const seedAccounts = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/seed-test-accounts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setResult(data.results);
      } else {
        setError(data.error || "Failed to seed accounts");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-gradient-primary rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Seed Test Accounts</CardTitle>
          <CardDescription>
            Create test accounts for Admin, Partner, and User roles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Test accounts seeded successfully!</p>
                  <div className="space-y-1">
                    {result.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{item.email}</span>
                        <Badge variant={item.status === 'created' ? 'default' : 'secondary'}>
                          {item.status} - {item.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
              <h3 className="font-semibold">Test Accounts to be created:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-mono">admin@test.com</span>
                  <Badge variant="destructive">Admin</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">partner@test.com</span>
                  <Badge variant="secondary">Partner</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">user@test.com</span>
                  <Badge>User</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                All accounts will use the password shown on the login page
              </p>
            </div>

            <Button
              onClick={seedAccounts}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding Accounts...
                </>
              ) : (
                "Seed Test Accounts"
              )}
            </Button>

            {result && (
              <Button
                onClick={() => window.location.href = '/login'}
                variant="outline"
                className="w-full"
              >
                Go to Login
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeedTestAccounts;
