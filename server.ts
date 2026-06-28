import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { Task, RiskAnalysis, ChatMessage, ScheduleEvent } from "./src/types";

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
      todayPriorities: [],
      predictedCompletionTimes: "N/A",
      suggestedScheduleChanges: [],
      productivitySummary: "Your schedule is currently clear. Add some objectives to begin.",
      digitalTwinStatement: "Hello! I'm your Digital Twin. I have analyzed your system profile. Everything looks completely empty—let's design your day together!",
      tasksWithRisk: []
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
      todayPriorities: [],
      predictedCompletionTimes: "Completed",
      suggestedScheduleChanges: [],
      productivitySummary: "Incredible efficiency! All logged objectives are complete. You are fully optimized.",
      digitalTwinStatement: "Brilliant performance today! You finished all objectives ahead of schedule. Take some time to decompress.",
      tasksWithRisk: tasks.map(t => ({ id: t.id, riskLevel: "low", explanation: "Task completed." }))
    };
  }

  const likelyToMiss: string[] = [];
  let totalIncompleteTasks = 0;
  let totalRiskPoints = 0;
  const tasksWithRisk: { id: string; riskLevel: 'low' | 'medium' | 'high'; explanation: string }[] = [];

  activeTasks.forEach((task) => {
    totalIncompleteTasks++;
    const workRemaining = task.hoursNeeded - task.hoursCompleted;
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let explanation = 'On track.';
    
    if (workRemaining > task.deadlineHours) {
      // Physically impossible to finish on time
      likelyToMiss.push(task.title);
      totalRiskPoints += 100;
      riskLevel = 'high';
      explanation = `Required work (${workRemaining}h) exceeds timeline buffer (${task.deadlineHours.toFixed(1)}h).`;
    } else if (task.deadlineHours <= 0) {
      likelyToMiss.push(task.title);
      totalRiskPoints += 100;
      riskLevel = 'high';
      explanation = 'Deadline has already passed.';
    } else {
      const loadRatio = workRemaining / task.deadlineHours;
      if (loadRatio > 0.8) {
        likelyToMiss.push(task.title);
        totalRiskPoints += 85;
        riskLevel = 'high';
        explanation = `Tight buffer: required work (${workRemaining}h) takes ${Math.round(loadRatio * 100)}% of remaining buffer.`;
      } else if (loadRatio > 0.5) {
        totalRiskPoints += 50;
        riskLevel = 'medium';
        explanation = `Moderate risk: workload takes ${Math.round(loadRatio * 100)}% of remaining timeline.`;
      } else {
        totalRiskPoints += 15;
        riskLevel = 'low';
        explanation = `Timeline is comfortable with ${task.deadlineHours.toFixed(1)} hours remaining.`;
      }
    }
    tasksWithRisk.push({ id: task.id, riskLevel, explanation });
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

  // Today priorities
  const todayPriorities = sortedTasks.map(t => t.title);

  // Predicted completion times
  const totalHoursRemaining = activeTasks.reduce((acc, t) => acc + (t.hoursNeeded - t.hoursCompleted), 0);
  const now = new Date();
  now.setMinutes(now.getMinutes() + Math.round(totalHoursRemaining * 60 * 1.25)); // 25% overhead buffer for breaks
  const predictedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Suggested schedule changes
  const suggestedScheduleChanges = [
    `Postpone Leisure block to clear a deep-focus sprint for ${sortedTasks[0]?.title || 'objectives'}.`,
    "Reschedule Workout session downstream to protect active memory states.",
    "Engage full-scale digital distraction blockade on browser tabs."
  ];

  // Productivity summary
  const productivitySummary = `You have ${activeTasks.length} active objectives requiring ${totalHoursRemaining.toFixed(1)} hours of total focused load. Your schedule congestion is ${riskScore > 75 ? 'highly saturated' : riskScore > 40 ? 'moderately balanced' : 'perfectly spaced'}. Core attention is prioritized on ${sortedTasks[0]?.title || 'major objectives'}.`;

  // Digital Twin Statement
  let digitalTwinStatement = "";
  if (riskScore > 75) {
    digitalTwinStatement = `I noticed today's plan is unrealistic. Your active workload is highly congested. I moved Gym to tomorrow because your ${sortedTasks[0]?.title || 'assignment'} has higher priority. You are currently behind schedule, but this adjustment keeps you in the clear.`;
  } else {
    digitalTwinStatement = `Your schedule looks fully in sync with your capacity today. I predict you will complete your objectives around ${predictedTime}. Focus is locked; avoid social media and let's get to work!`;
  }

  return {
    riskScore,
    likelyToMiss,
    suggestions: suggestions.slice(0, 3),
    explanation: likelyToMiss.length > 0 
      ? `High-risk schedule detected. You are likely to miss deadline for: ${likelyToMiss.join(", ")}.`
      : "You have a manageable load, but stay focused to prevent scope creep.",
    todayPriorities,
    predictedCompletionTimes: predictedTime,
    suggestedScheduleChanges,
    productivitySummary,
    digitalTwinStatement,
    tasksWithRisk
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
      )}. Current local time is ${new Date().toISOString()}. Provide a realistic risk assessment and proactive day planning metadata.`,
      config: {
        systemInstruction:
          "You are the user's ultimate Digital Twin. Calculate a real risk score (0-100) based on how much work is remaining vs the deadline. List any tasks that are likely to be missed, and give exactly 3 short, punchy, highly actionable suggestions to minimize risk. Also, identify Today's Priorities (list of task titles sorted by priority), Predicted Completion Time (e.g. '8:30 PM' or '10:15 PM' based on local time and total hours), Suggested Schedule Changes (e.g. 'Postpone Gym to Sunday', 'Cancel Leisure block'), a concise Productivity Summary paragraph, a first-person Twin Statement expressing advice with personality (e.g. 'I noticed today's plan is unrealistic. You usually lose focus after 4 PM, so I suggest...'), and calculate individual risk level (LOW, MEDIUM, or HIGH) and brief explanation for each and every task.",
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
            todayPriorities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "The list of task titles prioritized for today."
            },
            predictedCompletionTimes: {
              type: Type.STRING,
              description: "Predicted completion time, e.g. '9:30 PM'."
            },
            suggestedScheduleChanges: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of specific schedule routine optimizations."
            },
            productivitySummary: {
              type: Type.STRING,
              description: "A summary paragraph analyzing workload, stress levels, and buffer status."
            },
            digitalTwinStatement: {
              type: Type.STRING,
              description: "A direct, first-person coaching advice quote from the Twin with distinct, intelligent personality (e.g., 'I analyzed your day. I suggest postponing Workout...')."
            },
            tasksWithRisk: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  riskLevel: { type: Type.STRING, description: "LOW, MEDIUM, or HIGH" },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "riskLevel", "explanation"]
              },
              description: "Analysis of each individual task in the input array."
            }
          },
          required: ["riskScore", "likelyToMiss", "suggestions", "explanation", "todayPriorities", "predictedCompletionTimes", "suggestedScheduleChanges", "productivitySummary", "digitalTwinStatement", "tasksWithRisk"],
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

// Helper: Local dynamic plan step generator
function getLocalPlanSteps(tasks: Task[], risk: RiskAnalysis): any[] {
  const activeTasks = tasks.filter(t => t.status !== "completed");
  const highestUrgency = activeTasks.sort((a, b) => {
    const aRem = a.hoursNeeded - a.hoursCompleted;
    const bRem = b.hoursNeeded - b.hoursCompleted;
    const aRatio = a.deadlineHours > 0 ? (aRem / a.deadlineHours) : 10;
    const bRatio = b.deadlineHours > 0 ? (bRem / b.deadlineHours) : 10;
    return bRatio - aRatio;
  })[0];

  const slipTaskTitle = highestUrgency ? highestUrgency.title : (risk.likelyToMiss?.[0] || "Assignment");

  return [
    {
      title: `Focus Sprint: Complete ${slipTaskTitle}`,
      desc: `Dedicate a highly-focused 90-minute Pomodoro block to **${slipTaskTitle}**. Eliminate background tabs, mute social apps, and secure high-productivity execution.`,
      time: "First 2 Hours",
      urgency: "CRITICAL",
      priority: "CRITICAL",
      duration: "90 minutes",
      reason: "This task has the highest timeline congestion risk. A focused sprint now prevents a downstream deadline breach.",
      expectedFinishTime: "2:30 PM",
      dependencies: ["Silence phone notifications"],
      confidence: 90
    },
    {
      title: "Reschedule Secondary Chores",
      desc: `Postpone low impact admin chores or personal leisure to later this evening. Preserve your active mind for your ${activeTasks.length || 3} pending objectives.`,
      time: "Midday Adjustment",
      urgency: "MEDIUM",
      priority: "Medium",
      duration: "30 minutes",
      reason: "Secondary administrative work drains mental reserve. Moving this clears a 2-hour distraction-free work block.",
      expectedFinishTime: "4:00 PM",
      dependencies: ["Identify secondary chores"],
      confidence: 95
    },
    {
      title: "Cognitive Recovery Decompression",
      desc: "Practice 4-7-8 breathing mechanics. Disconnect from screens during rest buffers to lower visual exhaustion and reset focus thresholds.",
      time: "Between Tasks",
      urgency: "LOW",
      priority: "Low",
      duration: "15 minutes",
      reason: "Restoring neural dopamine balance prevents visual burnout and preserves cognitive stamina for evening sprints.",
      expectedFinishTime: "4:15 PM",
      dependencies: [],
      confidence: 99
    }
  ];
}

// Helper: Local Emergency Survival Planner
function getLocalSurvivalPlan(tasks: Task[]): any {
  const activeTasks = tasks.filter(t => t.status !== "completed");
  
  // Reorder tasks: high priority first
  const sorted = [...tasks].sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (b.status === 'completed' && a.status !== 'completed') return -1;
    const pA = a.priority === 'high' ? 3 : a.priority === 'medium' ? 2 : 1;
    const pB = b.priority === 'high' ? 3 : b.priority === 'medium' ? 2 : 1;
    return pB - pA;
  });

  const skipRecommendations = [
    "Postpone personal reading and non-essential leisure.",
    "Skip administrative meetings or reschedule non-critical syncing.",
    "Defer routine gym workout block to Sunday to protect deep focus states."
  ];

  const survivalPlan = `### 🚨 DIGITAL TWIN EMERGENCY SURVIVAL PROTOCOL

I detected severe timeline congestion. Your schedule has **${activeTasks.length} active tasks** needing **${activeTasks.reduce((acc, t) => acc + (t.hoursNeeded - t.hoursCompleted), 0)} hours** of total work.

Here is your tactical, high-intensity survival protocol to secure your critical deadlines today:

1. **Lock Down Priorities**: Focus exclusively on **${sorted[0]?.title || 'Critical Objectives'}**. All secondary work has been automatically marked as 'deferred' or moved downstream.
2. **Brutal Cut-down**: Stop all multitasking. We recommend skipping optional activities like routine meetings or leisure today.
3. **90-Minute Sprint Blocks**: Initiate the Pomodoro protocol with full-scale website blockade. Zero tab hopping.
4. **Cognitive Sleep Shield**: Wrap up focus blocks by 10:30 PM. Forcing work past midnight triggers severe focus degradation tomorrow.`;

  return {
    reorderedTasks: sorted,
    skipRecommendations,
    survivalPlan
  };
}

// API: Generate Dynamic Planner Steps
app.post("/api/planner/generate", async (req, res) => {
  try {
    const { tasks, risk } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      const steps = getLocalPlanSteps(tasks || [], risk || {});
      return res.json({ steps, source: "local" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate a step-by-step personalized schedule priority plan based on these tasks: ${JSON.stringify(
        tasks
      )} and this risk assessment: ${JSON.stringify(risk)}. Output exactly 3 sequential action steps in the requested JSON structure.`,
      config: {
        systemInstruction:
          "You are the user's ultimate Digital Twin. Create 3 highly customized steps to help the user clear their bottleneck tasks. Be concrete: mention actual task names, exact timings, and precise focus tactics. For each step, include fields for priority (Low, Medium, High, Critical), duration (e.g. '90 mins'), reason why this step is critical, expectedFinishTime (e.g. '4:30 PM'), dependencies (e.g. ['Clear workspace']), and confidence (0-100 percentage meeting this target).",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  desc: { type: Type.STRING },
                  time: { type: Type.STRING },
                  urgency: { type: Type.STRING, description: "CRITICAL, MEDIUM, or LOW" },
                  priority: { type: Type.STRING, description: "Low, Medium, High, Critical" },
                  duration: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  expectedFinishTime: { type: Type.STRING },
                  dependencies: { type: Type.ARRAY, items: { type: Type.STRING } },
                  confidence: { type: Type.INTEGER }
                },
                required: ["title", "desc", "time", "urgency", "priority", "duration", "reason", "expectedFinishTime", "dependencies", "confidence"]
              }
            }
          },
          required: ["steps"]
        }
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      return res.json({ steps: parsed.steps, source: "gemini" });
    } else {
      throw new Error("Empty response from Gemini for planner steps");
    }
  } catch (err: any) {
    console.error("Dynamic Planner Error:", err);
    const steps = getLocalPlanSteps(req.body.tasks || [], req.body.risk || {});
    res.json({ steps, source: "local-fallback", error: err.message });
  }
});

