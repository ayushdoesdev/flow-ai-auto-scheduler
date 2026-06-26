/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Task, CalendarEvent, UserSubscription, ProductivityInsight, SyncDevice } from './types';
import TaskManager from './components/TaskManager';
import CalendarTimeline from './components/CalendarTimeline';
import { 
  Sparkles, 
  RefreshCw, 
  Smartphone, 
  Laptop, 
  Tablet, 
  Zap, 
  ShieldCheck, 
  Calendar, 
  Lock, 
  DollarSign, 
  Clock, 
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './components/AuthProvider';

export default function App() {
  const { user, loading: authLoading, signIn, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [devices, setDevices] = useState<SyncDevice[]>([]);
  const [insight, setInsight] = useState<ProductivityInsight | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [loading, setLoading] = useState(true);
  const [generatingInsight, setGeneratingInsight] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const token = user ? await user.getIdToken() : null;
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(url, { ...options, headers });
  };

  // Active navigation tab highlight
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'calendar' | 'automations'>('dashboard');

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch all initial dashboard data
  const loadDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setErrorMsg(null);

      const [tasksRes, calRes, subRes, devRes, insRes] = await Promise.all([
        authenticatedFetch('/api/tasks'),
        authenticatedFetch('/api/calendar'),
        authenticatedFetch('/api/subscription'),
        authenticatedFetch('/api/devices'),
        authenticatedFetch('/api/insights')
      ]);

      if (!tasksRes.ok || !calRes.ok || !subRes.ok || !devRes.ok || !insRes.ok) {
        throw new Error('Failed to load server data. Make sure the backend server is running.');
      }

      const tasksData = await tasksRes.json();
      const calData = await calRes.json();
      const subData = await subRes.json();
      const devData = await devRes.json();
      const insData = await insRes.json();

      setTasks(tasksData);
      setCalendarEvents(calData);
      setSubscription(subData);
      setDevices(devData);
      setInsight(insData);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Server connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Show a temporary success toast
  const showToast = (message: string) => {
    setSuccessMsg(message);
    setTimeout(() => {
      setSuccessMsg(null);
    }, 3000);
  };

  // --- Task Operations ---
  const handleAddTask = async (newTask: Omit<Task, 'id' | 'completed'>) => {
    try {
      const response = await authenticatedFetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      if (response.ok) {
        const created = await response.json();
        setTasks(prev => [...prev, created]);
        showToast(`Task "${created.title}" successfully created!`);
        // Refresh devices sync indicators
        refreshSyncDevices();
      }
    } catch (err) {
      setErrorMsg('Failed to add task.');
    }
  };

  const handleToggleTask = async (id: string, completed: boolean) => {
    try {
      const response = await authenticatedFetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      });
      if (response.ok) {
        const updated = await response.json();
        setTasks(prev => prev.map(t => t.id === id ? updated : t));
        showToast(completed ? "Task marked complete!" : "Task marked incomplete.");
        refreshSyncDevices();
      }
    } catch (err) {
      setErrorMsg('Failed to update task.');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const response = await authenticatedFetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setTasks(prev => prev.filter(t => t.id !== id));
        showToast("Task successfully removed.");
        refreshSyncDevices();
      }
    } catch (err) {
      setErrorMsg('Failed to delete task.');
    }
  };

  // --- Calendar Milestone Operations ---
  const handleAddEvent = async (newEvent: Omit<CalendarEvent, 'id'>) => {
    try {
      const response = await authenticatedFetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });
      if (response.ok) {
        const created = await response.json();
        setCalendarEvents(prev => [...prev, created]);
        showToast(`Milestone "${created.title}" synchronized!`);
        refreshSyncDevices();
      }
    } catch (err) {
      setErrorMsg('Failed to sync milestone.');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const response = await authenticatedFetch(`/api/calendar/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setCalendarEvents(prev => prev.filter(e => e.id !== id));
        showToast("Milestone calendar sync removed.");
        refreshSyncDevices();
      }
    } catch (err) {
      setErrorMsg('Failed to delete milestone.');
    }
  };

  // --- Subscription management ---
  const handleUpgradeSubscription = async () => {
    try {
      const response = await authenticatedFetch('/api/subscription/upgrade', { method: 'POST' });
      if (response.ok) {
        const resData = await response.json();
        setSubscription(resData.subscription);
        showToast("Welcome to Premium! Unlimited AI priority access unlocked.");
      }
    } catch (err) {
      setErrorMsg('Failed to process upgrade checkout mockup.');
    }
  };

  const handleResetSubscription = async () => {
    try {
      const response = await authenticatedFetch('/api/subscription/reset', { method: 'POST' });
      if (response.ok) {
        const resData = await response.json();
        setSubscription(resData.subscription);
        showToast("Trial account settings successfully reset.");
      }
    } catch (err) {
      setErrorMsg('Failed to reset trial.');
    }
  };

  // --- Device synchronization simulation ---
  const handleTriggerDeviceSync = async (deviceId: string) => {
    try {
      const response = await authenticatedFetch('/api/devices/trigger-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId })
      });
      if (response.ok) {
        const resData = await response.json();
        setDevices(prev => prev.map(d => d.id === deviceId ? resData.device : d));
        showToast(`Forced real-time synchronization on ${resData.device.name}!`);
      }
    } catch (err) {
      setErrorMsg('Failed to sync device.');
    }
  };

  const refreshSyncDevices = async () => {
    try {
      const res = await authenticatedFetch('/api/devices');
      if (res.ok) {
        const data = await res.json();
        setDevices(data);
      }
    } catch (e) {
      console.warn("Silent sync error background update", e);
    }
  };

  // --- AI Insights Priority Engine Trigger ---
  const handleGenerateAIInsights = async () => {
    try {
      setGeneratingInsight(true);
      setErrorMsg(null);
      const response = await authenticatedFetch('/api/insights/generate', { method: 'POST' });
      
      if (response.status === 403) {
        const errJson = await response.json();
        throw new Error(errJson.message || 'Trial limit reached.');
      }

      if (!response.ok) {
        throw new Error('AI Engine failed to compute priorities. Check console log.');
      }

      const resData = await response.json();
      setInsight(resData.insight);
      
      // Refresh tasks list and subscription counters as they are updated by server
      const [tasksRes, subRes] = await Promise.all([
        authenticatedFetch('/api/tasks'),
        authenticatedFetch('/api/subscription')
      ]);
      if (tasksRes.ok) setTasks(await tasksRes.json());
      if (subRes.ok) setSubscription(await subRes.json());

      showToast(resData.fallback ? "Deterministic Priority engine loaded!" : "Gemini AI Priority updated!");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to process AI request.');
    } finally {
      setGeneratingInsight(false);
    }
  };

  // Counting metrics
  const activeTasks = tasks.filter(t => !t.completed);
  const urgentCount = calendarEvents.filter(e => e.isDeadline).length;
  const onlineDevicesCount = devices.filter(d => d.status === 'online').length;
  
  const getDeviceIcon = (type: SyncDevice['type']) => {
    switch (type) {
      case 'iphone': return <Smartphone size={14} className="text-blue-500" />;
      case 'macbook': return <Laptop size={14} className="text-blue-500" />;
      case 'ipad': return <Tablet size={14} className="text-blue-500" />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            key="success-toast"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 16 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-md text-xs font-semibold flex items-center gap-2 border border-slate-800"
          >
            <CheckCircle2 size={14} className="text-emerald-400" />
            {successMsg}
          </motion.div>
        )}
        
        {errorMsg && (
          <motion.div
            key="error-toast"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 16 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-4 py-2.5 rounded-lg shadow-md text-xs font-semibold flex items-center gap-2"
          >
            <AlertCircle size={14} />
            {errorMsg}
            <button onClick={() => setErrorMsg(null)} className="ml-2 hover:underline cursor-pointer">dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header / Navigation Bar */}
      <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sm:px-8 shrink-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-xs">
              <div className="w-4 h-4 bg-white rounded-sm rotate-45"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-slate-800">FlowAI</span>
              <span className="text-[9px] font-mono font-semibold text-blue-600 tracking-wider uppercase">Auto-Scheduler</span>
            </div>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-medium text-slate-500">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`py-5 transition-all cursor-pointer ${activeTab === 'dashboard' ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' : 'hover:text-slate-800'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('tasks')} 
              className={`py-5 transition-all cursor-pointer ${activeTab === 'tasks' ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' : 'hover:text-slate-800'}`}
            >
              My Tasks
            </button>
            <button 
              onClick={() => setActiveTab('calendar')} 
              className={`py-5 transition-all cursor-pointer ${activeTab === 'calendar' ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' : 'hover:text-slate-800'}`}
            >
              Calendar
            </button>
            <button 
              onClick={() => setActiveTab('automations')} 
              className={`py-5 transition-all cursor-pointer ${activeTab === 'automations' ? 'text-blue-600 border-b-2 border-blue-600 font-semibold' : 'hover:text-slate-800'}`}
            >
              Automations
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
            Synced: {onlineDevicesCount} / {devices.length} Devices
          </div>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-600">{user.email}</span>
              <button onClick={logout} className="text-xs font-medium text-red-600 hover:text-red-700 cursor-pointer">Log out</button>
            </div>
          ) : (
            <button onClick={signIn} className="text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer">Sign in</button>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      {authLoading ? (
        <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
          <div className="flex flex-col items-center">
            <RefreshCw className="animate-spin text-blue-600 mb-4" size={32} />
            <p className="text-slate-500 font-medium">Checking authentication...</p>
          </div>
        </div>
      ) : !user ? (
        <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md w-full">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Lock size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Welcome to FlowAI</h2>
            <p className="text-sm text-slate-500 mb-6">Sign in to sync your tasks, schedule events, and access the AI Auto-Scheduler across all your devices.</p>
            <button onClick={signIn} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors cursor-pointer">
              Continue with Google
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar: AI Insights Lab */}
        <aside className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">AI Productivity Lab</h2>
              <button 
                onClick={handleGenerateAIInsights}
                disabled={generatingInsight}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={12} className={generatingInsight ? 'animate-spin' : ''} />
                Recalculate
              </button>
            </div>

            {generatingInsight ? (
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-4 text-center">
                <BrainCircuit size={28} className="text-blue-600 mx-auto mb-2 animate-bounce" />
                <p className="text-xs font-semibold text-blue-900">Gemini prioritizing deadlines...</p>
                <p className="text-[10px] text-blue-700/70 mt-1">Arranging optimum focus intervals</p>
              </div>
            ) : insight ? (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-1 text-xs font-bold text-blue-800 mb-1.5">
                  <Sparkles size={13} />
                  <span>AI Co-Pilot Optimizer</span>
                </div>
                <p className="text-xs text-blue-950 leading-relaxed font-medium">
                  {insight.summary}
                </p>
                <div className="mt-3 text-[10px] text-blue-500 font-mono text-right">
                  Updated: {new Date(insight.generatedAt).toLocaleTimeString()}
                </div>
              </div>
            ) : null}

            {/* Micro analytics stats widget */}
            <div className="space-y-3">
              <div className="p-3.5 border border-slate-150 bg-slate-50/50 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Task Completion Rate</div>
                  <div className="text-lg font-bold text-slate-800 mt-0.5">
                    +{Math.min(100, Math.max(10, 100 - activeTasks.length * 10))}% 
                    <span className="text-emerald-600 text-xs font-semibold ml-1.5">vs last week</span>
                  </div>
                </div>
                <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 border border-emerald-100">
                  <TrendingUp size={16} />
                </div>
              </div>
              
              <div className="p-3.5 border border-slate-150 bg-slate-50/50 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Personal Focus Score</div>
                  <div className="text-lg font-bold text-slate-800 mt-0.5">{insight?.focusScore || 85} / 100</div>
                </div>
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 border border-blue-100 font-mono font-bold text-xs">
                  {insight?.focusScore || 85}
                </div>
              </div>
            </div>
          </div>

          {/* Sync Devices Log Panel */}
          <div className="border-t border-slate-200 pt-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3.5">Device Synchronization</h3>
            <div className="space-y-2.5">
              {devices.map(dev => (
                <div key={dev.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/30">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 bg-slate-100 rounded-md">
                      {getDeviceIcon(dev.type)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{dev.name}</p>
                      <p className="text-[9px] text-slate-400 font-mono">
                        {dev.status === 'online' 
                          ? `Sync active • ${new Date(dev.lastActive).toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit', second:'2-digit'})}` 
                          : 'Disconnected'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTriggerDeviceSync(dev.id)}
                    className={`px-2 py-1 text-[9px] font-bold tracking-tight rounded-md transition-all cursor-pointer ${
                      dev.status === 'online' 
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' 
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100'
                    }`}
                  >
                    Sync
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SaaS trial membership box */}
          {subscription && (
            <div className="mt-auto pt-4 border-t border-slate-200">
              <div className="bg-slate-900 rounded-xl p-5 text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-16 h-16 bg-blue-600 rounded-full opacity-35 blur-xl"></div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-blue-400 uppercase tracking-wider font-bold">Pro Trial Membership</span>
                  <span className="text-[10px] text-slate-400 font-mono bg-white/10 px-1.5 py-0.5 rounded">US Plan</span>
                </div>
                
                {subscription.plan === 'free_trial' ? (
                  <>
                    <h3 className="text-sm font-bold mb-1">
                      {Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / (1000 * 3600 * 24))} Days Remaining
                    </h3>
                    <p className="text-[11px] text-slate-300 mb-4 font-mono leading-tight">
                      Used {subscription.aiInsightsUsed}/{subscription.aiInsightsLimit} AI schedule prioritisations
                    </p>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={handleUpgradeSubscription}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Unlock Premium
                      </button>
                      <button 
                        onClick={handleResetSubscription}
                        title="Dev Reset Counter"
                        className="p-2 bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg text-xs"
                      >
                        Reset
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-sm font-bold mb-1 text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck size={14} />
                      Active Premium Subscription
                    </h3>
                    <p className="text-[11px] text-slate-300 mb-4 font-mono leading-tight">
                      Unlimited AI runs unlocked • Auto-syncing calendar bridge enabled
                    </p>
                    <button 
                      onClick={handleResetSubscription}
                      className="w-full py-1.5 bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Downgrade to Trial Demo
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Main Dashboard Area */}
        <main className="flex-1 p-6 sm:p-8 flex flex-col gap-8 overflow-y-auto">
          {/* Welcome Dashboard Header */}
          <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">Welcome back, Alex.</h1>
              <p className="text-slate-500 mt-1">
                You have <span className="text-blue-600 font-semibold">{activeTasks.length} active tasks</span> and <span className="text-red-500 font-semibold">{urgentCount} urgent deadlines</span> today.
              </p>
            </div>
            <div className="text-right border-l-2 border-slate-200 pl-4 sm:border-l-0 sm:pl-0">
              <p className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">
                {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800 font-mono tracking-tight mt-0.5">
                {currentTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>
          </header>

          {/* Dual Column Layout: Tasks & Calendar */}
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            <TaskManager 
              tasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              isPro={subscription?.plan === 'pro'}
            />

            <CalendarTimeline 
              events={calendarEvents}
              tasks={tasks}
              onAddEvent={handleAddEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          </section>

          {/* Timeline Optimizer Module */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="timeline-optimizer-section">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <BrainCircuit size={16} className="text-blue-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Timeline Optimizer</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                  AI Prioritized
                </span>
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                  Synced Across Devices
                </span>
              </div>
            </div>

            <div className="p-6">
              {insight && insight.schedulePlan && insight.schedulePlan.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {insight.schedulePlan.map((slot, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-150 flex flex-col justify-between h-full hover:border-blue-300 hover:bg-blue-50/10 transition-all">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-blue-600 font-mono bg-blue-100/60 px-2 py-0.5 rounded">
                            {slot.time}
                          </span>
                          <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">
                            Slot {idx + 1}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800 line-clamp-2">{slot.taskTitle}</h4>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs text-slate-600 italic">
                        {slot.reason}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500">
                  <p className="text-sm font-medium">No schedule plan active yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Press "Recalculate" in the AI Productivity Lab sidebar to generate slot priorities.</p>
                </div>
              )}

              {/* Startup Productivity tips section */}
              {insight && insight.tips && insight.tips.length > 0 && (
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Daily Startup Coaching Hacks</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {insight.tips.map((tip, idx) => (
                      <div key={idx} className="flex gap-3 items-start bg-blue-50/20 border border-blue-100/30 p-3 rounded-lg text-xs text-slate-700 leading-relaxed font-medium">
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <p>{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Feature Highlights Bar */}
          <footer className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-auto">
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 border border-blue-100">
                <Calendar size={20} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Calendar Bridge</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Auto-syncs GCal & US calendars</div>
              </div>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 border border-amber-100">
                <Zap size={20} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Quick Automate</div>
                <div className="text-[10px] text-slate-500 mt-0.5">24 active workflows running offline</div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 border border-emerald-100">
                <Lock size={20} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Bank-Level Security</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-mono">256-bit AES end-to-end sync</div>
              </div>
            </div>
          </footer>
        </main>
      </div>
      )}
    </div>
  );
}
