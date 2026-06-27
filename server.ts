import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { Task, RiskAnalysis, ChatMessage } from "./src/types";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini Client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// Fallback heuristic recommendations when Gemini API is unavailable
function getLocalRecommendations(tasks: Task[]): RiskAnalysis {
  if (tasks.length === 0) {
    return {
      riskScore: 0,
      likelyToMiss: [],
      suggestions: [
        "Create some tasks to start tracking your day.",
        "Add deadlines to see real-time risk assessments.",
        "Set up study or work categories for smart sorting.",
      ],
      explanation: "No tasks found. Your schedule is completely clear!",
    };
  }

  const activeTasks = tasks.filter((t) => t.status !== "completed");
  if (activeTasks.length === 0) {
    return {
      riskScore: 5,
      likelyToMiss: [],
      suggestions: [
        "All current tasks completed! Great job.",
        "Take a short 15-minute break to recharge.",
        "Plan your next big goals in the planner.",
      ],
      explanation: "You have completed all of today's tasks. Risk is extremely low.",
    };
  }

  const likelyToMiss: string[] = [];
  let totalIncompleteTasks = 0;
  let totalRiskPoints = 0;

  activeTasks.forEach((task) => {
    totalIncompleteTasks++;
    const workRemaining = task.hoursNeeded - task.hoursCompleted;
    
    if (workRemaining > task.deadlineHours) {
      // Physically impossible to finish on time
      likelyToMiss.push(task.title);
      totalRiskPoints += 100;
    } else if (task.deadlineHours <= 0) {
      likelyToMiss.push(task.title);
      totalRiskPoints += 100;
    } else {
      const loadRatio = workRemaining / task.deadlineHours;
      if (loadRatio > 0.8) {
        likelyToMiss.push(task.title);
        totalRiskPoints += 85;
      } else if (loadRatio > 0.5) {
        totalRiskPoints += 50;
      } else {
        totalRiskPoints += 15;
      }
    }
  });

  const rawScore = Math.round(totalRiskPoints / totalIncompleteTasks);
  const riskScore = Math.max(10, Math.min(95, rawScore));

  const suggestions: string[] = [];
  // Sort incomplete by load ratio descending
  const sortedTasks = [...activeTasks].sort((a, b) => {
    const aRemaining = a.hoursNeeded - a.hoursCompleted;
    const bRemaining = b.hoursNeeded - b.hoursCompleted;
    return (bRemaining / b.deadlineHours) - (aRemaining / a.deadlineHours);
  });

  if (sortedTasks.length > 0) {
    suggestions.push(`Start ${sortedTasks[0].title} immediately. It requires urgent attention.`);
  }
  
  const lowUrgency = activeTasks.find(t => (t.hoursNeeded - t.hoursCompleted) / t.deadlineHours < 0.3);
  if (lowUrgency) {
    suggestions.push(`Consider postponing ${lowUrgency.title} or scheduling it for tomorrow.`);
  } else if (sortedTasks.length > 1) {
    suggestions.push(`Delegate or scale down the scope of ${sortedTasks[1].title} if possible.`);
  } else {
    suggestions.push("Maintain a focused work block without social media distraction.");
  }

  suggestions.push("Ensure you sleep before 11 PM to sustain long-term cognitive stamina.");

  return {
    riskScore,
    likelyToMiss,
    suggestions: suggestions.slice(0, 3),
    explanation: likelyToMiss.length > 0 
      ? `High-risk schedule detected. You are likely to miss deadline for: ${likelyToMiss.join(", ")}.`
      : "You have a manageable load, but stay focused to prevent scope creep.",
  };
}

// Fallback chat response
function getLocalChatResponse(latestMessage: string, tasks: Task[]): string {
  const query = latestMessage.toLowerCase();
  const activeTasks = tasks.filter(t => t.status !== "completed");
  
  if (query.includes("risk") || query.includes("miss") || query.includes("deadline")) {
    const analysis = getLocalRecommendations(tasks);
    return `### 🚨 Risk Assessment Update
Your overall risk meter is currently at **${analysis.riskScore}%**. 
${analysis.likelyToMiss.length > 0 
  ? `You are highly likely to miss the deadline for **${analysis.likelyToMiss.join(", ")}** because the hours remaining exceed the deadline buffer.`
  : "Currently, you don't have any absolute bottlenecks, but this could change if tasks drag on."}

**My recommendation:**
1. Focus 100% on high-load items.
2. Skip low-priority tasks like routine meetings or administrative chores.
3. Postpone less urgent tasks to tomorrow.`;
  }

  if (query.includes("skip") || query.includes("postpone") || query.includes("what to do")) {
    if (activeTasks.length === 0) {
      return "You have no active tasks left! I recommend taking a break or scheduling tomorrow's objectives.";
    }
    const prioritized = [...activeTasks].sort((a, b) => b.deadlineHours - a.deadlineHours);
    const first = prioritized[0];
    const last = prioritized[prioritized.length - 1];
    return `### ⚡ Action Plan
Based on your timeline, here is what you should do:
- **Do This First:** **${first.title}** (highest urgency with ${first.deadlineHours}h remaining).
- **Consider Skipping/Postponing:** **${last.title}** (can wait, or has more flexible scheduling).

*Let me know if you want me to adjust your planner accordingly.*`;
  }

  return `### Hello! 🤖
I am your SaaS Productivity Assistant. I can help you evaluate deadlines, suggest scheduling modifications, and optimize your focus.

**Try asking me:**
- *"What should I skip or postpone right now?"*
- *"Are my deadlines at risk?"*
- *"Help me plan my remaining 5 hours."*

*(Note: Gemini API is running in offline-optimized mode. All assessments are calculated locally via elite heuristic models.)*`;
}