// API: Proactive Emergency Survival Plan Generator
app.post("/api/emergency/survival", async (req, res) => {
  try {
    const { tasks } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      const plan = getLocalSurvivalPlan(tasks || []);
      return res.json({ ...plan, source: "local" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `A crisis has been triggered! Generate an emergency survival plan and task prioritization for these tasks: ${JSON.stringify(
        tasks
      )}. Reorder tasks, identify specific optional activities to skip today, and produce a survival plan in rich Markdown format.`,
      config: {
        systemInstruction:
          "You are the user's high-performance Digital Twin. Reorder the user's tasks array to prioritize high-priority, high-load work first, and defer or recommend pausing low-priority work. Recommend exactly 3 specific non-essential activities/events to skip or postpone (e.g., 'Reschedule social coffee', 'Postpone laundry chores'). Write a direct, brutally honest emergency survival plan in rich Markdown format with clean bullet points and numbered protocols. Be specific to their actual tasks.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reorderedTasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  hoursCompleted: { type: Type.NUMBER },
                  hoursNeeded: { type: Type.NUMBER },
                  deadlineHours: { type: Type.NUMBER },
                  category: { type: Type.STRING },
                  status: { type: Type.STRING },
                  priority: { type: Type.STRING }
                },
                required: ["id", "title", "status", "priority"]
              }
            },
            skipRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exactly 3 clear recommendations of non-essential activities to skip or postpone today."
            },
            survivalPlan: {
              type: Type.STRING,
              description: "A comprehensive, high-intensity emergency survival plan in rich Markdown."
            }
          },
          required: ["reorderedTasks", "skipRecommendations", "survivalPlan"]
        }
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      return res.json({ ...parsed, source: "gemini" });
    } else {
      throw new Error("Empty response from Gemini for emergency survival");
    }
  } catch (err: any) {
    console.error("Emergency Survival Plan Error:", err);
    const plan = getLocalSurvivalPlan(req.body.tasks || []);
    res.json({ ...plan, source: "local-fallback", error: err.message });
  }
});

