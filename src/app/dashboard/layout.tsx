"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  LayoutDashboard, 
  PenTool, 
  UserRound, 
  Type, 
  Search, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import axios from "axios";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const testToken = localStorage.getItem("test_token");
    if (status === "unauthenticated" && !testToken) {
      router.push("/");
      return;
    }

    const token = session?.accessToken || testToken;
    if (token) {
      axios
        .get(`/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUserData(res.data))
        .catch((err) => {
          console.error("Error fetching user data", err);
          if (err.response?.status === 401) {
            localStorage.removeItem("test_token");
            router.push("/");
          }
        });
    }
  }, [status, session, router]);

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Content Generator", href: "/dashboard/content-generator", icon: PenTool },
    { name: "Humanizer", href: "/dashboard/humanizer", icon: UserRound },
    { name: "Paraphraser", href: "/dashboard/paraphraser", icon: Type },
    { name: "AI Detector", href: "/dashboard/ai-detector", icon: Search },
  ];

  const handleLogout = () => {
    localStorage.removeItem("test_token");
    localStorage.removeItem("test_user_id");
    signOut({ callbackUrl: '/' });
  };

  if (!mounted || (status === "loading" && !localStorage.getItem("test_token")) || (!userData && status !== "unauthenticated")) {
    return <div className="min-h-screen flex items-center justify-center dark:bg-zinc-950 dark:text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-gradient flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-zinc-950 border-b dark:border-zinc-800">
        <div className="font-bold text-xl text-primary">HumanixAI</div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-950 border-r dark:border-zinc-800 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          <div className="p-6">
            <div className="font-bold text-2xl text-primary hidden md:block">HumanixAI</div>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  pathname === item.href ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
                onClick={() => {
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
              >
                <item.icon size={20} />
                {item.name}
              </Button>
            ))}
          </nav>

          <div className="p-4 border-t dark:border-zinc-800 space-y-4">
            {userData && (
              <div className="flex items-center gap-3 px-2 py-1.5 border-b dark:border-zinc-800/60 pb-3">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={userData.name || "User Avatar"}
                    className="w-9 h-9 rounded-full object-cover shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                    {userData.name?.charAt(0) || "U"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-zinc-700 dark:text-zinc-200 truncate leading-snug">
                    {userData.name}
                  </div>
                  {userData.email && (
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate leading-none mt-0.5">
                      {userData.email}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between px-2">
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Credits</div>
              <div className="text-sm font-bold text-primary">{userData?.credits}</div>
            </div>
            <div className="flex items-center justify-between px-2">
              <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Theme</div>
              <ThemeToggle />
            </div>
            <Button variant="ghost" className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={handleLogout}>
              <LogOut size={20} />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
