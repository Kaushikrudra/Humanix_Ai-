import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { GoogleGenerativeAI, GoogleGenerativeAIAbortError } from '@google/generative-ai';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isRetryableError(err: any): boolean {
  if (!err) return false;

  if (err.name === 'GoogleGenerativeAIRequestInputError' || err.name === 'GoogleGenerativeAIResponseError') {
    return false;
  }

  const status = err.status || err.statusCode || err.response?.status;
  if (status !== undefined) {
    return status === 503;
  }

  if (
    err.name === 'AbortError' ||
    err.name === 'TimeoutError' ||
    err instanceof GoogleGenerativeAIAbortError
  ) {
    return true;
  }

  const errMsg = (err.message || '').toLowerCase();
  if (
    errMsg.includes('timeout') ||
    errMsg.includes('network') ||
    errMsg.includes('fetch') ||
    errMsg.includes('econn') ||
    errMsg.includes('etimedout') ||
    errMsg.includes('socket')
  ) {
    return true;
  }

  return false;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'gemini_key_placeholder');

const TOOL_COSTS: Record<string, number> = {
  'content-generator': 5,
  'humanizer': 3,
  'paraphraser': 2,
  'ai-detector': 1,
};

export async function POST(req: Request) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tool, input, tone, creativity, wordLimit } = await req.json();
    const userId = authUser.id;

    if (!userId || !tool || !input) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cost = TOOL_COSTS[tool];
    if (cost === undefined) {
      return NextResponse.json({ error: 'Invalid tool' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'internal' && user.credits < cost) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 403 });
    }

    let prompt = "";
    let systemMessage = "You are a helpful assistant specializing in content optimization.";

    if (tone) {
      systemMessage += ` Write in a ${tone} style/tone.`;
    }
    if (creativity !== undefined) {
      systemMessage += ` Creativity level: ${creativity}/10 (higher means more creative, lower means more factual/direct).`;
    }

    if (tool === 'content-generator') {
      prompt = `Write a comprehensive and engaging article based on this topic: "${input}"`;
    } else if (tool === 'humanizer') {
      systemMessage = `You are an expert at making AI-generated text sound natural and human. Avoid common AI patterns and use a conversational tone. ${tone ? 'Tone style: ' + tone : ''}`;
      prompt = `Rewrite the following text to sound more natural, human-like, and conversational: "${input}"`;
    } else if (tool === 'paraphraser') {
      prompt = `Paraphrase the following text to improve clarity and flow while maintaining the original meaning: "${input}"`;
    } else if (tool === 'ai-detector') {
      systemMessage = "You are an advanced AI detection system. Analyze the provided text and provide a breakdown of whether it sounds human or AI-generated.";
      prompt = `Analyze the following text for AI-generated patterns and provide a confidence score for both Human and AI origin: "${input}"`;
    }

    if (wordLimit) {
      prompt += ` Keep the length within approximately ${wordLimit} words.`;
    }

    let output = "";
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("placeholder")) {
      // Mock response for local development when no real API key is set
      if (tool === 'content-generator') {
        output = `[MOCK GENERATION] Here is a mock article about "${input}":\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`;
      } else if (tool === 'humanizer') {
        output = `[MOCK HUMANIZED] This is a natural, human-sounding rewrite of your text: "${input}"`;
      } else if (tool === 'paraphraser') {
        output = `[MOCK PARAPHRASED] Clarity-optimized version: "${input}"`;
      } else if (tool === 'ai-detector') {
        output = `[MOCK DETECTOR ANALYSIS]\nHuman score: 95%\nAI score: 5%\nAnalysis: The text flows naturally with varied sentence lengths and typical human vocabulary patterns.`;
      }
    } else {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        systemInstruction: systemMessage,
      });

      const maxRetries = 3;
      let attempt = 0;
      while (true) {
        try {
          const result = await model.generateContent(prompt);
          output = result.response.text() || "Error: No response from Gemini.";
          break;
        } catch (err: any) {
          attempt++;
          if (attempt <= maxRetries && isRetryableError(err)) {
            const delay = Math.pow(2, attempt - 1) * 1000;
            console.warn(`Gemini API call failed (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms... Error:`, err.message || err);
            await sleep(delay);
          } else {
            throw err;
          }
        }
      }
    }

    if (user.role !== 'internal') {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { credits: { decrement: cost } },
        }),
        prisma.creditTransaction.create({
          data: {
            userId,
            amount: -cost,
            type: 'usage',
            notes: `Used ${tool}`,
          },
        }),
      ]);
    }

    await prisma.contentHistory.create({
      data: {
        userId,
        tool,
        input,
        output,
      },
    });

    return NextResponse.json({ output, creditsDeducted: user.role === 'internal' ? 0 : cost });
  } catch (err: any) {
    console.error("AI_GENERATE_ERROR FULL DETAILS:", err);
    return NextResponse.json(
      { error: `AI processing failed: ${err.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
