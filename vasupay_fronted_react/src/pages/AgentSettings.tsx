import { AgentShell } from "@/components/shells/AgentShell";
import { LayoutDashboard, Users, Receipt, Settings, FileText, CreditCard } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const AgentSettings = () => {
  return (
    <AgentShell title="Settings">
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Agent Profile</h2>
          <div className="space-y-4">
            <div>
              <Label>Shop Name</Label>
              <Input placeholder="Enter shop name" />
            </div>
            <div>
              <Label>Agent Name</Label>
              <Input placeholder="Enter your name" />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input placeholder="+91 XXXXX XXXXX" />
            </div>
            <div>
              <Label>Shop Address</Label>
              <Input placeholder="Enter shop address" />
            </div>
            <Button>Update Profile</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Commission Settings</h2>
          <div className="space-y-4">
            <div>
              <Label>Commission Payout Account</Label>
              <Input placeholder="Bank account number" />
            </div>
            <div>
              <Label>IFSC Code</Label>
              <Input placeholder="Enter IFSC code" />
            </div>
            <Button>Update Banking Details</Button>
          </div>
        </Card>
      </div>
    </AgentShell>
  );
};

export default AgentSettings;
