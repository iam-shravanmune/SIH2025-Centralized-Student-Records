import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Bell, CalendarDays, ClipboardCheck, FileBadge2, Home, LayoutList, PanelLeftClose, PanelLeftOpen, Settings, KeyRound, Users, LogOut } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/store/app-store";

const nav = [
  { to: "/teacher", label: "Home", icon: Home, end: true },
  { to: "/teacher/classes", label: "Classes & Schedule", icon: CalendarDays },
  {
    label: "Attendance",
    children: [
      { to: "/teacher/attendance/batch", label: "Batch Marking", icon: LayoutList },
      { to: "/teacher/attendance/subject", label: "Subject-wise", icon: ClipboardCheck },
    ],
  },
  { to: "/teacher/certificates", label: "Certificates", icon: FileBadge2 },
  { to: "/teacher/validation", label: "Activity Validation", icon: Users },
];

function SidebarLink({ to, label, icon: Icon, end, collapsed }: { to: string; label: string; icon?: any; end?: boolean; collapsed?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
          isActive ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
          collapsed && "justify-center",
        )
      }
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      <span className={cn(collapsed && "sr-only")}>{label}</span>
    </NavLink>
  );
}

function NavContent({ collapsed }: { collapsed: boolean }) {
  const { user } = useAuth();
  const initials = user?.name?.split(" ").map((s) => s[0]).join("").slice(0, 2) || "TE";
  return (
    <>
      <div className={cn("mb-4 flex items-center gap-3 rounded-md bg-muted/40 p-3", collapsed && "justify-center") }>
        <Avatar className={cn("h-9 w-9", collapsed && "h-8 w-8") }>
          <AvatarImage alt={user?.name || "Teacher"} src="" />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div>
            <div className="text-sm font-medium leading-4">{user?.name || "Teacher"}</div>
            <div className="text-xs text-muted-foreground">Teacher</div>
          </div>
        )}
      </div>
      <nav className="space-y-4">
        {nav.map((item, idx) => {
          if ((item as any).children) {
            return (
              <div key={idx} className="space-y-2">
                {!collapsed && <div className="px-2 text-xs font-semibold uppercase text-muted-foreground">{item.label}</div>}
                <div className="space-y-1">
                  {(item as any).children.map((c: any) => (
                    <SidebarLink key={c.to} to={c.to} label={c.label} icon={c.icon} collapsed={collapsed} />
                  ))}
                </div>
              </div>
            );
          }
          return <SidebarLink key={(item as any).to} to={(item as any).to} label={(item as any).label} icon={(item as any).icon} end={(item as any).end} collapsed={collapsed} />;
        })}
        <div className="pt-2">
          <button
            onClick={() => {
              try {
                const PREFIX = "gradfolia_store_v1";
                for (let i = localStorage.length - 1; i >= 0; i--) {
                  const k = localStorage.key(i);
                  if (k && k.startsWith(PREFIX)) localStorage.removeItem(k);
                }
              } catch {}
              window.location.href = "/";
            }}
            className={cn(
              "w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="h-4 w-4" />
            <span className={cn(collapsed && "sr-only")}>Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
}

export default function TeacherLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);
  const initials = user?.name?.split(" ").map((s) => s[0]).join("").slice(0, 2) || "TE";
  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className={cn("container grid grid-cols-1 gap-6 py-6", collapsed ? "md:grid-cols-[80px_1fr]" : "md:grid-cols-[260px_1fr]") }>
      <aside className={cn("hidden rounded-lg border bg-card p-4 shadow-sm md:sticky md:top-20 md:block", collapsed && "px-2") }>
        <NavContent collapsed={collapsed} />
      </aside>

      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="left" className="p-0 sm:max-w-xs">
          <div className="h-full overflow-y-auto p-4">
            <NavContent collapsed={false} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="min-h-[60vh]">
        <div className="mb-6 flex items-center gap-2 md:gap-4">
          <button aria-label="Open navigation" onClick={() => setOpenMobile(true)} className="inline-flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground hover:text-foreground md:hidden">
            <PanelLeftOpen className="h-4 w-4" />
          </button>
          <button aria-label={collapsed ? "Open sidebar" : "Close sidebar"} onClick={() => setCollapsed((v) => !v)} className="hidden h-9 w-9 items-center justify-center rounded-md border text-muted-foreground hover:text-foreground md:inline-flex">
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>

          <div className="flex-1">
            <div className="relative">
              <Input placeholder="Search..." className="pl-10" />
              <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
            </div>
          </div>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground hover:text-foreground">
            <Bell className="h-4 w-4" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-3 rounded-full border px-2 py-1.5 hover:bg-muted/60">
                <Avatar className="h-7 w-7">
                  <AvatarImage alt={user?.name || "Teacher"} src="" />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium md:inline">{user?.name || "Teacher"}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs">Profile</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/teacher/settings" className="flex w-full items-center gap-2"><Settings className="h-4 w-4" /> Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/teacher/change-password" className="flex w-full items-center gap-2"><KeyRound className="h-4 w-4" /> Change Password</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
