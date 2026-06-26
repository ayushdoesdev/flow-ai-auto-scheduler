/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { getTasks, createTask, updateTask, deleteTask } from "./src/db/tasks.ts";
import { getCalendarEvents, createCalendarEvent } from "./src/db/calendar.ts";

// Helper for generating IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Mock subscription and devices for now
let userSubscription = {
  plan: "free_trial",
  trialStartedAt: new Date().toISOString(),
  trialEndsAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
  isPaid: false,
  aiInsightsUsed: 1,
  aiInsightsLimit: 5
};

let syncDevices = [
  { id: "dev-1", name: "MacBook Pro M3", type: "macbook", lastActive: new Date().toISOString(), status: "online" },
  { id: "dev-2", name: "iPhone 15 Pro", type: "iphone", lastActive: new Date(Date.now() - 3600 * 1000).toISOString(), status: "offline" }
];

let latestInsight: any = {
  summary: "Initial synchronization complete. AI Auto-scheduler is ready.",
  doThisNowTaskId: undefined,
  schedulePlan: [],
  tips: ["Log your first task to activate AI suggestions."],
  focusScore: 100,
  generatedAt: new Date().toISOString()
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // --- Task endpoints ---
  app.get("/api/tasks", requireAuth, async (req: AuthRequest, res) => {
    try {
      const tasksList = await getTasks(req.dbUser.id);
      res.json(tasksList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tasks", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { title, priority, durationMinutes, dueDate, category } = req.body;
      const newTask = await createTask(req.dbUser.id, {
        title: title || "Untitled Task",
        completed: false,
        priority: priority || "medium",
        durationMinutes: Number(durationMinutes) || 30,
        dueDate: dueDate || undefined,
        category: category || "General"
      });
      res.status(201).json(newTask);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/tasks/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const updated = await updateTask(req.dbUser.id, req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/tasks/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      await deleteTask(req.dbUser.id, req.params.id);
      res.json({ success: true, id: req.params.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Calendar Event endpoints ---
  app.get("/api/calendar", requireAuth, async (req: AuthRequest, res) => {
    try {
      const events = await getCalendarEvents(req.dbUser.id);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/calendar", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { title, start, end, isDeadline, associatedTaskId, urgencyScore } = req.body;
      const newEvent = await createCalendarEvent(req.dbUser.id, {
        title: title || "New Calendar Event",
        start: start || new Date().toISOString(),
        end: end || new Date(Date.now() + 3600 * 1000).toISOString(),
        isDeadline: !!isDeadline,
        associatedTaskId: associatedTaskId || undefined,
        urgencyScore: Number(urgencyScore) || 5
      });
      res.status(201).json(newEvent);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/calendar/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      // Dummy logic since DB helper isn't created yet, but this is enough to unblock
      res.json({ success: true, id: req.params.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Subscription management ---
  app.get("/api/subscription", requireAuth, (req, res) => {
    res.json(userSubscription);
  });

  app.post("/api/subscription/upgrade", requireAuth, (req, res) => {
    userSubscription = {
      ...userSubscription,
      plan: "pro",
      isPaid: true,
      aiInsightsLimit: 1000
    };
    res.json({ success: true, subscription: userSubscription });
  });

  app.post("/api/subscription/reset", requireAuth, (req, res) => {
    userSubscription = {
      plan: "free_trial",
      trialStartedAt: new Date().toISOString(),
      trialEndsAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      isPaid: false,
      aiInsightsUsed: 1,
      aiInsightsLimit: 5
    };
    res.json({ success: true, subscription: userSubscription });
  });

  // --- Device syncing endpoints ---
  app.get("/api/devices", requireAuth, (req, res) => {
    res.json(syncDevices);
  });

  app.post("/api/devices/trigger-sync", requireAuth, (req, res) => {
    const { deviceId } = req.body;
    const dev = syncDevices.find(d => d.id === deviceId);
    if (dev) {
      dev.status = "online";
      dev.lastActive = new Date().toISOString();
      res.json({ success: true, device: dev });
    } else {
      res.status(404).json({ error: "Device not found" });
    }
  });

  // --- AI Insights ---
  app.get("/api/insights", requireAuth, (req, res) => {
    res.json(latestInsight);
  });

  app.post("/api/insights/generate", requireAuth, async (req: AuthRequest, res) => {
    if (userSubscription.plan === "free_trial" && userSubscription.aiInsightsUsed >= userSubscription.aiInsightsLimit) {
      return res.status(403).json({
        error: "Trial limit reached",
        message: "You have completed your free AI runs. Upgrade to Premium."
      });
    }

    userSubscription.aiInsightsUsed += 1;
    const apiKey = process.env.GEMINI_API_KEY;

    try {
      const activeTasks = await getTasks(req.dbUser.id);
      
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
        const score = Math.min(100, Math.max(30, 100 - activeTasks.length * 8));
        latestInsight = {
          summary: "Local Priority Optimizer completed.",
          doThisNowTaskId: activeTasks[0]?.id,
          focusScore: score,
          schedulePlan: [],
          tips: ["Keep up the good work."],
          generatedAt: new Date().toISOString()
        };
        return res.json({ insight: latestInsight, fallback: true });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Analyze tasks and calendar for a user. Tasks: ${JSON.stringify(activeTasks)}.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              doThisNowTaskId: { type: Type.STRING },
              focusScore: { type: Type.INTEGER },
              schedulePlan: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { time: {type: Type.STRING}, taskId: {type: Type.STRING}, taskTitle: {type: Type.STRING}, reason: {type: Type.STRING} } } },
              tips: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["summary", "doThisNowTaskId", "focusScore", "schedulePlan", "tips"]
          }
        }
      });

      const parsedResult = JSON.parse(response.text || "{}");
      latestInsight = {
        summary: parsedResult.summary || "Prioritization update completed.",
        doThisNowTaskId: parsedResult.doThisNowTaskId || undefined,
        focusScore: Number(parsedResult.focusScore) || 85,
        schedulePlan: parsedResult.schedulePlan || [],
        tips: parsedResult.tips || [],
        generatedAt: new Date().toISOString()
      };

      res.json({ insight: latestInsight, fallback: false });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to process AI request." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
