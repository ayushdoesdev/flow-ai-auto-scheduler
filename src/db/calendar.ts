import { db } from './index.ts';
import { calendarEvents } from './schema.ts';
import { eq, and } from 'drizzle-orm';
import { CalendarEvent } from '../types.js';

export async function getCalendarEvents(userId: number): Promise<CalendarEvent[]> {
  try {
    const result = await db.select().from(calendarEvents).where(eq(calendarEvents.userId, userId));
    return result as any;
  } catch (error) {
    throw new Error("Failed to fetch calendar events.", { cause: error });
  }
}

export async function createCalendarEvent(userId: number, event: Partial<CalendarEvent>): Promise<CalendarEvent> {
  try {
    const result = await db.insert(calendarEvents).values({
      id: Math.random().toString(36).substring(2, 11),
      userId,
      title: event.title!,
      start: event.start!,
      end: event.end!,
      isDeadline: event.isDeadline || false,
      associatedTaskId: event.associatedTaskId,
      urgencyScore: event.urgencyScore!,
    }).returning();
    return result[0] as any;
  } catch (error) {
    throw new Error("Failed to create calendar event.", { cause: error });
  }
}
