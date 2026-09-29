import { AgentShell } from "@/components/shells/AgentShell";
import { BbpsServiceCenter } from "@/components/bbps/BbpsServiceCenter";

const AgentBBPS = () => {
  return (
    <AgentShell title="Bharat Connect">
      <div className="mx-auto max-w-4xl">
        <BbpsServiceCenter mode="agent" />
      </div>
    </AgentShell>
  );
};

export default AgentBBPS;
