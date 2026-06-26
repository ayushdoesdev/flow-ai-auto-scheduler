/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  durationMinutes: number;
  dueDate?: string; // ISO date format
  category: string;
  aiRank?: number; // Order calculated by AI
  reasoning?: string; // AI rationale for priority
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO date-time
  end: string; // ISO date-time
  isDeadline: boolean;
  associatedTaskId?: string;
  urgencyScore: number; // 1-10
}

export interface UserSubscription {
  plan: 'free_trial' | 'pro';
  trialStartedAt: string;
  trialEndsAt: string;
  isPaid: boolean;
  aiInsightsUsed: number;
  aiInsightsLimit: number;
}

export interface ScheduledSlot {
  time: string; // e.g. "09:00 AM"
  taskId: string;
  taskTitle: string;
  reason: string;
}

export interface ProductivityInsight {
  summary: string;
  doThisNowTaskId?: string;
  schedulePlan: ScheduledSlot[];
  tips: string[];
  focusScore: number; // 0-100
  generatedAt: string;
}

export interface SyncDevice {
  id: string;
  name: string;
  type: 'iphone' | 'macbook' | 'ipad';
  lastActive: string;
  status: 'online' | 'offline';
}