// API: Get Risk Assessment & Suggestions
app.post("/api/recommendations", async (req, res) => {
  try {
    const { tasks } = req.body as { tasks: Task[] };
    const ai = getGeminiClient();

    if (!ai) {
      // Key missing or not set, use local calculator
      const analysis = getLocalRecommendations(tasks);
      return res.json({ ...analysis, source: "local" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Analyze these tasks and deadlines for risk of missing them: ${JSON.stringify(
        tasks
      )}. Current local time is ${new Date().toISOString()}. Provide a realistic risk assessment.`,
      config: {
        systemInstruction:
          "You are an expert SaaS productivity planner. Calculate a real risk score (0-100) based on how much work is remaining vs the deadline. List any tasks that are likely to be missed, and give exactly 3 short, punchy, highly actionable suggestions to minimize risk. Be concise and practical.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: {
              type: Type.INTEGER,
              description:
                "Overall probability (0-100) of missing at least one deadline based on total hours needed vs deadline hours.",
            },
            likelyToMiss: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description:
                "List of task titles that are at high risk of missing their deadlines.",
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description:
                "Exactly 3 highly actionable, short bullet-point suggestions, like 'Start Assignment now' or 'Delay Gym'. Keep them brief.",
            },
            explanation: {
              type: Type.STRING,
              description: "A very brief 1-2 sentence explanation of the risk assessment.",
            },
          },
          required: ["riskScore", "likelyToMiss", "suggestions", "explanation"],
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text.trim()) as RiskAnalysis;
      return res.json({ ...data, source: "gemini" });
    } else {
      throw new Error("Empty response from Gemini API");
    }
  } catch (error: any) {
    console.error("Gemini Recommendations Error:", error);
    const analysis = getLocalRecommendations(req.body.tasks || []);
    res.json({ ...analysis, source: "local-fallback", error: error.message });
  }
});

// API: Assistant Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, tasks } = req.body as { messages: ChatMessage[]; tasks: Task[] };
    const latestMessage = messages[messages.length - 1]?.text || "";
    
    const ai = getGeminiClient();
    if (!ai) {
      const text = getLocalChatResponse(latestMessage, tasks);
      return res.json({ text, source: "local" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Context of my current tasks: ${JSON.stringify(tasks)}
            
Conversation history:
${messages.slice(0, -1).map((m) => `${m.sender === "user" ? "User" : "AI"}: ${m.text}`).join("\n")}

New user message: ${latestMessage}

Please respond to my query directly, giving specific tactical suggestions using the context of my tasks. Keep your response concise (under 3 short paragraphs) and in rich Markdown format. Do not repeat greeting messages if the conversation is ongoing.`,
            },
          ],
        },
      ],
      config: {
        systemInstruction:
          "You are an elite productivity AI. Analyze the user's workload, risk level, and questions, and give direct, blunt, and highly effective advice. Do not beat around the bush. Tell them exactly what to skip, what to postpone, and what to finish first to stay on track. Format with clean headers, bullet points, and bold text.",
      },
    });

    if (response.text) {
      return res.json({ text: response.text, source: "gemini" });
    } else {
      throw new Error("Empty response from Gemini API in chat");
    }
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    const text = getLocalChatResponse(req.body.messages?.[req.body.messages.length - 1]?.text || "", req.body.tasks || []);
    res.json({ text: `${text}\n\n*(Heuristic fallback loaded due to standard server API timeout or key configuration constraints.)*`, source: "local-fallback" });
  }
});

// ==========================================
// GOOGLE WORKSPACE API ENDPOINTS & HELPERS
// ==========================================

