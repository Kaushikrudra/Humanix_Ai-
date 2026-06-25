"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sparkles, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import axios from "axios";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleTestLogin = async () => {
    const testEmail = "testuser@example.com";
    try {
      const res = await axios.post(`/api/auth/sync`, {
        email: testEmail,
        name: "Test User",
      });
      localStorage.setItem("test_token", res.data.token);
      localStorage.setItem("test_user_id", res.data.user.id);
      router.push("/dashboard");
    } catch (err) {
      console.error("Test login failed", err);
    }
  };

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center dark:bg-zinc-950 dark:text-white font-medium">Initializing...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-dark-gradient transition-colors duration-300">
      <header className="px-6 py-4 flex items-center justify-between border-b dark:border-zinc-800 sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md z-50">
        <div className="text-2xl font-black tracking-tighter text-primary">HumanixAI</div>
        <nav className="space-x-4 flex items-center">
          <Button variant="ghost" className="hidden sm:flex" onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: 'smooth' })}>Pricing</Button>
          <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800 hidden sm:block mx-2" />
          <ThemeToggle />
          {session ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="font-bold" onClick={() => router.push("/dashboard")}>Dashboard</Button>
              <div className="flex items-center gap-2 border dark:border-zinc-850 rounded-full pl-2 pr-3 py-1 bg-zinc-50/50 dark:bg-zinc-900/50">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User Avatar"}
                    className="w-6 h-6 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                    {session.user?.name?.charAt(0) || "U"}
                  </div>
                )}
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200 max-w-[120px] truncate">
                  {session.user?.name}
                </span>
              </div>
              <Button variant="outline" className="font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 dark:border-zinc-700" onClick={() => signOut()}>
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Button variant="outline" className="hidden sm:flex dark:border-zinc-700" onClick={() => router.push("/auth/signin")}>Sign In</Button>
              <Button className="font-bold shadow-lg shadow-primary/20" onClick={() => router.push("/auth/signin")}>Get Started</Button>
            </>
          )}
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 px-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10 opacity-50" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20 mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
            <Sparkles size={16} />
            <span>AI Content, Mastered.</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1] text-primary">
            Elevate Your AI Content to Perfection
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Generate, humanize, paraphrase, and detect AI patterns with precision. 
            The all-in-one suite for professional content creators.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="text-lg px-10 py-7 font-bold h-auto shadow-2xl shadow-primary/30" onClick={() => router.push("/auth/signin")}>
              Start for Free
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-10 py-7 h-auto dark:border-zinc-700 dark:bg-zinc-900/50" onClick={() => router.push("/auth/signin")}>
              Try Demo Account
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-6 max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold">Lightning Fast</h3>
            <p className="text-zinc-500 dark:text-zinc-400">Generate high-quality content in seconds with our optimized AI pipelines.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold">Unrivaled Precision</h3>
            <p className="text-zinc-500 dark:text-zinc-400">Our Humanizer and AI Detector are fine-tuned for the highest accuracy on the market.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-xl font-bold">Professional Quality</h3>
            <p className="text-zinc-500 dark:text-zinc-400">Built for professionals who need reliable results every single time.</p>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-6 bg-zinc-50/50 dark:bg-zinc-900/30 border-y dark:border-zinc-800 transition-colors duration-300">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Simple, Transparent Pricing</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-16 max-w-lg mx-auto">Choose the plan that fits your workflow. No hidden fees, no surprises.</p>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Free Plan */}
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border dark:border-zinc-800 transition-all hover:scale-[1.02] duration-300">
                <h3 className="text-xl font-bold mb-2">Free</h3>
                <div className="text-5xl font-black mb-4">$0</div>
                <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-sm">Perfect to try things out.</p>
                <ul className="text-left space-y-4 mb-8 text-sm">
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> <span>30 Credits</span></li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> <span>All Tools Access</span></li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> <span>Basic Support</span></li>
                </ul>
                <Button className="w-full h-12 font-bold dark:border-zinc-700" variant="outline" onClick={() => router.push("/auth/signin")}>Sign Up Free</Button>
              </div>

              {/* Starter Plan */}
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl border-2 border-primary relative transition-all hover:scale-[1.05] duration-300">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">Most Popular</div>
                <h3 className="text-xl font-bold mb-2">Starter</h3>
                <div className="text-5xl font-black mb-4">$8<span className="text-lg text-zinc-500 dark:text-zinc-400 font-normal">/mo</span></div>
                <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-sm">For casual creators.</p>
                <ul className="text-left space-y-4 mb-8 text-sm">
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> <span>500 Credits / mo</span></li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> <span>Priority Processing</span></li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> <span>Email Support</span></li>
                </ul>
                <Button className="w-full h-12 font-bold shadow-lg shadow-primary/30" onClick={() => router.push("/auth/signin")}>Get Starter</Button>
              </div>

              {/* Pro Plan */}
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border dark:border-zinc-800 transition-all hover:scale-[1.02] duration-300">
                <h3 className="text-xl font-bold mb-2">Pro</h3>
                <div className="text-5xl font-black mb-4">$16<span className="text-lg text-zinc-500 dark:text-zinc-400 font-normal">/mo</span></div>
                <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-sm">For professionals.</p>
                <ul className="text-left space-y-4 mb-8 text-sm">
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> <span>1500 Credits / mo</span></li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> <span>Priority Processing</span></li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-primary" /> <span>24/7 Support</span></li>
                </ul>
                <Button className="w-full h-12 font-bold dark:border-zinc-700" variant="outline" onClick={() => router.push("/auth/signin")}>Get Pro</Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 text-center text-zinc-500 dark:text-zinc-600 border-t dark:border-zinc-800 transition-colors duration-300">
        <div className="font-bold text-lg mb-4 text-primary opacity-50">HumanixAI</div>
        <div className="text-sm">
          © {new Date().getFullYear()} HumanixAI. All rights reserved.
        </div>

      </footer>
    </div>
  );
}