// Helper: Local high-fidelity schedule reorganization logic
function getLocalReorganizedSchedule(tasks: Task[], scheduleEvents: ScheduleEvent[]): any {
  const activeTasks = tasks.filter(t => t.status !== "completed");
  const urgentTask = activeTasks.sort((a, b) => {
    if (a.priority === "high" && b.priority !== "high") return -1;
    if (b.priority === "high" && a.priority !== "high") return 1;
    return (b.hoursNeeded - b.hoursCompleted) - (a.hoursNeeded - a.hoursCompleted);
  })[0];
  const urgentTitle = urgentTask ? urgentTask.title : "Urgent Objectives";

  const hasLeisureOrWorkout = scheduleEvents.some(e => e.category === 'Leisure' || e.category === 'Workout');
  let reorganizedEvents = [...scheduleEvents];
  let explanation = "";
  let affectedTasks = urgentTask ? [urgentTask.title] : ["Commitments"];

  if (hasLeisureOrWorkout) {
    reorganizedEvents = scheduleEvents.map(e => {
      if (e.category === 'Leisure') {
        return {
          ...e,
          title: `Deep Work Focus: ${urgentTitle}`,
          category: 'Study' as any
        };
      }
      if (e.category === 'Workout') {
        return {
          ...e,
          startTime: "19:30",
          endTime: "20:30",
          title: "Abbreviated Athletic Training (Deferred)"
        };
      }
      return e;
    });
    explanation = `My scheduler intervened! I noticed **${urgentTitle}** has narrow safety windows today. I restructured your leisure block into an active focus window, and delayed your workout session to 19:30. This secures your critical deadlines while maintaining baseline routines.`;
  } else {
    const overrideId = `twin_override_${Date.now()}`;
    const newBlock: ScheduleEvent = {
      id: overrideId,
      title: `⚡ Twin Override Focus: ${urgentTitle}`,
      startTime: "11:00",
      endTime: "13:00",
      category: "Study",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    };
    reorganizedEvents = [newBlock, ...scheduleEvents];
    explanation = `Schedule optimized. I inserted a dedicated 2-hour 'Twin Override Focus Block' at 11:00 to guarantee that **${urgentTitle}** completes well ahead of its deadline. Regular calendar elements have been adjusted downstream.`;
  }

  return {
    reorganizedEvents,
    explanation,
    affectedTasks
  };
}

