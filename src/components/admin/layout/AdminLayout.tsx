import React from "react";
import Link from "next/link";
import { useNavigate, useLocation } from "@/lib/router-compat";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutGrid,
  PenTool,
  FolderPlus,
  Settings,
  User,
  Sun,
  Moon,
  LogOut,
  Eye,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

interface AdminLayoutProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  /** When true, content takes full width for editor-focused pages */
  fullWidthContent?: boolean;
}

const NavItem: React.FC<{ icon: React.ElementType; label: string; to: string; active?: boolean }> = ({ icon: Icon, label, to, active }) => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active} 
        tooltip={label} 
        className={cn(
          "w-full justify-start h-8 px-2 rounded-md transition-colors duration-150",
          active ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        <Link href={to}>
          <Icon className="w-4 h-4 mr-3 shrink-0" />
          <span className="truncate text-sm">{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const SidebarBrand: React.FC = () => {
  const { state } = useSidebar();
  return (
    <div className={cn("flex items-center gap-3", state === "collapsed" && "justify-center")}> 
      <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
        <LayoutGrid className="w-4 h-4 text-primary-foreground" />
      </div>
      <div className={cn("font-semibold text-foreground truncate", state === "collapsed" && "hidden")}>
        Workspace
      </div>
    </div>
  );
};

const SidebarFooterContent: React.FC = () => {
  const { state } = useSidebar();
  if (state === "collapsed") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild variant="ghost" size="icon" className="w-8 h-8 hover:bg-muted">
              <Link href="/">
                <Eye className="w-4 h-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">View Site</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return (
    <Button asChild variant="ghost" size="sm" className="w-full justify-start hover:bg-muted text-muted-foreground hover:text-foreground">
      <Link href="/">
        <Eye className="w-4 h-4 mr-2" />
        View Site
      </Link>
    </Button>
  );
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ title = "Dashboard", subtitle, actions, children, fullWidthContent }) => {
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        {/* Notion-like Sidebar */}
        <Sidebar collapsible="icon" className="bg-background border-r border-border/30 shadow-none">
          <SidebarHeader className="p-4 border-b border-border/30">
            <SidebarBrand />
          </SidebarHeader>
          
          <SidebarContent className="px-2 py-4 space-y-6">
            {/* Quick Actions */}
            <SidebarGroup>
              <SidebarMenu className="space-y-1">
                <NavItem icon={LayoutGrid} label="Dashboard" to="/admin" active={isActive("/admin")} />
              </SidebarMenu>
            </SidebarGroup>

            {/* Content Creation */}
            <SidebarGroup>
              <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground/70 uppercase tracking-wider mb-2">
                Create
              </SidebarGroupLabel>
              <SidebarMenu className="space-y-1">
                <NavItem icon={FolderPlus} label="New Project" to="/admin/project/new" active={isActive("/admin/project/new")} />
                <NavItem icon={PenTool} label="New Blog Post" to="/admin/blog/new" active={isActive("/admin/blog/new")} />
              </SidebarMenu>
            </SidebarGroup>

            {/* Profile Management */}
            <SidebarGroup>
              <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground/70 uppercase tracking-wider mb-2">
                Profile
              </SidebarGroupLabel>
              <SidebarMenu className="space-y-1">
                <NavItem icon={User} label="Edit Profile" to="/admin/profile" active={isActive("/admin/profile")} />
              </SidebarMenu>
            </SidebarGroup>

            {/* System Tools */}
            <SidebarGroup>
              <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground/70 uppercase tracking-wider mb-2">
                System
              </SidebarGroupLabel>
              <SidebarMenu className="space-y-1">
                <NavItem icon={Settings} label="Settings" to="/admin/maintenance" active={isActive("/admin/maintenance")} />
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-border/30">
            <SidebarFooterContent />
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="flex-1">
          {/* Notion-like Header */}
          <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
            <div className="flex items-center justify-between h-14 px-6">
              <div className="flex items-center gap-3 min-w-0">
                <SidebarTrigger className="hover:bg-muted rounded-md transition-colors duration-150" />
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl font-semibold text-foreground truncate">{title}</h1>
                    {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {actions && <div className="flex items-center gap-2">{actions}</div>}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={toggleTheme}
                        className="h-8 w-8 rounded-md hover:bg-muted transition-colors duration-150"
                      >
                        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Toggle theme</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    try { await signOut(); navigate("/"); } catch { /* empty */ }
                  }}
                  className="h-8 px-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors duration-150"
                >
                  <LogOut className="w-4 h-4 mr-2" /> 
                  Sign out
                </Button>
              </div>
            </div>
          </header>

          {/* Content Area - Notion-like Spacing */}
          <main className={cn(
            "p-6 min-h-[calc(100vh-3.5rem)]",
            fullWidthContent ? "max-w-none" : "max-w-4xl mx-auto"
          )}>
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
