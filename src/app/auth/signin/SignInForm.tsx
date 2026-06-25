"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AlertCircle, Sparkles, ShieldCheck, Zap, ArrowRight, UserCheck } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function SignInForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleTestLogin = async () => {
    setLoadingDemo(true);
    const testEmail = "testuser@example.com";
    try {
      const res = await axios.post(`/api/auth/sync`, {
        email: testEmail,
        name: "Test User",
      });
      localStorage.setItem("test_token", res.data.token);
      localStorage.setItem("test_user_id", res.data.user.id);
      toast.success("Signed in with Demo Account!");
      router.push("/dashboard");
    } catch (err) {
      console.error("Test login failed", err);
      toast.error("Demo authentication failed. Check backend.");
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      
      {/* LEFT PANEL: Form & Actions */}
      <div className="flex flex-col justify-between p-6 sm:p-12 md:p-16 lg:p-20 relative">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-black tracking-tighter text-primary">HumanixAI</div>
          <ThemeToggle />
        </div>

        <div className="max-w-md w-full mx-auto my-auto space-y-8 py-12">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-normal">
              Sign in to access your AI-powered content workspace.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle size={16} className="shrink-0" />
              <span>
                {error === "OAuthSignin" || error === "OAuthCallback"
                  ? "Authentication failed during sign-in. Please try again."
                  : "An unexpected error occurred. Please try again."}
              </span>
            </div>
          )}

          <div className="space-y-3 pt-2">
            {/* Google Sign-in Button */}
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-50 text-zinc-900 font-bold border border-zinc-200 dark:border-zinc-800 rounded-xl py-3.5 shadow-sm hover:shadow active:scale-[0.99] transition-all duration-300"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Test Login Button */}
            <button
              onClick={handleTestLogin}
              disabled={loadingDemo}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-emerald-600 text-white font-bold rounded-xl py-3.5 shadow-lg shadow-primary/10 hover:shadow-primary/25 active:scale-[0.99] transition-all duration-300 disabled:opacity-50"
            >
              {loadingDemo ? (
                <div className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <UserCheck size={18} />
              )}
              <span>Continue as Test User (Demo)</span>
            </button>
          </div>
        </div>

        {/* Form Footer */}
        <div className="text-center text-xs text-zinc-400 dark:text-zinc-500 max-w-sm mx-auto leading-relaxed mt-auto pt-6">
          By signing in, you agree to our{" "}
          <a href="#" className="underline hover:text-primary transition-colors">Terms of Service</a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-primary transition-colors">Privacy Policy</a>.
        </div>
      </div>

      {/* RIGHT PANEL: Visual Branding Panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-dark-gradient border-l dark:border-zinc-800 relative overflow-hidden">
        {/* Abstract Glowing Gradients */}
        <div className="absolute -top-12 -right-12 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] -z-10" />
        <div className="absolute -bottom-16 -left-16 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] -z-10" />

        {/* Tagline Header */}
        <div className="max-w-md space-y-3 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
            <Sparkles size={12} />
            <span>Premium AI Dashboard</span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            AI Content, Mastered.
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Generate, humanize, paraphrase, and detect AI patterns with custom model attributes.
          </p>
        </div>

        {/* Abstract CSS Dashboard Mockup Illustration */}
        <div className="my-auto py-12 flex flex-col items-center justify-center relative w-full h-[320px] z-10 select-none">
          {/* Overlapping Mockup Card 1: AI Detector */}
          <div className="absolute top-4 left-6 w-[280px] bg-zinc-950/80 backdrop-blur-md p-4 rounded-xl border border-zinc-800/80 shadow-2xl animate-in slide-in-from-left-8 duration-1000">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold tracking-widest text-zinc-500 uppercase">AI Detector</span>
              <ShieldCheck size={14} className="text-primary" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Human Content Score</span>
                <span className="text-primary">98.5%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full w-[98.5%] bg-primary rounded-full" />
              </div>
              <p className="text-[10px] text-zinc-400">Verifying natural linguistic variance...</p>
            </div>
          </div>

          {/* Overlapping Mockup Card 2: Settings & Status */}
          <div className="absolute bottom-8 right-6 w-[280px] bg-zinc-950/80 backdrop-blur-md p-4 rounded-xl border border-zinc-800/80 shadow-2xl animate-in slide-in-from-right-8 duration-1000 delay-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold tracking-widest text-zinc-500 uppercase">Model Output</span>
              <Zap size={14} className="text-primary animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-medium">Model</span>
                <span className="font-bold text-zinc-200">Gemini 2.5 Flash Lite</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-zinc-900 pt-2">
                <span className="text-zinc-400 font-medium">Tone Match</span>
                <span className="font-bold text-zinc-200">Professional</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-zinc-900 pt-2">
                <span className="text-zinc-400 font-medium">Creativity</span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-2.5 h-1 bg-primary rounded-full" />
                  ))}
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="w-2.5 h-1 bg-zinc-800 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Abstract background grid decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent -z-10" />
        </div>

        {/* Footer tagline */}
        <div className="text-zinc-500 text-xs z-10 flex items-center justify-between">
          <span>Trusted by professional creators.</span>
          <span className="flex items-center gap-1">
            Status: <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Online
          </span>
        </div>
      </div>

    </div>
  );
}
