"use client";

import { useState, type ElementType } from "react";
import {
  Building2,
  ChevronRight,
  LogOut,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type NavItemData = {
  id: string;
  title: string;
  icon: ElementType;
  badge?: number | string;
  shortcut?: string;
  children?: NavItemData[];
};

export type NavGroupData = {
  heading?: string;
  items: NavItemData[];
};

export const dashboardNavGroups: NavGroupData[] = [
  {
    items: [
      { id: "companies", title: "Empresas", icon: Building2 },
      { id: "influencers", title: "Influencers", icon: Users },
    ],
  },
];

export const dashboardBottomItems: NavItemData[] = [
  { id: "logout", title: "Sair", icon: LogOut },
];

function BrandHeader() {
  return (
    <div className="mb-4 flex items-center gap-3 px-2 py-2">
      <div className="flex size-8 items-center justify-center rounded-[6px] bg-foreground text-[13px] font-semibold text-background shadow-sm">
        L
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="mb-1 truncate text-[13px] font-medium leading-none text-foreground">
          LeadEvent
        </span>
        <span className="text-[11px] leading-none text-muted-foreground">
          Painel
        </span>
      </div>
    </div>
  );
}

function NavItem({
  item,
  activeId,
  onSelect,
  level = 0,
}: {
  item: NavItemData;
  activeId: string;
  onSelect: (id: string) => void;
  level?: number;
}) {
  const isActive = activeId === item.id;
  const hasChildren = Boolean(item.children);
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen((value) => !value);
    } else {
      onSelect(item.id);
    }
  };

  return (
    <div className="flex w-full flex-col">
      <div
        className={`group flex cursor-pointer select-none items-center justify-between rounded-[6px] px-2.5 py-[7px] transition-all duration-200 ${
          isActive
            ? "bg-black/5 font-medium text-foreground dark:bg-white/10"
            : "text-muted-foreground hover:bg-black/5 hover:text-foreground/90 dark:hover:bg-white/5"
        }`}
        style={{ paddingLeft: `${level * 12 + 10}px` }}
        onClick={handleClick}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <item.icon
            className={`size-4 shrink-0 transition-colors ${
              isActive
                ? "text-foreground"
                : "text-muted-foreground/70 group-hover:text-foreground/70"
            }`}
            strokeWidth={1.5}
          />
          <span className="truncate text-[13px] tracking-wide">
            {item.title}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {item.shortcut && (
            <kbd className="hidden h-5 items-center justify-center rounded-[4px] border border-border/50 bg-background/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground/60 shadow-xs group-hover:inline-flex">
              {item.shortcut}
            </kbd>
          )}
          {item.badge !== undefined && item.badge !== 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/10 px-1.5 text-[10px] font-medium text-primary">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronRight
              className={`size-3.5 text-muted-foreground/50 transition-transform duration-200 ${
                isOpen ? "rotate-90" : ""
              }`}
              strokeWidth={2}
            />
          )}
        </div>
      </div>

      {hasChildren && (
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="relative mt-0.5 flex min-h-0 flex-col gap-0.5 overflow-hidden">
            <div
              className="absolute bottom-0 top-0 border-l border-black/5 dark:border-white/5"
              style={{ left: `${level * 12 + 17.5}px` }}
            />
            {item.children?.map((child) => (
              <NavItem
                key={child.id}
                item={child}
                activeId={activeId}
                onSelect={onSelect}
                level={level + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SidebarNav({
  className = "",
  groups = dashboardNavGroups,
  bottomItems = dashboardBottomItems,
  activeId,
  onSelect,
}: {
  className?: string;
  groups?: NavGroupData[];
  bottomItems?: NavItemData[];
  activeId?: string;
  onSelect?: (id: string) => void;
}) {
  const [internalId, setInternalId] = useState("companies");
  const currentId = activeId ?? internalId;
  const handleSelect = onSelect ?? setInternalId;

  return (
    <div
      className={cn(
        "flex h-full w-[260px] flex-col border-r border-border/50 bg-card/50 p-3 font-sans",
        className
      )}
    >
      <BrandHeader />

      <div className="mt-2 flex flex-1 flex-col gap-4 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {groups.map((group, index) => (
          <div key={index} className="flex flex-col gap-0.5">
            {group.heading && (
              <span className="mb-1 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                {group.heading}
              </span>
            )}
            {group.items.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                activeId={currentId}
                onSelect={handleSelect}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-0.5 border-t border-border/50 pt-4">
        {bottomItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            activeId={currentId}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}