function getWorkspaceToken(): string | null {
  if (process.env.WORKSPACE_OAUTH_TOKEN) return process.env.WORKSPACE_OAUTH_TOKEN;
  if (process.env.GOOGLE_OAUTH_TOKEN) return process.env.GOOGLE_OAUTH_TOKEN;
  if (process.env.OAUTH_TOKEN) return process.env.OAUTH_TOKEN;

  const paths = [
    "/workspace/credentials/workspace-oauth-token.json",
    "/workspace/credentials/google-oauth-token.json",
    "/workspace/credentials/oauth-token.json",
    "/workspace/credentials/token.json",
    "/workspace/credentials/oauth2.json",
    "./credentials/workspace-oauth-token.json",
    "./credentials/token.json"
  ];

  for (const p of paths) {
    if (fs.existsSync(p)) {
      try {
        const content = fs.readFileSync(p, "utf8");
        const parsed = JSON.parse(content);
        if (typeof parsed === "string") return parsed;
        if (parsed.access_token) return parsed.access_token;
        if (parsed.accessToken) return parsed.accessToken;
        if (parsed.token) return parsed.token;
      } catch (e) {
        console.error(`Error reading token from path ${p}:`, e);
      }
    }
  }

  return null;
}

async function fetchGoogleUserProfile(token: string) {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (res.ok) {
    return await res.json();
  }
  throw new Error(`Failed to fetch user profile: ${await res.text()}`);
}

async function fetchGoogleCalendarEvents(token: string) {
  const url = "https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=" + new Date().toISOString() + "&maxResults=25&orderBy=startTime&singleEvents=true";
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    throw new Error(`Calendar API returned ${res.status}: ${await res.text()}`);
  }
  return await res.json();
}

async function fetchGoogleTasks(token: string) {
  const listRes = await fetch("https://tasks.googleapis.com/tasks/v1/users/@me/lists", {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!listRes.ok) {
    throw new Error(`Tasks API returned ${listRes.status}: ${await listRes.text()}`);
  }
  const listsData = await listRes.json();
  const lists = listsData.items || [];
  
  const allTasks: any[] = [];
  for (const list of lists) {
    const tasksRes = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${list.id}/tasks?showCompleted=false`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (tasksRes.ok) {
      const tasksData = await tasksRes.json();
      const items = (tasksData.items || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        notes: t.notes || "",
        due: t.due || null,
        status: t.status,
        listId: list.id,
        listTitle: list.title
      }));
      allTasks.push(...items);
    }
  }
  return allTasks;
}

// Check Connection Status
app.get("/api/workspace/status", async (req, res) => {
  const token = getWorkspaceToken();
  if (!token) {
    return res.json({ connected: false });
  }
  try {
    const profile = await fetchGoogleUserProfile(token);
    return res.json({ connected: true, profile });
  } catch (err: any) {
    return res.json({ connected: false, error: err.message });
  }
});

// Synchronize Google Calendar Events + Tasks
app.get("/api/workspace/sync", async (req, res) => {
  const token = getWorkspaceToken();
  if (!token) {
    return res.status(401).json({ error: "No active Google Workspace connection found." });
  }

  try {
    const [events, tasks, profile] = await Promise.all([
      fetchGoogleCalendarEvents(token).catch(err => {
        console.error("Error fetching calendar:", err);
        return { items: [] };
      }),
      fetchGoogleTasks(token).catch(err => {
        console.error("Error fetching tasks:", err);
        return [];
      }),
      fetchGoogleUserProfile(token).catch(() => null)
    ]);

    return res.json({
      calendar: events.items || [],
      tasks: tasks || [],
      profile
    });
  } catch (error: any) {
    console.error("Workspace Sync Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Create Google Calendar Event
app.post("/api/workspace/calendar/event", async (req, res) => {
  const token = getWorkspaceToken();
  if (!token) {
    return res.status(401).json({ error: "No active Google Workspace connection." });
  }

  try {
    const { title, description, startTime, endTime } = req.body;
    const body = {
      summary: title,
      description: description,
      start: { dateTime: startTime },
      end: { dateTime: endTime }
    };

    const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Calendar API returned ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return res.json({ success: true, event: data });
  } catch (error: any) {
    console.error("Create Calendar Event Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Create Google Task
app.post("/api/workspace/tasks/create", async (req, res) => {
  const token = getWorkspaceToken();
  if (!token) {
    return res.status(401).json({ error: "No active Google Workspace connection." });
  }

  try {
    const { title, notes, dueDate } = req.body;
    
    // Get primary list
    const listsRes = await fetch("https://tasks.googleapis.com/tasks/v1/users/@me/lists", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!listsRes.ok) {
      throw new Error(`Failed to list tasks lists: ${await listsRes.text()}`);
    }
    const listsData = await listsRes.json();
    const primaryListId = listsData.items?.[0]?.id || "@default";

    const body = {
      title,
      notes,
      due: dueDate ? new Date(dueDate).toISOString() : undefined
    };

    const response = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${primaryListId}/tasks`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Tasks API returned ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return res.json({ success: true, task: data });
  } catch (error: any) {
    console.error("Create Task Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Setup Vite Dev Server / Static Asset Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Productivity Dashboard server booted on port ${PORT}`);
  });
}

startServer();
