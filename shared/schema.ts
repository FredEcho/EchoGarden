import { sql } from 'drizzle-orm';
import {
  index,
  pgTable,
  text,
  integer,
  real,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import {
  sqliteTable,
  sqliteText,
  sqliteInteger,
  sqliteReal,
  sqliteTimestamp,
  sqliteBoolean,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(),
    expire: integer("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  passwordHash: text("password_hash"), // For local authentication
  xp: integer("xp").default(0), // Experience points
  level: integer("level").default(1), // User level
  totalHelpProvided: integer("total_help_provided").default(0), // Total helpful responses
  totalHelpReceived: integer("total_help_received").default(0), // Total help requests resolved
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Help request categories
export const categories = pgTable("categories", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  color: text("color").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Help requests ("Echoes")
export const helpRequests = pgTable("help_requests", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id),
  categoryId: text("category_id").notNull().references(() => categories.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  tags: text("tags"),
  isResolved: boolean("is_resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Help responses
export const helpResponses = pgTable("help_responses", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  helpRequestId: text("help_request_id").notNull().references(() => helpRequests.id),
  userId: text("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isMarkedHelpful: boolean("is_marked_helpful").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Garden items (seeds, plants, etc.)
export const gardenItems = pgTable("garden_items", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id),
  helpResponseId: text("help_response_id").references(() => helpResponses.id),
  type: text("type").notNull(), // seed, sprout, plant, tree, flower
  growth: integer("growth").default(0), // 0-100
  isGrown: boolean("is_grown").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pay-it-forward tracking
export const payItForward = pgTable("pay_it_forward", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  helperId: text("helper_id").notNull().references(() => users.id),
  helpedUserId: text("helped_user_id").notNull().references(() => users.id),
  originalHelpRequestId: text("original_help_request_id").notNull().references(() => helpRequests.id),
  forwardHelpRequestId: text("forward_help_request_id").references(() => helpRequests.id),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
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
