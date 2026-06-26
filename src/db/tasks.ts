import { db } from './index.ts';
import { tasks } from './schema.ts';
import { eq, and } from 'drizzle-orm';
import { Task } from '../types.js';

export async function getTasks(userId: number): Promise<Task[]> {
  try {
    const result = await db.select().from(tasks).where(eq(tasks.userId, userId));
    return result as any;
  } catch (error) {
    throw new Error("Failed to fetch tasks.", { cause: error });
  }
}

export async function createTask(userId: number, task: Partial<Task>): Promise<Task> {
  try {
    const result = await db.insert(tasks).values({
      id: Math.random().toString(36).substring(2, 11),
      userId,
      title: task.title!,
      completed: task.completed || false,
      priority: task.priority!,
      durationMinutes: task.durationMinutes!,
      dueDate: task.dueDate,
      category: task.category!,
      aiRank: task.aiRank,
      reasoning: task.reasoning,
    }).returning();
    return result[0] as any;
  } catch (error) {
    throw new Error("Failed to create task.", { cause: error });
  }
}

export async function updateTask(userId: number, id: string, updates: Partial<Task>): Promise<Task> {
  try {
    const result = await db.update(tasks)
      .set(updates)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    return result[0] as any;
  } catch (error) {
    throw new Error("Failed to update task.", { cause: error });
  }
}

export async function deleteTask(userId: number, id: string): Promise<void> {
  try {
    await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
  } catch (error) {
    throw new Error("Failed to delete task.", { cause: error });
  }
}
