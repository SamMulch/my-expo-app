import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';


export const applications = sqliteTable('applications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  company: text('company').notNull(),
  role: text('role').notNull(),
  dateApplied: text('date_applied').notNull(),
  applicationCount: integer('application_count').notNull().default(1),
  categoryId: integer('category_id').notNull(),
  currentStatus: text('current_status').notNull().default('Applied'),
  location: text('location'),
  extraContext: text('extra_context'),
});


export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  colour: text('colour').notNull(),
  icon: text('icon').notNull(),
});


export const applicationStatusLogs = sqliteTable('application_status_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  applicationId: integer('application_id').notNull(),
  status: text('status').notNull(),
  changedAt: text('changed_at').notNull(),
  notes: text('notes'),
});

export const targets = sqliteTable('targets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  timespan: text('timespan').notNull(),
  targetCount: integer('target_count').notNull(),
  categoryId: integer('category_id'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
});

// adding in now for user auth
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  createdAt: text('created_at').notNull(),
});