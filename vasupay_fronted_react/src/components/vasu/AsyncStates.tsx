import { ReactNode } from "react";
import { AlertCircle, Inbox, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Skeleton grid placeholder while data loads. */
export function LoadingState({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)} aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}

/** Friendly error card with a retry action. */
export function ErrorState({
  message = "Something went wrong while loading this data.",
  onRetry,
  className,
}: {
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col items-center gap-3 p-8 text-center", className)}>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="h-6 w-6" />
      </span>
      <p className="font-medium text-destructive">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      )}
    </Card>
  );
}

/** Empty placeholder for zero-result lists. */
export function EmptyState({
  title = "Nothing here yet",
  message,
  icon,
  action,
  className,
}: {
  title?: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col items-center gap-3 p-8 text-center", className)}>
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
        {icon ?? <Inbox className="h-6 w-6" />}
      </span>
      <div>
        <p className="font-display text-lg font-semibold text-vasu-deep">{title}</p>
        {message && <p className="mt-1 text-sm text-muted-foreground">{message}</p>}
      </div>
      {action}
    </Card>
  );
}
