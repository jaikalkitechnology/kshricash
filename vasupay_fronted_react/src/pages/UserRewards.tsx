import { UserShell } from "@/components/shells/UserShell";
import { Gift, Trophy, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const offers = [
  { id: 1, title: "Electricity Bill Cashback", description: "Get ₹50 cashback on bills above ₹1000", code: "POWER50", expiry: "Valid till 31 Jan 2025" },
  { id: 2, title: "Mobile Recharge Offer", description: "10% cashback up to ₹100", code: "MOBILE10", expiry: "Valid till 28 Jan 2025" },
  { id: 3, title: "DTH Recharge Special", description: "Flat ₹30 off on any DTH recharge", code: "DTH30", expiry: "Valid till 25 Jan 2025" },
];

const referralData = {
  code: "VASU2025",
  referred: 8,
  earned: 400,
};

const UserRewards = () => {
  return (
    <UserShell title="Rewards">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-md bg-gradient-accent">
            <CardContent className="p-6">
              <Trophy className="h-10 w-10 text-accent-foreground mb-4" />
              <p className="text-sm text-accent-foreground/80 mb-2">Total Cashback Earned</p>
              <p className="text-3xl font-bold">₹247</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardContent className="p-6">
              <Star className="h-10 w-10 text-warning mb-4" />
              <p className="text-sm text-muted-foreground mb-2">Reward Points</p>
              <p className="text-3xl font-bold">1,840</p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6">
              <Gift className="h-10 w-10 text-primary mb-4" />
              <p className="text-sm text-muted-foreground mb-2">Referral Earnings</p>
              <p className="text-3xl font-bold">₹{referralData.earned}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Active Offers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {offers.map((offer) => (
              <div key={offer.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{offer.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{offer.description}</p>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="font-mono">{offer.code}</Badge>
                      <span className="text-xs text-muted-foreground">{offer.expiry}</span>
                    </div>
                  </div>
                  <Button size="sm">Apply</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-md bg-gradient-primary text-primary-foreground">
          <CardHeader>
            <CardTitle>Referral Program</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm opacity-90 mb-2">Your Referral Code</p>
              <div className="flex items-center gap-3">
                <code className="text-2xl font-bold bg-primary-foreground/20 px-4 py-2 rounded">
                  {referralData.code}
                </code>
                <Button variant="secondary" size="sm">Copy</Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary-foreground/20">
              <div>
                <p className="text-sm opacity-80">Friends Referred</p>
                <p className="text-2xl font-semibold">{referralData.referred}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Total Earned</p>
                <p className="text-2xl font-semibold">₹{referralData.earned}</p>
              </div>
            </div>
            <p className="text-sm opacity-90 pt-2">
              Refer friends and earn ₹50 for each successful signup!
            </p>
          </CardContent>
        </Card>
      </div>
    </UserShell>
  );
};

export default UserRewards;
