"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { PanelLeft } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SidebarProps {
  children: React.ReactNode;
  isMobile: boolean;
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ children, isMobile, isSidebarOpen, isMobileMenuOpen, setMobileMenuOpen }: SidebarProps) => {
  if (isMobile) {
    return (
      <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-card">
          <div className="flex flex-col h-full">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r bg-card transition-all duration-300 ease-in-out",
        isSidebarOpen ? "w-64" : "w-16"
      )}
    >
      {children}
    </aside>
  );
};

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant="outline"
      size="icon"
      className={cn("shrink-0", className)}
      {...props}
    >
      <PanelLeft className="h-5 w-5" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { isSidebarOpen: boolean }
>(({ className, isSidebarOpen, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-14 items-center border-b px-4",
        !isSidebarOpen && "justify-center px-0",
        className
      )}
      {...props}
    >
      <div className={cn(!isSidebarOpen ? 'hidden' : 'block')}>
         {children}
      </div>
    </div>
  );
});
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex-1 overflow-auto py-2", className)} {...props} />;
});
SidebarContent.displayName = "SidebarContent";

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => {
  return <ul ref={ref} className={cn("flex flex-col gap-1 px-2", className)} {...props} />;
});
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("group/menu-item", className)} {...props} />
));
SidebarMenuItem.displayName = "SidebarMenuItem";

interface SidebarMenuButtonProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string;
  isSidebarOpen: boolean;
}

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ asChild, isActive, tooltip, isSidebarOpen, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  const buttonContent = (
    <Comp
      ref={ref}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        isActive && "bg-muted text-primary",
        !isSidebarOpen && "justify-center"
      )}
      {...props}
    >
      {children}
    </Comp>
  );

  if (!isSidebarOpen && tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
          <TooltipContent side="right">{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return buttonContent;
});
SidebarMenuButton.displayName = "SidebarMenuButton";

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("flex flex-col flex-1", className)} {...props} />;
});
SidebarInset.displayName = "SidebarInset";

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
};
