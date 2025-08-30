import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Help request categories
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  color: varchar("color").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Help requests ("Echoes")
export const helpRequests = pgTable("help_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  categoryId: varchar("category_id").notNull().references(() => categories.id),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  tags: text("tags").array(),
  isResolved: boolean("is_resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Help responses
export const helpResponses = pgTable("help_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  helpRequestId: varchar("help_request_id").notNull().references(() => helpRequests.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isMarkedHelpful: boolean("is_marked_helpful").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Garden items (seeds, plants, etc.)
export const gardenItems = pgTable("garden_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  helpResponseId: varchar("help_response_id").references(() => helpResponses.id),
  type: varchar("type").notNull(), // seed, sprout, plant, tree, flower
  growth: integer("growth").default(0), // 0-100
  isGrown: boolean("is_grown").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pay-it-forward tracking
export const payItForward = pgTable("pay_it_forward", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  helperId: varchar("helper_id").notNull().references(() => users.id),
  helpedUserId: varchar("helped_user_id").notNull().references(() => users.id),
  originalHelpRequestId: varchar("original_help_request_id").notNull().references(() => helpRequests.id),
  forwardHelpRequestId: varchar("forward_help_request_id").references(() => helpRequests.id),
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
