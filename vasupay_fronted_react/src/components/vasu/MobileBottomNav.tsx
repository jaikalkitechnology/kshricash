import { NavLink, useNavigate } from "react-router-dom";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BottomNavItem {
  label: string;
  icon: LucideIcon;
  path: string;
  end?: boolean;
}

export interface BottomNavCenter {
  label: string;
  icon: LucideIcon;
  path?: string;
  onClick?: () => void;
}

interface MobileBottomNavProps {
  items: BottomNavItem[];
  center?: BottomNavCenter;
}

/**
 * Fixed mobile bottom navigation with a raised saffron center FAB.
 * Mirrors `.bot-nav` from the design system. Hidden on lg+ (desktop uses the sidebar).
 */
export function MobileBottomNav({ items, center }: MobileBottomNavProps) {
  const navigate = useNavigate();

  // split items around the center action
  const mid = Math.ceil(items.length / 2);
  const left = center ? items.slice(0, mid) : items;
  const right = center ? items.slice(mid) : [];

  const renderItem = (item: BottomNavItem) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.path}
        to={item.path}
        end={item.end}
        className={({ isActive }) =>
          cn(
            "flex flex-1 flex-col items-center gap-1 text-[10px] font-semibold transition-colors",
            isActive ? "text-vasu-deep" : "text-stone"
          )
        }
      >
        <Icon className="h-5 w-5" />
        <span>{item.label}</span>
      </NavLink>
    );
  };

  const CenterIcon = center?.icon;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-[72px] items-center justify-around border-t border-border bg-card px-3 pb-3 shadow-[0_-4px_20px_rgba(10,63,58,0.06)] lg:hidden">
      {left.map(renderItem)}

      {center && CenterIcon && (
        <button
          type="button"
          aria-label={center.label}
          onClick={() => (center.onClick ? center.onClick() : center.path && navigate(center.path))}
          className="-mt-8 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-saffron text-white shadow-[0_10px_24px_rgba(255,107,53,0.4)] transition hover:brightness-105"
        >
          <CenterIcon className="h-5 w-5" />
        </button>
      )}

      {right.map(renderItem)}
    </nav>
  );
}
