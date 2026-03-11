import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface SidebarTabLayoutProps {
  children: ReactNode;
  className?: string;
}

interface SidebarProps {
  children: ReactNode;
  className?: string;
}

interface TabProps {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

interface ContentProps {
  children: ReactNode;
  className?: string;
}

export const SidebarTabLayout = ({
  children,
  className,
}: SidebarTabLayoutProps) => {
  return <div className={cn("flex flex-col md:flex-row gap-6", className)}>{children}</div>;
};

const Sidebar = ({ children, className }: SidebarProps) => {
  return (
    <aside className={cn("w-full md:w-64 flex-shrink-0", className)}>
      <nav className="flex flex-row md:flex-col space-x-1 md:space-x-0 md:space-y-1 overflow-x-auto">{children}</nav>
    </aside>
  );
};

const Tab = ({ active = false, onClick, children, className }: TabProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full md:w-full whitespace-nowrap text-left px-4 py-2 rounded-xl transition-colors",
        active ? "bg-primary text-primary-foreground" : "hover:bg-gray-100",
        className
      )}
    >
      {children}
    </button>
  );
};

const Content = ({ children, className }: ContentProps) => {
  return <main className={cn("flex-1", className)}>{children}</main>;
};

SidebarTabLayout.Sidebar = Sidebar;
SidebarTabLayout.Tab = Tab;
SidebarTabLayout.Content = Content;
