import { UserShell } from "@/components/shells/UserShell";
import { User, Bell, Shield, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const UserSettings = () => {
  return (
    <UserShell title="Settings">
      <div className="mx-auto max-w-4xl space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input defaultValue="Rajesh Kumar" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue="rajesh@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Mobile Number</Label>
                <Input defaultValue="+91 9876543210" />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" defaultValue="1990-05-15" />
              </div>
            </div>
            <Button>Update Profile</Button>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Transaction Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified for all transactions</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Promotional Offers</p>
                <p className="text-sm text-muted-foreground">Receive cashback and offer updates</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Bill Reminders</p>
                <p className="text-sm text-muted-foreground">Remind me before due dates</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" placeholder="Enter current password" />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" placeholder="Enter new password" />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input type="password" placeholder="Confirm new password" />
            </div>
            <Button variant="secondary">Change Password</Button>
            
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                </div>
                <Button size="sm" variant="outline">Enable</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </UserShell>
  );
};

export default UserSettings;
