"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  PenTool, 
  UserRound, 
  Type, 
  Search, 
  CreditCard, 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  X, 
  Coins, 
  History,
  ArrowRight
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function DashboardOverview() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isTestMode, setIsTestMode] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchUserData = (token: string) => {
    axios
      .get(`/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUserData(res.data))
      .catch(console.error);
  };

  const fetchHistory = (token: string) => {
    setLoadingHistory(true);
    axios
      .get(`/api/user/history`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setHistory(res.data);
      })
      .catch((err) => {
        console.error("Error fetching history:", err);
      })
      .finally(() => {
        setLoadingHistory(false);
      });
  };

  useEffect(() => {
    const testToken = typeof window !== "undefined" ? localStorage.getItem("test_token") : null;
    setIsTestMode(!!testToken);
    const token = session?.accessToken || testToken;

    if (token) {
      fetchUserData(token);
      fetchHistory(token);
    }
  }, [status, session]);

  const handleDeleteHistory = async (id: string) => {
    const testToken = typeof window !== "undefined" ? localStorage.getItem("test_token") : null;
    const token = session?.accessToken || testToken;
    if (!token) return;

    try {
      await axios.delete(`/api/user/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(history.filter((item) => item.id !== id));
      toast.success("History item deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete history item");
    }
  };

  const handleCopyHistory = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Output copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpgradeDummy = (planName: string) => {
    toast.success(`Redirecting to Stripe checkout for ${planName} plan...`);
    setTimeout(() => {
      setShowUpgradeModal(false);
      toast.success("Subscribed successfully! (Demo Mode)");
      const testToken = typeof window !== "undefined" ? localStorage.getItem("test_token") : null;
      const token = session?.accessToken || testToken;
      if (token) fetchUserData(token);
    }, 1500);
  };

  const tools = [
    { id: "content-generator", name: "Content Generator", desc: "Generate text from topics", cost: 5, icon: PenTool, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
    { id: "humanizer", name: "Humanizer", desc: "Make AI text sound human", cost: 3, icon: UserRound, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
    { id: "paraphraser", name: "Paraphraser", desc: "Reword sentences", cost: 2, icon: Type, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
    { id: "ai-detector", name: "AI Detector", desc: "Check for AI generated text", cost: 1, icon: Search, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  ];

  if (!userData) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Top Welcome Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-black p-6 rounded-2xl border dark:border-zinc-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[60px] -z-10" />
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
            Welcome back, {userData.name}!
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1.5 text-sm">
            Unleash your productivity with HumanixAI's premium content tools.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isTestMode && (
            <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-full text-xs font-semibold border border-amber-500/25 flex items-center gap-1.5 shadow-sm">
              <Sparkles size={14} className="animate-pulse" />
              Demo Mode
            </div>
          )}
          <Button 
            onClick={() => setShowUpgradeModal(true)} 
            className="font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
          >
            Upgrade Plan
          </Button>
        </div>
      </div>

      {/* Credit & Plan Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Credits Card */}
        <Card className="dark:bg-black dark:border-zinc-800 glow-card transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Available Credits</CardTitle>
            <Coins className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-primary tracking-tight">{userData.credits}</div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Ready for processing
            </p>
          </CardContent>
        </Card>
        
        {/* Plan Details Card */}
        <Card className="md:col-span-2 dark:bg-black dark:border-zinc-800 glow-card transition-all duration-300 flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Current Plan</CardTitle>
              <span className="text-xs font-black uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/25">
                {userData.plan}
              </span>
            </div>
            <CardDescription className="text-zinc-500 dark:text-zinc-400 mt-2">
              You are currently enjoying the {userData.plan} tier. Upgrade to unlock bulk operations, priority API access, and larger word limits.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 border-t dark:border-zinc-800/60 flex items-center justify-between mt-auto">
            <span className="text-xs text-zinc-400">Upgrade to Pro for more credits</span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => setShowUpgradeModal(true)}>
                View Pricing
              </Button>
              <Button size="sm" onClick={() => setShowUpgradeModal(true)}>
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Tools Grid */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight mb-6 flex items-center gap-2">
          <Sparkles className="text-primary h-5 w-5" />
          Content Tools Suite
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <Card 
              key={tool.id} 
              className="group hover:shadow-xl hover:-translate-y-1.5 hover:scale-[1.03] active:scale-[0.99] active:translate-y-0.5 transition-all duration-300 cursor-pointer dark:bg-black dark:border-zinc-800 border-t-4 border-t-primary glow-card relative overflow-hidden"
              onClick={() => router.push(`/dashboard/${tool.id}`)}
            >
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${tool.color} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <tool.icon size={22} />
                </div>
                <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors duration-200">{tool.name}</CardTitle>
                <CardDescription className="dark:text-zinc-400 text-xs mt-1.5 leading-relaxed min-h-[32px]">{tool.desc}</CardDescription>
              </CardHeader>
              <CardContent className="pt-2 border-t dark:border-zinc-800/40 mt-auto flex items-center justify-between">
                <div className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                  {tool.cost} Credits
                </div>
                <ArrowRight size={16} className="text-zinc-400 group-hover:translate-x-1.5 group-hover:text-primary transition-all duration-300" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Generation History Section */}
      <div className="pt-4">
        <h2 className="text-2xl font-extrabold tracking-tight mb-6 flex items-center gap-2">
          <History className="text-primary h-5 w-5" />
          Generation History
        </h2>
        
        <Card className="dark:bg-black dark:border-zinc-800 overflow-hidden">
          <CardContent className="p-0">
            {loadingHistory ? (
              <div className="p-12 text-center text-zinc-500 dark:text-zinc-400">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-3" />
                <p className="text-sm">Retrieving your past generations...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 rounded-full flex items-center justify-center mx-auto mb-4 border dark:border-zinc-700/50">
                  <History size={28} />
                </div>
                <h3 className="text-lg font-bold mb-1">No history yet</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm mx-auto mb-6">
                  Once you process text with any of the content tools, your results will appear here.
                </p>
                <Button size="sm" onClick={() => router.push("/dashboard/content-generator")}>
                  Try Content Generator
                </Button>
              </div>
            ) : (
              <div className="divide-y dark:divide-zinc-800/80">
                {history.map((item) => {
                  const matchedTool = tools.find((t) => t.id === item.tool);
                  const ToolIcon = matchedTool?.icon || Sparkles;
                  return (
                    <div key={item.id} className="p-5 hover:bg-zinc-500/5 dark:hover:bg-zinc-800/10 transition-colors duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5">
                          <span className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                            <ToolIcon size={14} />
                          </span>
                          <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                            {matchedTool?.name || item.tool}
                          </span>
                          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium font-sans">
                            {new Date(item.createdAt).toLocaleString(undefined, {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-xs">
                          <div className="bg-zinc-50 dark:bg-zinc-900 p-2.5 rounded-lg border dark:border-zinc-800">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Input Snippet</span>
                            <p className="text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                              {item.input}
                            </p>
                          </div>
                          <div className="bg-primary/5 dark:bg-primary/2 p-2.5 rounded-lg border border-primary/10">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary/60 block mb-1">Generated Output</span>
                            <p className="text-zinc-700 dark:text-zinc-300 line-clamp-2 leading-relaxed font-medium">
                              {item.output}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 self-end md:self-center">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 dark:border-zinc-800 dark:bg-zinc-900"
                          onClick={() => handleCopyHistory(item.id, item.output)}
                        >
                          {copiedId === item.id ? (
                            <Check size={14} className="text-emerald-500" />
                          ) : (
                            <Copy size={14} className="text-zinc-500" />
                          )}
                          <span className="ml-1.5 hidden sm:inline text-xs">Copy</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          onClick={() => handleDeleteHistory(item.id)}
                        >
                          <Trash2 size={14} />
                          <span className="ml-1.5 hidden sm:inline text-xs">Delete</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upgrade / Pricing Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-950 rounded-3xl border dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 md:p-8 flex items-center justify-between border-b dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Upgrade Your Account</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Select the pricing plan that best fits your workflow.</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => setShowUpgradeModal(false)}
              >
                <X size={20} />
              </Button>
            </div>
            
            {/* Tiers Grid */}
            <div className="p-6 md:p-8 grid md:grid-cols-3 gap-6 overflow-y-auto max-h-[75vh]">
              {/* Starter Tier */}
              <div className="p-6 rounded-2xl border dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200">
                <div>
                  <h4 className="font-extrabold text-lg">Starter</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">For casual builders</p>
                  <div className="my-5 flex items-baseline">
                    <span className="text-3xl font-black">$8</span>
                    <span className="text-zinc-500 dark:text-zinc-400 text-xs ml-1">/mo</span>
                  </div>
                  <ul className="space-y-3.5 text-xs text-zinc-600 dark:text-zinc-300">
                    <li className="flex items-center gap-2"><Check size={14} className="text-primary" /> 500 Credits/mo</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-primary" /> Priority processing</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-primary" /> Standard support</li>
                  </ul>
                </div>
                <Button className="w-full mt-6 font-bold" variant="outline" onClick={() => handleUpgradeDummy("Starter")}>
                  Get Starter
                </Button>
              </div>

              {/* Pro Tier (Popular) */}
              <div className="p-6 rounded-2xl border-2 border-primary bg-primary/5 dark:bg-primary/0 relative flex flex-col justify-between hover:scale-[1.03] transition-all duration-300">
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  Popular Choice
                </div>
                <div>
                  <h4 className="font-extrabold text-lg text-primary">Pro Tier</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">For power creators</p>
                  <div className="my-5 flex items-baseline">
                    <span className="text-3xl font-black text-primary">$16</span>
                    <span className="text-zinc-500 dark:text-zinc-400 text-xs ml-1">/mo</span>
                  </div>
                  <ul className="space-y-3.5 text-xs text-zinc-600 dark:text-zinc-300">
                    <li className="flex items-center gap-2"><Check size={14} className="text-primary" /> 1,500 Credits/mo</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-primary" /> Max processing priority</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-primary" /> 24/7 Priority support</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-primary" /> Custom tone saving</li>
                  </ul>
                </div>
                <Button className="w-full mt-6 font-bold shadow-lg shadow-primary/20" onClick={() => handleUpgradeDummy("Pro")}>
                  Upgrade Now
                </Button>
              </div>

              {/* One-time Credit Pack */}
              <div className="p-6 rounded-2xl border dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950/20 flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200">
                <div>
                  <h4 className="font-extrabold text-lg">Credit Pack</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Top-up instantly</p>
                  <div className="my-5 flex items-baseline">
                    <span className="text-3xl font-black">$4.99</span>
                    <span className="text-zinc-500 dark:text-zinc-400 text-xs ml-1 font-normal">one-time</span>
                  </div>
                  <ul className="space-y-3.5 text-xs text-zinc-600 dark:text-zinc-300">
                    <li className="flex items-center gap-2"><Check size={14} className="text-primary" /> 200 credits</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-primary" /> Never expires</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-primary" /> Use alongside subscription</li>
                  </ul>
                </div>
                <Button className="w-full mt-6 font-bold" variant="outline" onClick={() => handleUpgradeDummy("Credit Pack")}>
                  Buy Credits
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