// API: Digital Twin Schedule Reorganization (Automatic Slippage Control)
app.post("/api/digitaltwin/reorganize", async (req, res) => {
  try {
    const { tasks, scheduleEvents } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      const result = getLocalReorganizedSchedule(tasks || [], scheduleEvents || []);
      return res.json({ ...result, source: "local" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `A task has slipped or deadlines are extremely tight! Analyze these tasks: ${JSON.stringify(
        tasks
      )} and this current schedule routine: ${JSON.stringify(
        scheduleEvents
      )}. Reorganize the schedule to create deep focus blocks for slippage tasks and postpone or scale down non-urgent items. Return the updated schedule, a clear twin-like reasoning explanation, and the list of affected tasks.`,
      config: {
        systemInstruction:
          "You are the user's ultimate Digital Twin. Act as a proactive scheduler. Analyze which tasks are slipping (where hoursNeeded - hoursCompleted > deadlineHours, or priority is high and deadline is close). If a task is slipping, modify the scheduleEvents array: postpone or adjust non-critical classes/workouts/leisure blocks to introduce 1.5 - 2.5 hour 'Deep Work Focus Block: [Task Name]' periods. Explain exactly why you rescheduled those specific events and how it secures their deadlines.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reorganizedEvents: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  startTime: { type: Type.STRING },
                  endTime: { type: Type.STRING },
                  category: { type: Type.STRING, description: "Class, Workout, Meal, Study, Leisure, or Other" },
                  days: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["id", "title", "startTime", "endTime", "category"]
              }
            },
            explanation: { type: Type.STRING, description: "A detailed explanation of the schedule modifications and the twin's cognitive reasoning." },
            affectedTasks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Titles of tasks that are saved or affected by this reorganization." }
          },
          required: ["reorganizedEvents", "explanation", "affectedTasks"]
        }
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      return res.json({ ...parsed, source: "gemini" });
    } else {
      throw new Error("Empty response from Gemini for reorganization");
    }
  } catch (err: any) {
    console.error("Twin Reorganize Error:", err);
    const result = getLocalReorganizedSchedule(req.body.tasks || [], req.body.scheduleEvents || []);
    res.json({ ...result, source: "local-fallback", error: err.message });
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
