import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const BHARAT_CONNECT_LOGO = "/bharat-connect/logo.svg";

/**
 * Bharat Connect strip: descriptor + environment on the left, the Bharat Connect
 * logo on the right. (Airtel logo intentionally not shown per NPCI branding.)
 */
export function BbpsBrandBar({
  bharatConnectLogo = BHARAT_CONNECT_LOGO,
  environment,
  poweredBy = "Bharat Connect via Airtel Payments Bank",
}: {
  /** Kept for API compatibility; Airtel logo is no longer rendered. */
  airtelLogo?: string;
  bharatConnectLogo?: string;
  environment?: string;
  poweredBy?: string;
}) {
  const [bcErr, setBcErr] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground sm:text-sm">{poweredBy}</span>
        {environment && (
          <Badge variant={environment === "PROD" ? "default" : "secondary"} className="font-mono text-[10px]">
            {environment}
          </Badge>
        )}
      </div>

      {/* Bharat Connect logo — right aligned */}
      {bharatConnectLogo && !bcErr ? (
        <img src={bharatConnectLogo} alt="Bharat Connect" className="h-7 w-auto" onError={() => setBcErr(true)} />
      ) : (
        <span className="font-display text-sm font-semibold">
          <span className="text-vasu-deep">Bharat</span> <span className="text-saffron">Connect</span>
        </span>
      )}
    </div>
  );
}
