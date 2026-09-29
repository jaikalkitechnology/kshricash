import { AgentShell } from "@/components/shells/AgentShell";
import { LayoutDashboard, Users, Receipt, Settings, FileText, CreditCard } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AgentReports = () => {
  return (
    <AgentShell title="Reports">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Daily Transaction Report</h3>
          <p className="text-muted-foreground text-sm mb-4">View daily transaction summary and commission</p>
          <Button>Generate Report</Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Monthly Commission Report</h3>
          <p className="text-muted-foreground text-sm mb-4">Monthly earnings breakdown by service</p>
          <Button>Generate Report</Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Service-wise Performance</h3>
          <p className="text-muted-foreground text-sm mb-4">Performance analysis by BBPS service type</p>
          <Button>Generate Report</Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Customer Report</h3>
          <p className="text-muted-foreground text-sm mb-4">Customer activity and transaction patterns</p>
          <Button>Generate Report</Button>
        </Card>
      </div>
    </AgentShell>
  );
};

export default AgentReports;
