"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, use, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Loader2, 
  Eraser, 
  Copy, 
  Check, 
  Sparkles, 
  ChevronLeft,
  Sliders,
  Type,
  Gauge,
  FileText
} from "lucide-react";
import axios from "axios";

const toolsConfig: Record<string, { name: string; desc: string; cost: number; placeholder: string }> = {
  "content-generator": { name: "Content Generator", desc: "Generate high-quality text from topics", cost: 5, placeholder: "Enter a topic or outline to generate content about..." },
  "humanizer": { name: "Humanizer", desc: "Make AI text sound natural and human", cost: 3, placeholder: "Paste AI-generated text here to humanize it..." },
  "paraphraser": { name: "Paraphraser", desc: "Reword sentences for better clarity", cost: 2, placeholder: "Enter text you want to paraphrase..." },
  "ai-detector": { name: "AI Detector", desc: "Check for AI-generated patterns", cost: 1, placeholder: "Paste text here to detect AI involvement..." },
};

export default function ToolPage(props: { params: Promise<{ tool: string }> }) {
  const params = use(props.params);
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [tone, setTone] = useState("Professional");
  const [creativity, setCreativity] = useState(7);
  const [wordLimit, setWordLimit] = useState("500");

  const toolConfig = toolsConfig[params.tool];

  if (!toolConfig) {
    return <div className="p-10 dark:text-white text-center">Tool not found.</div>;
  }

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;
  const charCount = input.length;

  const handleGenerate = async () => {
    if (!input) {
      toast.error("Please enter some input");
      return;
    }

    setLoading(true);
    setOutput("");

    const token = session?.accessToken || localStorage.getItem("test_token");

    try {
      console.log("Sending request to /api/ai/generate. Payload:", { 
        tool: params.tool, 
        input,
        tone,
        creativity,
        wordLimit: parseInt(wordLimit) || undefined
      });
      
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai/generate`,
        { 
          tool: params.tool, 
          input,
          tone,
          creativity,
          wordLimit: parseInt(wordLimit) || undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOutput(res.data.output);
      toast.success(`Success! Deducted ${res.data.creditsDeducted} credits.`);
    } catch (err: any) {
      const msg = err.response?.data?.error || "Error generating content";
      toast.error(msg);
      if (msg === "Insufficient credits") {
        router.push("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800"
            onClick={() => router.push("/dashboard")}
          >
            <ChevronLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
              {toolConfig.name}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{toolConfig.desc}</p>
          </div>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-black border border-primary/20 shadow-sm whitespace-nowrap">
          Cost: {toolConfig.cost} Credits
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Settings & Input Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Settings Card */}
          <Card className="shadow-sm dark:bg-black dark:border-zinc-800 backdrop-blur-md">
            <CardHeader className="py-4 border-b dark:border-zinc-800/60 flex flex-row items-center gap-2">
              <Sliders size={18} className="text-primary" />
              <CardTitle className="text-sm font-bold">Optimization Settings</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              {/* Tone Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                  <Type size={12} />
                  Writing Tone
                </label>
                <select 
                  className="w-full text-sm p-2.5 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-primary/50 text-zinc-800 dark:text-zinc-200 font-medium"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <option value="Professional">Professional</option>
                  <option value="Casual">Casual</option>
                  <option value="Academic">Academic</option>
                  <option value="Creative">Creative</option>
                  <option value="Persuasive">Persuasive</option>
                </select>
              </div>

              {/* Creativity Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                    <Gauge size={12} />
                    Creativity
                  </label>
                  <span className="text-xs font-bold text-primary">{creativity}/10</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  className="w-full h-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 accent-primary cursor-pointer mt-2"
                  value={creativity}
                  onChange={(e) => setCreativity(parseInt(e.target.value))}
                />
              </div>

              {/* Word Limit */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                  <FileText size={12} />
                  Target Words
                </label>
                <input 
                  type="number" 
                  className="w-full text-sm p-2.5 rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-primary/50 text-zinc-800 dark:text-zinc-200 font-medium"
                  placeholder="e.g. 500"
                  value={wordLimit}
                  onChange={(e) => setWordLimit(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Editor Input Card */}
          <Card className="shadow-sm dark:bg-black dark:border-zinc-800 backdrop-blur-md">
            <CardContent className="pt-6">
              <div className="relative">
                <textarea
                  className="w-full h-[320px] p-4 bg-transparent border dark:border-zinc-800 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none leading-relaxed dark:text-zinc-100 text-base"
                  placeholder={toolConfig.placeholder}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <div className="absolute bottom-6 right-4 flex items-center gap-4 text-xs font-semibold text-zinc-400">
                  <span>{wordCount} words</span>
                  <span>{charCount} chars</span>
                </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setInput("")} 
                  disabled={loading || !input}
                  className="flex-1 py-6 border dark:border-zinc-800 dark:hover:bg-zinc-800 font-bold"
                >
                  <Eraser size={18} className="mr-2" />
                  Clear
                </Button>
                <Button 
                  onClick={handleGenerate} 
                  disabled={loading || !input} 
                  className="flex-[2] py-6 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Process Content
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-1">
          {output ? (
            <Card className="shadow-xl dark:bg-black border-l-4 border-l-primary overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-zinc-50/50 dark:bg-zinc-950/40 p-4 border-b dark:border-zinc-800/80">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Sparkles size={16} className="text-primary" />
                  Generated Output
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-2 h-8">
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  <span className="text-xs">{copied ? "Copied" : "Copy"}</span>
                </Button>
              </CardHeader>
              <CardContent className="pt-4 p-4 flex-1 flex flex-col justify-between">
                <div className="p-4 bg-white dark:bg-zinc-950/80 border dark:border-zinc-800/80 rounded-lg whitespace-pre-wrap leading-relaxed dark:text-zinc-200 text-sm font-sans flex-1 overflow-y-auto max-h-[360px]">
                  {output}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="dark:bg-black/40 dark:border-zinc-800 border-dashed border-2 h-full flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800/60 text-zinc-400 dark:text-zinc-500 flex items-center justify-center mb-4">
                <Sparkles size={20} />
              </div>
              <h4 className="font-bold text-sm mb-1">Result Ready Panel</h4>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-[200px] leading-normal">
                Adjust optimization settings, insert text, and process to generate results.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
