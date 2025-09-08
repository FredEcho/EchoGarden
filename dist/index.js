var __defProp = Object.defineProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import { config as config2 } from "dotenv";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  categories: () => categories,
  categoriesRelations: () => categoriesRelations,
  gardenItems: () => gardenItems,
  gardenItemsRelations: () => gardenItemsRelations,
  helpRequests: () => helpRequests,
  helpRequestsRelations: () => helpRequestsRelations,
  helpResponses: () => helpResponses,
  helpResponsesRelations: () => helpResponsesRelations,
  insertCategorySchema: () => insertCategorySchema,
  insertGardenItemSchema: () => insertGardenItemSchema,
  insertHelpRequestSchema: () => insertHelpRequestSchema,
  insertHelpResponseSchema: () => insertHelpResponseSchema,
  payItForward: () => payItForward,
  payItForwardRelations: () => payItForwardRelations,
  sessions: () => sessions,
  users: () => users,
  usersRelations: () => usersRelations
});
import {
  index,
  sqliteTable,
  text,
  integer
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(),
    expire: integer("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  passwordHash: text("password_hash"),
  // For local authentication
  xp: integer("xp").default(0),
  // Experience points
  level: integer("level").default(1),
  // User level
  totalHelpProvided: integer("total_help_provided").default(0),
  // Total helpful responses
  totalHelpReceived: integer("total_help_received").default(0),
  // Total help requests resolved
  createdAt: text("created_at"),
  updatedAt: text("updated_at")
}, (table) => [
  index("IDX_users_created_at").on(table.createdAt)
]);
var categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull(),
  createdAt: text("created_at")
});
var helpRequests = sqliteTable("help_requests", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  categoryId: text("category_id").notNull().references(() => categories.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  tags: text("tags"),
  isResolved: integer("is_resolved").default(0),
  createdAt: text("created_at"),
  updatedAt: text("updated_at")
}, (table) => [
  index("IDX_help_requests_created_at").on(table.createdAt),
  index("IDX_help_requests_category_id").on(table.categoryId),
  index("IDX_help_requests_user_id").on(table.userId),
  index("IDX_help_requests_is_resolved").on(table.isResolved)
]);
var helpResponses = sqliteTable("help_responses", {
  id: text("id").primaryKey(),
  helpRequestId: text("help_request_id").notNull().references(() => helpRequests.id),
  userId: text("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isMarkedHelpful: integer("is_marked_helpful").default(0),
  helpfulCount: integer("helpful_count").default(0),
  // Count of helpful marks
  createdAt: text("created_at")
}, (table) => [
  index("IDX_help_responses_help_request_id").on(table.helpRequestId),
  index("IDX_help_responses_user_id").on(table.userId),
  index("IDX_help_responses_created_at").on(table.createdAt),
  index("IDX_help_responses_is_marked_helpful").on(table.isMarkedHelpful)
]);
var gardenItems = sqliteTable("garden_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  helpResponseId: text("help_response_id").references(() => helpResponses.id),
  type: text("type").notNull(),
  // seed, sprout, plant, tree, flower
  growth: integer("growth").default(0),
  // 0-100
  isGrown: integer("is_grown").default(0),
  createdAt: text("created_at"),
  updatedAt: text("updated_at")
}, (table) => [
  index("IDX_garden_items_user_id").on(table.userId),
  index("IDX_garden_items_help_response_id").on(table.helpResponseId),
  index("IDX_garden_items_created_at").on(table.createdAt),
  index("IDX_garden_items_is_grown").on(table.isGrown),
  index("IDX_garden_items_type").on(table.type)
]);
var payItForward = sqliteTable("pay_it_forward", {
  id: text("id").primaryKey(),
  helperId: text("helper_id").notNull().references(() => users.id),
  helpedUserId: text("helped_user_id").notNull().references(() => users.id),
  originalHelpRequestId: text("original_help_request_id").notNull().references(() => helpRequests.id),
  forwardHelpRequestId: text("forward_help_request_id").references(() => helpRequests.id),
  isCompleted: integer("is_completed").default(0),
  createdAt: text("created_at")
}, (table) => [
  index("IDX_pay_it_forward_helper_id").on(table.helperId),
  index("IDX_pay_it_forward_helped_user_id").on(table.helpedUserId),
  index("IDX_pay_it_forward_original_help_request_id").on(table.originalHelpRequestId),
  index("IDX_pay_it_forward_is_completed").on(table.isCompleted),
  index("IDX_pay_it_forward_created_at").on(table.createdAt)
]);
var usersRelations = relations(users, ({ many }) => ({
  helpRequests: many(helpRequests),
  helpResponses: many(helpResponses),
  gardenItems: many(gardenItems),
  helpedUsers: many(payItForward, { relationName: "helper" }),
  helpFromUsers: many(payItForward, { relationName: "helped" })
}));
var categoriesRelations = relations(categories, ({ many }) => ({
  helpRequests: many(helpRequests)
}));
var helpRequestsRelations = relations(helpRequests, ({ one, many }) => ({
  user: one(users, {
    fields: [helpRequests.userId],
    references: [users.id]
  }),
  category: one(categories, {
    fields: [helpRequests.categoryId],
    references: [categories.id]
  }),
  responses: many(helpResponses),
  payItForwardOriginal: many(payItForward, { relationName: "original" }),
  payItForwardForward: many(payItForward, { relationName: "forward" })
}));
var helpResponsesRelations = relations(helpResponses, ({ one, many }) => ({
  helpRequest: one(helpRequests, {
    fields: [helpResponses.helpRequestId],
    references: [helpRequests.id]
  }),
  user: one(users, {
    fields: [helpResponses.userId],
    references: [users.id]
  }),
  gardenItems: many(gardenItems)
}));
var gardenItemsRelations = relations(gardenItems, ({ one }) => ({
  user: one(users, {
    fields: [gardenItems.userId],
    references: [users.id]
  }),
  helpResponse: one(helpResponses, {
    fields: [gardenItems.helpResponseId],
    references: [helpResponses.id]
  })
}));
var payItForwardRelations = relations(payItForward, ({ one }) => ({
  helper: one(users, {
    fields: [payItForward.helperId],
    references: [users.id],
    relationName: "helper"
  }),
  helpedUser: one(users, {
    fields: [payItForward.helpedUserId],
    references: [users.id],
    relationName: "helped"
  }),
  originalHelpRequest: one(helpRequests, {
    fields: [payItForward.originalHelpRequestId],
    references: [helpRequests.id],
    relationName: "original"
  }),
  forwardHelpRequest: one(helpRequests, {
    fields: [payItForward.forwardHelpRequestId],
    references: [helpRequests.id],
    relationName: "forward"
  })
}));
var insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true
});
var insertHelpRequestSchema = createInsertSchema(helpRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertHelpResponseSchema = createInsertSchema(helpResponses).omit({
  id: true,
  createdAt: true
});
var insertGardenItemSchema = createInsertSchema(gardenItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// server/db.ts
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import Database from "better-sqlite3";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
config();
var db;
var pool;
if (process.env.DATABASE_URL?.startsWith("postgresql://")) {
  const sql2 = postgres(process.env.DATABASE_URL);
  db = drizzlePg(sql2, { schema: schema_exports });
  pool = sql2;
} else {
  const dbPath = process.env.DATABASE_URL?.startsWith("file:") ? process.env.DATABASE_URL.replace("file:", "") : "./dev.db";
  const sqlite = new Database(dbPath);
  try {
    sqlite.function("now", () => (/* @__PURE__ */ new Date()).toISOString());
    sqlite.function("gen_random_uuid", () => {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
        return v.toString(16);
      });
    });
  } catch {
  }
  try {
    sqlite.pragma("foreign_keys = ON");
    sqlite.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  profile_image_url TEXT,
  password_hash TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  total_help_provided INTEGER DEFAULT 0,
  total_help_received INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  sid TEXT PRIMARY KEY,
  sess TEXT NOT NULL,
  expire INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS help_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT,
  is_resolved BOOLEAN DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS help_responses (
  id TEXT PRIMARY KEY,
  help_request_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  is_marked_helpful BOOLEAN DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS garden_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  help_response_id TEXT,
  type TEXT NOT NULL,
  growth INTEGER DEFAULT 0,
  is_grown BOOLEAN DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pay_it_forward (
  id TEXT PRIMARY KEY,
  helper_id TEXT NOT NULL,
  helped_user_id TEXT NOT NULL,
  original_help_request_id TEXT NOT NULL,
  forward_help_request_id TEXT,
  is_completed BOOLEAN DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
`);
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error("SQLite schema initialization error:", e);
    }
  }
  db = drizzle(sqlite, { schema: schema_exports });
  initializeDefaultUser();
  pool = void 0;
}
async function initializeDefaultUser() {
  try {
    const existingUsers = await db.select().from(users);
    if (existingUsers.length === 0) {
      console.log("\u{1F510} Creating default user account...");
      const defaultUser = {
        id: nanoid(),
        email: "admin@echogarden.local",
        firstName: "Admin",
        lastName: "User",
        passwordHash: await bcrypt.hash("admin123", 10),
        xp: 0,
        level: 1,
        totalHelpProvided: 0,
        totalHelpReceived: 0,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      await db.insert(users).values(defaultUser);
      console.log("\u2705 Default user created!");
      console.log("   Email: admin@echogarden.local");
      console.log("   Password: admin123");
      console.log("   (You can change this later in the app)");
    }
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error("Default user creation error:", e);
    }
  }
}

// server/storage.ts
import { nanoid as nanoid2 } from "nanoid";
import { eq, desc, count, and, sql } from "drizzle-orm";

// shared/leveling.ts
var XP_PER_LEVEL = [
  0,
  // Level 1 (starting)
  100,
  // Level 2
  250,
  // Level 3
  450,
  // Level 4
  700,
  // Level 5
  1e3,
  // Level 6
  1350,
  // Level 7
  1750,
  // Level 8
  2200,
  // Level 9
  2700,
  // Level 10
  3250,
  // Level 11
  3850,
  // Level 12
  4500,
  // Level 13
  5200,
  // Level 14
  5950,
  // Level 15
  6750,
  // Level 16
  7600,
  // Level 17
  8500,
  // Level 18
  9450,
  // Level 19
  10450,
  // Level 20
  11500,
  // Level 21
  12600,
  // Level 22
  13750,
  // Level 23
  14950,
  // Level 24
  16200,
  // Level 25
  17500,
  // Level 26
  18850,
  // Level 27
  20250,
  // Level 28
  21700,
  // Level 29
  23200
  // Level 30
];
var XP_REWARDS = {
  POST_HELP_REQUEST: 10,
  // Posting a help request
  PROVIDE_HELPFUL_RESPONSE: 25,
  // Providing a response
  RESPONSE_MARKED_HELPFUL: 50,
  // Response marked as helpful
  RESOLVE_HELP_REQUEST: 30,
  // Marking your request as resolved
  COMPLETE_PAY_IT_FORWARD: 75,
  // Completing pay-it-forward
  DAILY_LOGIN: 5,
  // Daily login bonus
  SEED_GROWS_TO_SPROUT: 15,
  // Seed grows to sprout
  SEED_GROWS_TO_PLANT: 25,
  // Seed grows to plant
  SEED_GROWS_TO_FLOWER: 50
  // Seed grows to flower
};
function calculateLevelInfo(xp) {
  let level = 1;
  let xpRequired = 0;
  for (let i = 0; i < XP_PER_LEVEL.length; i++) {
    if (xp >= XP_PER_LEVEL[i]) {
      level = i + 1;
      xpRequired = XP_PER_LEVEL[i];
    } else {
      break;
    }
  }
  if (level >= XP_PER_LEVEL.length) {
    return {
      level: XP_PER_LEVEL.length,
      xpRequired: XP_PER_LEVEL[XP_PER_LEVEL.length - 1],
      xpForNextLevel: XP_PER_LEVEL[XP_PER_LEVEL.length - 1],
      progress: 100
    };
  }
  const xpForNextLevel = XP_PER_LEVEL[level];
  const xpInCurrentLevel = xp - xpRequired;
  const xpNeededForNextLevel = xpForNextLevel - xpRequired;
  const progress = xpNeededForNextLevel > 0 ? xpInCurrentLevel / xpNeededForNextLevel * 100 : 0;
  return {
    level,
    xpRequired,
    xpForNextLevel,
    progress: Math.min(Math.max(progress, 0), 100)
  };
}

// server/storage.ts
var DatabaseStorage = class {
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const id = userData.id ?? nanoid2();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const [user] = await db.insert(users).values({
      id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImageUrl: userData.profileImageUrl,
      passwordHash: userData.passwordHash,
      xp: userData.xp || 0,
      level: userData.level || 1,
      totalHelpProvided: userData.totalHelpProvided || 0,
      totalHelpReceived: userData.totalHelpReceived || 0,
      createdAt: now,
      updatedAt: now
    }).returning();
    return user;
  }
  // Category operations
  async getCategories() {
    return await db.select().from(categories);
  }
  async createCategory(category) {
    const id = nanoid2();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const [newCategory] = await db.insert(categories).values({
      id,
      name: category.name,
      color: category.color,
      createdAt: now
    }).returning();
    return newCategory;
  }
  // Help request operations
  async getHelpRequests(categoryId, searchQuery) {
    let query = db.select({
      id: helpRequests.id,
      userId: helpRequests.userId,
      categoryId: helpRequests.categoryId,
      title: helpRequests.title,
      description: helpRequests.description,
      tags: helpRequests.tags,
      isResolved: helpRequests.isResolved,
      createdAt: helpRequests.createdAt,
      updatedAt: helpRequests.updatedAt,
      user: users,
      category: categories,
      responseCount: count(helpResponses.id),
      viewCount: sql`0`
      // Cross-dialect safe placeholder for view count
    }).from(helpRequests).leftJoin(users, eq(helpRequests.userId, users.id)).leftJoin(categories, eq(helpRequests.categoryId, categories.id)).leftJoin(helpResponses, eq(helpRequests.id, helpResponses.helpRequestId)).groupBy(helpRequests.id, users.id, categories.id).orderBy(desc(helpRequests.createdAt));
    const conditions = [];
    if (categoryId) {
      conditions.push(eq(helpRequests.categoryId, categoryId));
    }
    if (searchQuery && searchQuery.trim()) {
      const searchTerm = `%${searchQuery.trim().toLowerCase()}%`;
      conditions.push(
        sql`(
          LOWER(${helpRequests.title}) LIKE ${searchTerm} OR 
          LOWER(${helpRequests.description}) LIKE ${searchTerm} OR 
          LOWER(${helpRequests.tags}) LIKE ${searchTerm} OR
          LOWER(${categories.name}) LIKE ${searchTerm}
        )`
      );
    }
    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }
    return await query;
  }
  async getHelpRequestById(id) {
    const [request] = await db.select().from(helpRequests).leftJoin(users, eq(helpRequests.userId, users.id)).leftJoin(categories, eq(helpRequests.categoryId, categories.id)).where(eq(helpRequests.id, id));
    if (!request) return void 0;
    const responses = await db.select({
      id: helpResponses.id,
      helpRequestId: helpResponses.helpRequestId,
      userId: helpResponses.userId,
      content: helpResponses.content,
      isMarkedHelpful: helpResponses.isMarkedHelpful,
      createdAt: helpResponses.createdAt,
      user: users
    }).from(helpResponses).leftJoin(users, eq(helpResponses.userId, users.id)).where(eq(helpResponses.helpRequestId, id)).orderBy(desc(helpResponses.createdAt));
    return {
      ...request.help_requests,
      user: request.users || null,
      category: request.categories || null,
      responses
    };
  }
  async createHelpRequest(request) {
    try {
      console.log("\u{1F331} Creating help request:", request);
      const id = nanoid2();
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const [newRequest] = await db.insert(helpRequests).values({
        id,
        userId: request.userId,
        categoryId: request.categoryId,
        title: request.title,
        description: request.description,
        tags: request.tags || null,
        isResolved: 0,
        createdAt: now,
        updatedAt: now
      }).returning();
      console.log("\u2705 Help request created successfully:", newRequest.id);
      try {
        await this.addXP(request.userId, XP_REWARDS.POST_HELP_REQUEST, "Posted help request");
        await db.update(users).set({
          totalHelpReceived: sql`${users.totalHelpReceived} + 1`,
          updatedAt: now
        }).where(eq(users.id, request.userId));
        console.log("\u{1F3AF} XP awarded and help received stats updated");
      } catch (xpError) {
        console.error("\u26A0\uFE0F Failed to award XP or update stats:", xpError);
      }
      return newRequest;
    } catch (error) {
      console.error("\u274C Failed to create help request:", error);
      console.error("Request data:", request);
      throw error;
    }
  }
  async updateHelpRequest(id, updates) {
    const [updated] = await db.update(helpRequests).set({ ...updates, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(eq(helpRequests.id, id)).returning();
    return updated;
  }
  async deleteHelpRequest(id, userId) {
    console.log("Storage: Deleting help request", { id, userId });
    const [request] = await db.select().from(helpRequests).where(eq(helpRequests.id, id));
    console.log("Storage: Found request", request);
    if (!request) {
      throw new Error("Help request not found");
    }
    if (request.userId !== userId) {
      throw new Error("Unauthorized: You can only delete your own help requests");
    }
    console.log("Storage: Authorization passed, getting responses...");
    const responses = await db.select().from(helpResponses).where(eq(helpResponses.helpRequestId, id));
    console.log("Storage: Found responses", responses.length);
    for (const response of responses) {
      console.log("Storage: Deleting garden items for response", response.id);
      await db.delete(gardenItems).where(eq(gardenItems.helpResponseId, response.id));
    }
    console.log("Storage: Garden items deleted, deleting responses...");
    await db.delete(helpResponses).where(eq(helpResponses.helpRequestId, id));
    console.log("Storage: Responses deleted, deleting help request...");
    await db.delete(helpRequests).where(eq(helpRequests.id, id));
    console.log("Storage: Help request deleted successfully");
  }
  // Help response operations
  async createHelpResponse(response) {
    const id = nanoid2();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const [newResponse] = await db.insert(helpResponses).values({
      id,
      helpRequestId: response.helpRequestId,
      userId: response.userId,
      content: response.content,
      isMarkedHelpful: 0,
      createdAt: now
    }).returning();
    await this.addXP(response.userId, XP_REWARDS.PROVIDE_HELPFUL_RESPONSE, "Provided helpful response");
    await db.update(users).set({
      totalHelpProvided: sql`${users.totalHelpProvided} + 1`,
      updatedAt: now
    }).where(eq(users.id, response.userId));
    const [helpRequest] = await db.select({
      categoryId: helpRequests.categoryId,
      category: categories
    }).from(helpRequests).leftJoin(categories, eq(helpRequests.categoryId, categories.id)).where(eq(helpRequests.id, response.helpRequestId));
    let seedType = "healing-seed";
    if (helpRequest?.category?.name) {
      switch (helpRequest.category.name) {
        case "Mental Health Support":
          seedType = "healing-seed";
          break;
        case "Study Help":
          seedType = "knowledge-seed";
          break;
        case "Career Advice":
          seedType = "success-seed";
          break;
        case "Life Skills":
          seedType = "wisdom-seed";
          break;
        case "Creative Feedback":
          seedType = "inspiration-seed";
          break;
        case "Tech Support":
          seedType = "innovation-seed";
          break;
      }
    }
    await this.createGardenItem({
      userId: response.userId,
      helpResponseId: newResponse.id,
      type: seedType,
      growth: 0
    });
    return newResponse;
  }
  async markResponseHelpful(responseId, helpRequestId) {
    const [currentResponse] = await db.select().from(helpResponses).where(eq(helpResponses.id, responseId));
    if (!currentResponse) {
      throw new Error("Response not found");
    }
    if (currentResponse.isMarkedHelpful) {
      return;
    }
    await db.update(helpResponses).set({
      isMarkedHelpful: 1,
      helpfulCount: (currentResponse.helpfulCount || 0) + 1
    }).where(eq(helpResponses.id, responseId));
    const [response] = await db.select().from(helpResponses).where(eq(helpResponses.id, responseId));
    if (response) {
      await this.addXP(response.userId, XP_REWARDS.RESPONSE_MARKED_HELPFUL, "Response marked as helpful");
      const [helpRequest] = await db.select({
        categoryId: helpRequests.categoryId,
        categoryName: categories.name
      }).from(helpRequests).leftJoin(categories, eq(helpRequests.categoryId, categories.id)).where(eq(helpRequests.id, helpRequestId));
      const [gardenItem] = await db.select().from(gardenItems).where(eq(gardenItems.helpResponseId, responseId));
      if (gardenItem && gardenItem.growth !== null) {
        const currentGrowth = gardenItem.growth || 0;
        const newGrowth = Math.min(currentGrowth + 50, 100);
        let newType = gardenItem.type;
        if (newGrowth >= 100) {
          newType = "flower";
        } else if (newGrowth >= 75) {
          newType = "plant";
        } else if (newGrowth >= 25) {
          newType = "sprout";
        }
        await this.updateGardenItem(gardenItem.id, {
          growth: newGrowth,
          type: newType,
          isGrown: newGrowth >= 100 ? 1 : 0
        });
      }
    }
  }
  // Garden operations
  async getUserGarden(userId) {
    const items = await db.select().from(gardenItems).where(eq(gardenItems.userId, userId)).orderBy(desc(gardenItems.createdAt));
    const now = /* @__PURE__ */ new Date();
    for (const item of items) {
      if (item.type.includes("seed") && item.growth < 25) {
        const createdAt = new Date(item.createdAt);
        const hoursPassed = (now.getTime() - createdAt.getTime()) / (1e3 * 60 * 60);
        if (hoursPassed >= 24 && item.growth < 25) {
          await this.updateGardenItem(item.id, {
            growth: 25,
            type: "sprout"
          });
        }
      }
    }
    return await db.select().from(gardenItems).where(eq(gardenItems.userId, userId)).orderBy(desc(gardenItems.createdAt));
  }
  async createGardenItem(item) {
    const id = nanoid2();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const [newItem] = await db.insert(gardenItems).values({
      id,
      userId: item.userId,
      helpResponseId: item.helpResponseId,
      type: item.type,
      growth: item.growth || 0,
      isGrown: item.isGrown || 0,
      createdAt: now,
      updatedAt: now
    }).returning();
    return newItem;
  }
  async updateGardenItem(id, updates) {
    const [updated] = await db.update(gardenItems).set({ ...updates, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(eq(gardenItems.id, id)).returning();
    return updated;
  }
  // Community stats
  async getCommunityStats() {
    const [activeGardeners] = await db.select({ count: count() }).from(users);
    const [seedsPlanted] = await db.select({ count: count() }).from(gardenItems);
    const [gardensBloomin] = await db.select({ count: count() }).from(gardenItems).where(eq(gardenItems.isGrown, 1));
    return {
      activeGardeners: activeGardeners.count,
      seedsPlanted: seedsPlanted.count,
      gardensBloomin: gardensBloomin.count
    };
  }
  // XP and Leveling operations
  async addXP(userId, xpAmount, reason) {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const currentXP = user.xp || 0;
    const currentLevel = user.level || 1;
    const newXP = currentXP + xpAmount;
    const levelInfo = calculateLevelInfo(newXP);
    const newLevel = levelInfo.level;
    const leveledUp = newLevel > currentLevel;
    await db.update(users).set({
      xp: newXP,
      level: newLevel,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }).where(eq(users.id, userId));
    console.log(`\u{1F3AF} User ${userId} gained ${xpAmount} XP (${reason}). New total: ${newXP} XP, Level ${newLevel}${leveledUp ? " (LEVELED UP!)" : ""}`);
    return { newXP, newLevel, leveledUp };
  }
  async getUserStats(userId) {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return {
      xp: user.xp || 0,
      level: user.level || 1,
      totalHelpProvided: user.totalHelpProvided || 0,
      totalHelpReceived: user.totalHelpReceived || 0
    };
  }
};
var storage = new DatabaseStorage();

// server/localAuth.ts
import passport from "passport";
import session from "express-session";
import bcrypt2 from "bcryptjs";
import { nanoid as nanoid3 } from "nanoid";
import { eq as eq2 } from "drizzle-orm";
import LocalStrategy from "passport-local";
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  let store;
  if (process.env.DATABASE_URL?.startsWith("postgresql://")) {
    try {
      const connectPg = __require("connect-pg-simple");
      const PostgresStore = connectPg(session);
      store = new PostgresStore({
        conObject: {
          connectionString: process.env.DATABASE_URL
        },
        tableName: "sessions",
        createTableIfMissing: true
      });
    } catch (error) {
      console.warn("PostgreSQL session store not available, using memory store:", error.message);
    }
  }
  return session({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
      sameSite: "lax"
    }
  });
}
passport.use(new LocalStrategy.Strategy(
  {
    usernameField: "email",
    passwordField: "password"
  },
  async (email, password, done) => {
    try {
      const [user] = await db.select().from(users).where(eq2(users.email, email));
      if (!user) {
        return done(null, false, { message: "Incorrect email." });
      }
      if (!user.passwordHash) {
        return done(null, user);
      }
      const isValidPassword = await bcrypt2.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return done(null, false, { message: "Incorrect password." });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));
passport.serializeUser((user, cb) => cb(null, user.id));
passport.deserializeUser(async (id, cb) => {
  try {
    const [user] = await db.select().from(users).where(eq2(users.id, id));
    if (!user) {
      return cb(new Error("User not found"));
    }
    cb(null, user);
  } catch (error) {
    console.error("Deserialize user error:", error);
    cb(error);
  }
});
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  app2.post("/api/register", async (req, res) => {
    try {
      console.log("Registration attempt:", req.body);
      const { email, password, firstName, lastName } = req.body;
      if (!email || !password) {
        console.log("Missing email or password");
        return res.status(400).json({ message: "Email and password are required" });
      }
      console.log("Checking if user exists...");
      const [existingUser] = await db.select().from(users).where(eq2(users.email, email));
      if (existingUser) {
        console.log("User already exists:", email);
        return res.status(400).json({ message: "User already exists" });
      }
      console.log("Hashing password...");
      const passwordHash = await bcrypt2.hash(password, 10);
      console.log("Creating user...");
      const newUser = await storage.upsertUser({
        id: nanoid3(),
        email,
        firstName,
        lastName,
        passwordHash
      });
      console.log("User created:", newUser.id);
      req.login(newUser, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ message: "Error logging in" });
        }
        console.log("User logged in successfully");
        res.json({ message: "Registration successful", user: newUser });
      });
    } catch (error) {
      console.error("Registration error:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({ message: "Registration failed", error: error.message });
    }
  });
  app2.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.json({ message: "Login successful", user: req.user });
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logout successful" });
    });
  });
  app2.get("/api/me", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
}
var isAuthenticated = async (req, res, next) => {
  if (req.isAuthenticated() && req.user) {
    if (!req.user.id) {
      console.error("User object missing ID:", req.user);
      return res.status(401).json({ message: "Invalid user session" });
    }
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// server/devUtils.ts
var DEV_ACCOUNTS = [
  "frederic.dewaege@outlook.com",
  "admin@echogarden.local"
];
function isDevAccount(email) {
  return email ? DEV_ACCOUNTS.includes(email) : false;
}
function isDevEnvironment() {
  return process.env.NODE_ENV === "development";
}
function logDevAccess(email, action) {
  if (isDevEnvironment()) {
    console.log(`\u{1F527} DEV Access: ${email} - ${action}`);
  }
}

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  await setupAuth(app2);
  const initializeCategories = async () => {
    try {
      console.log("\u{1F331} Initializing default categories...");
      const existingCategories = await storage.getCategories();
      console.log(`\u{1F4CB} Found ${existingCategories.length} existing categories`);
      if (existingCategories.length === 0) {
        console.log("\u{1F195} No categories found, creating default ones...");
        const defaultCategories = [
          { name: "Mental Health Support", color: "green" },
          { name: "Study Help", color: "blue" },
          { name: "Career Advice", color: "purple" },
          { name: "Life Skills", color: "orange" },
          { name: "Creative Feedback", color: "pink" },
          { name: "Tech Support", color: "indigo" }
        ];
        for (const category of defaultCategories) {
          try {
            const created = await storage.createCategory(category);
            console.log(`\u2705 Created category: ${created.name} (${created.id})`);
          } catch (error) {
            console.error(`\u274C Failed to create category ${category.name}:`, error);
          }
        }
        console.log("\u{1F389} Category initialization completed");
      } else {
        console.log("\u2705 Categories already exist, skipping initialization");
        existingCategories.forEach((cat) => {
          console.log(`  - ${cat.name} (${cat.id})`);
        });
      }
    } catch (error) {
      console.error("\u{1F4A5} Category initialization failed:", error);
      throw error;
    }
  };
  await initializeCategories();
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching user:", error);
      }
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories2 = await storage.getCategories();
      res.json(categories2);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching categories:", error);
      }
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.get("/api/help-requests", async (req, res) => {
    try {
      const categoryId = req.query.categoryId;
      const searchTerm = req.query.search;
      const requests = await storage.getHelpRequests(categoryId, searchTerm);
      res.json(requests);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching help requests:", error);
      }
      res.status(500).json({ message: "Failed to fetch help requests" });
    }
  });
  app2.get("/api/help-requests/:id/responses", async (req, res) => {
    try {
      const request = await storage.getHelpRequestById(req.params.id);
      if (!request) {
        return res.status(404).json({ message: "Help request not found" });
      }
      res.json(request.responses);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching help request responses:", error);
      }
      res.status(500).json({ message: "Failed to fetch help request responses" });
    }
  });
  app2.get("/api/help-requests/:id", async (req, res) => {
    try {
      const request = await storage.getHelpRequestById(req.params.id);
      if (!request) {
        return res.status(404).json({ message: "Help request not found" });
      }
      res.json(request);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching help request:", error);
      }
      res.status(500).json({ message: "Failed to fetch help request" });
    }
  });
  app2.post("/api/help-requests", isAuthenticated, async (req, res) => {
    try {
      console.log("Creating help request:", req.body);
      if (!req.user || !req.user.id) {
        console.error("User object missing or invalid:", req.user);
        return res.status(401).json({ message: "Invalid user session" });
      }
      const userId = req.user.id;
      console.log("User ID from session:", userId);
      const requestData = {
        ...req.body,
        userId
      };
      console.log("Validating data:", requestData);
      const validatedData = insertHelpRequestSchema.parse(requestData);
      console.log("Validated data:", validatedData);
      const request = await storage.createHelpRequest(validatedData);
      console.log("Created request:", request.id);
      res.json(request);
    } catch (error) {
      console.error("Help request creation error:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      if (process.env.NODE_ENV === "development") {
        console.error("Error creating help request:", error);
      }
      res.status(500).json({ message: "Failed to create help request" });
    }
  });
  app2.delete("/api/help-requests/:id", isAuthenticated, async (req, res) => {
    try {
      const helpRequestId = req.params.id;
      const userId = req.user.id;
      console.log("Delete request received:", { helpRequestId, userId });
      await storage.deleteHelpRequest(helpRequestId, userId);
      console.log("Delete successful for help request:", helpRequestId);
      res.json({ message: "Help request deleted successfully" });
    } catch (error) {
      console.error("Delete error:", error);
      if (error instanceof Error) {
        if (error.message.includes("Unauthorized")) {
          return res.status(403).json({ message: error.message });
        }
        if (error.message.includes("not found")) {
          return res.status(404).json({ message: error.message });
        }
      }
      if (process.env.NODE_ENV === "development") {
        console.error("Error deleting help request:", error);
      }
      res.status(500).json({ message: "Failed to delete help request" });
    }
  });
  app2.post("/api/help-requests/:id/responses", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const helpRequestId = req.params.id;
      const validatedData = insertHelpResponseSchema.parse({
        ...req.body,
        userId,
        helpRequestId
      });
      const response = await storage.createHelpResponse(validatedData);
      try {
        const gardenItems2 = await storage.getUserGarden(userId);
        const hasGardenItem = gardenItems2.some((item) => item.helpResponseId === response.id);
        if (!hasGardenItem) {
          console.log("\u26A0\uFE0F Garden item not found, creating backup...");
          const helpRequest = await storage.getHelpRequestById(helpRequestId);
          if (helpRequest) {
            let seedType = "healing-seed";
            switch (helpRequest.category.name) {
              case "Mental Health Support":
                seedType = "healing-seed";
                break;
              case "Study Help":
                seedType = "knowledge-seed";
                break;
              case "Career Advice":
                seedType = "success-seed";
                break;
              case "Life Skills":
                seedType = "wisdom-seed";
                break;
              case "Creative Feedback":
                seedType = "inspiration-seed";
                break;
              case "Tech Support":
                seedType = "innovation-seed";
                break;
            }
            await storage.createGardenItem({
              userId: response.userId,
              helpResponseId: response.id,
              type: seedType,
              growth: 0
            });
            console.log("\u2705 Backup garden item created");
          }
        }
      } catch (gardenError) {
        console.error("Error in garden item backup creation:", gardenError);
      }
      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid response data", errors: error.errors });
      }
      if (process.env.NODE_ENV === "development") {
        console.error("Error creating help response:", error);
      }
      res.status(500).json({ message: "Failed to create help response" });
    }
  });
  app2.post("/api/help-responses/:id/mark-helpful", isAuthenticated, async (req, res) => {
    try {
      const responseId = req.params.id;
      const { helpRequestId } = req.body;
      await storage.markResponseHelpful(responseId, helpRequestId);
      res.json({ message: "Response marked as helpful" });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error marking response helpful:", error);
      }
      res.status(500).json({ message: "Failed to mark response helpful" });
    }
  });
  app2.get("/api/garden/:userId", async (req, res) => {
    try {
      const garden = await storage.getUserGarden(req.params.userId);
      res.json(garden);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching garden:", error);
      }
      res.status(500).json({ message: "Failed to fetch garden" });
    }
  });
  app2.get("/api/garden", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const garden = await storage.getUserGarden(userId);
      res.json(garden);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching user garden:", error);
      }
      res.status(500).json({ message: "Failed to fetch garden" });
    }
  });
  app2.post("/api/garden/mature-all", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const userEmail = req.user.email;
      if (!isDevAccount(userEmail)) {
        console.log(`\u{1F6AB} Mature plants access denied for: ${userEmail}`);
        return res.status(403).json({
          message: "Access denied. This feature is only available for development accounts."
        });
      }
      logDevAccess(userEmail, "mature-all-seeds");
      const garden = await storage.getUserGarden(userId);
      for (const item of garden) {
        if ((item.growth || 0) < 100) {
          await storage.updateGardenItem(item.id, {
            growth: 100,
            isGrown: 1
          });
        }
      }
      const updatedGarden = await storage.getUserGarden(userId);
      res.json({
        message: "All seeds matured successfully!",
        garden: updatedGarden
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error maturing seeds:", error);
      }
      res.status(500).json({ message: "Failed to mature seeds" });
    }
  });
  app2.post("/api/garden/reset-to-seeds", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const userEmail = req.user.email;
      if (!isDevAccount(userEmail)) {
        console.log(`\u{1F6AB} Reset garden access denied for: ${userEmail}`);
        return res.status(403).json({
          message: "Access denied. This feature is only available for development accounts."
        });
      }
      logDevAccess(userEmail, "reset-garden-to-seeds");
      const garden = await storage.getUserGarden(userId);
      console.log("Found garden items:", garden.length);
      for (const item of garden) {
        console.log("Resetting item:", item.id, "from growth", item.growth, "to 0");
        await storage.updateGardenItem(item.id, {
          growth: 0,
          isGrown: 0
        });
      }
      const updatedGarden = await storage.getUserGarden(userId);
      console.log("Reset complete. Updated garden items:", updatedGarden.length);
      res.json({
        message: "Garden reset to seeds successfully!",
        garden: updatedGarden
      });
    } catch (error) {
      console.error("Error resetting garden:", error);
      res.status(500).json({ message: "Failed to reset garden", error: error.message });
    }
  });
  app2.get("/api/user/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching user stats:", error);
      }
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });
  app2.get("/api/user/:id/stats", async (req, res) => {
    try {
      const userId = req.params.id;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching user stats:", error);
      }
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });
  app2.get("/api/health", async (req, res) => {
    try {
      const health = {
        status: "healthy",
        timestamp: /* @__PURE__ */ new Date(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        version: process.env.npm_package_version || "1.0.0"
      };
      try {
        await storage.getCommunityStats();
        health.database = "connected";
      } catch (dbError) {
        health.database = "disconnected";
        health.status = "degraded";
      }
      const statusCode = health.status === "healthy" ? 200 : 503;
      res.status(statusCode).json(health);
    } catch (error) {
      res.status(503).json({
        status: "unhealthy",
        timestamp: /* @__PURE__ */ new Date(),
        error: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
      });
    }
  });
  app2.get("/api/community-stats", async (req, res) => {
    try {
      const stats = await storage.getCommunityStats();
      res.json(stats);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching community stats:", error);
      }
      res.status(500).json({ message: "Failed to fetch community stats" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    target: "es2015",
    // Support older browsers
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-toast"]
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true
      }
    },
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  },
  define: {
    global: "globalThis"
    // Ensure global is available
  }
});

// server/vite.ts
import { nanoid as nanoid4 } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const __filename2 = fileURLToPath2(import.meta.url);
  const __dirname2 = path2.dirname(__filename2);
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    if (req.originalUrl.startsWith("/api/")) {
      return next();
    }
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid4()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const __filename2 = fileURLToPath2(import.meta.url);
  const __dirname2 = path2.dirname(__filename2);
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
config2();
var app = express2();
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  res.removeHeader("X-Powered-By");
  next();
});
if (process.env.NODE_ENV === "production") {
  const rateLimit = __require("express-rate-limit");
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1e3,
    // 15 minutes
    max: 100,
    // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use("/api/", limiter);
}
app.use(express2.json({ limit: "10mb" }));
app.use(express2.urlencoded({ extended: false, limit: "10mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "0.0.0.0";
  server.listen({
    port,
    host
  }, () => {
    log(`serving on ${host}:${port} in ${process.env.NODE_ENV || "development"} mode`);
  });
})();
