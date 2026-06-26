import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  completed: boolean('completed').default(false).notNull(),
  priority: varchar('priority', { length: 20 }).notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  dueDate: text('due_date'),
  category: text('category').notNull(),
  aiRank: integer('ai_rank'),
  reasoning: text('reasoning'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const calendarEvents = pgTable('calendar_events', {
  id: text('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  start: text('start').notNull(),
  end: text('end').notNull(),
  isDeadline: boolean('is_deadline').default(false).notNull(),
  associatedTaskId: text('associated_task_id'),
  urgencyScore: integer('urgency_score').notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  calendarEvents: many(calendarEvents),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
  user: one(users, {
    fields: [calendarEvents.userId],
    references: [users.id],
  }),
}));
