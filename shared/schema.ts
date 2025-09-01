import { sql } from 'drizzle-orm';
import {
  index,
  sqliteTable,
  text,
  integer,
  real,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(),
    expire: integer("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  passwordHash: text("password_hash"), // For local authentication
  xp: integer("xp").default(0), // Experience points
  level: integer("level").default(1), // User level
  totalHelpProvided: integer("total_help_provided").default(0), // Total helpful responses
  totalHelpReceived: integer("total_help_received").default(0), // Total help requests resolved
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

// Help request categories
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull(),
  createdAt: text("created_at"),
});

// Help requests ("Echoes")
export const helpRequests = sqliteTable("help_requests", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  categoryId: text("category_id").notNull().references(() => categories.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  tags: text("tags"),
  isResolved: integer("is_resolved").default(0),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

// Help responses
export const helpResponses = sqliteTable("help_responses", {
  id: text("id").primaryKey(),
  helpRequestId: text("help_request_id").notNull().references(() => helpRequests.id),
  userId: text("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isMarkedHelpful: integer("is_marked_helpful").default(0),
  helpfulCount: integer("helpful_count").default(0), // Count of helpful marks
  createdAt: text("created_at"),
});

// Garden items (seeds, plants, etc.)
export const gardenItems = sqliteTable("garden_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  helpResponseId: text("help_response_id").references(() => helpResponses.id),
  type: text("type").notNull(), // seed, sprout, plant, tree, flower
  growth: integer("growth").default(0), // 0-100
  isGrown: integer("is_grown").default(0),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

// Pay-it-forward tracking
export const payItForward = sqliteTable("pay_it_forward", {
  id: text("id").primaryKey(),
  helperId: text("helper_id").notNull().references(() => users.id),
  helpedUserId: text("helped_user_id").notNull().references(() => users.id),
  originalHelpRequestId: text("original_help_request_id").notNull().references(() => helpRequests.id),
  forwardHelpRequestId: text("forward_help_request_id").references(() => helpRequests.id),
  isCompleted: integer("is_completed").default(0),
  createdAt: text("created_at"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  helpRequests: many(helpRequests),
  helpResponses: many(helpResponses),
  gardenItems: many(gardenItems),
  helpedUsers: many(payItForward, { relationName: "helper" }),
  helpFromUsers: many(payItForward, { relationName: "helped" }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  helpRequests: many(helpRequests),
}));

export const helpRequestsRelations = relations(helpRequests, ({ one, many }) => ({
  user: one(users, {
    fields: [helpRequests.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [helpRequests.categoryId],
    references: [categories.id],
  }),
  responses: many(helpResponses),
  payItForwardOriginal: many(payItForward, { relationName: "original" }),
  payItForwardForward: many(payItForward, { relationName: "forward" }),
}));

export const helpResponsesRelations = relations(helpResponses, ({ one, many }) => ({
  helpRequest: one(helpRequests, {
    fields: [helpResponses.helpRequestId],
    references: [helpRequests.id],
  }),
  user: one(users, {
    fields: [helpResponses.userId],
    references: [users.id],
  }),
  gardenItems: many(gardenItems),
}));

export const gardenItemsRelations = relations(gardenItems, ({ one }) => ({
  user: one(users, {
    fields: [gardenItems.userId],
    references: [users.id],
  }),
  helpResponse: one(helpResponses, {
    fields: [gardenItems.helpResponseId],
    references: [helpResponses.id],
  }),
}));

export const payItForwardRelations = relations(payItForward, ({ one }) => ({
  helper: one(users, {
    fields: [payItForward.helperId],
    references: [users.id],
    relationName: "helper",
  }),
  helpedUser: one(users, {
    fields: [payItForward.helpedUserId],
    references: [users.id],
    relationName: "helped",
  }),
  originalHelpRequest: one(helpRequests, {
    fields: [payItForward.originalHelpRequestId],
    references: [helpRequests.id],
    relationName: "original",
  }),
  forwardHelpRequest: one(helpRequests, {
    fields: [payItForward.forwardHelpRequestId],
    references: [helpRequests.id],
    relationName: "forward",
  }),
}));

// Schemas for validation
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertHelpRequestSchema = createInsertSchema(helpRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHelpResponseSchema = createInsertSchema(helpResponses).omit({
  id: true,
  createdAt: true,
});

export const insertGardenItemSchema = createInsertSchema(gardenItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type HelpRequest = typeof helpRequests.$inferSelect;
export type InsertHelpRequest = z.infer<typeof insertHelpRequestSchema>;
export type HelpResponse = typeof helpResponses.$inferSelect;
export type InsertHelpResponse = z.infer<typeof insertHelpResponseSchema>;
export type GardenItem = typeof gardenItems.$inferSelect;
export type InsertGardenItem = z.infer<typeof insertGardenItemSchema>;
export type PayItForward = typeof payItForward.$inferSelect;
