import {
  users,
  categories,
  helpRequests,
  helpResponses,
  gardenItems,
  payItForward,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type HelpRequest,
  type InsertHelpRequest,
  type HelpResponse,
  type InsertHelpResponse,
  type GardenItem,
  type InsertGardenItem,
  type PayItForward,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Help request operations
  getHelpRequests(categoryId?: string): Promise<(HelpRequest & { 
    user: User; 
    category: Category; 
    responseCount: number; 
    viewCount: number;
  })[]>;
  getHelpRequestById(id: string): Promise<(HelpRequest & { 
    user: User; 
    category: Category; 
    responses: (HelpResponse & { user: User })[];
  }) | undefined>;
  createHelpRequest(request: InsertHelpRequest): Promise<HelpRequest>;
  updateHelpRequest(id: string, updates: Partial<InsertHelpRequest>): Promise<HelpRequest>;
  
  // Help response operations
  createHelpResponse(response: InsertHelpResponse): Promise<HelpResponse>;
  markResponseHelpful(responseId: string, helpRequestId: string): Promise<void>;
  
  // Garden operations
  getUserGarden(userId: string): Promise<GardenItem[]>;
  createGardenItem(item: InsertGardenItem): Promise<GardenItem>;
  updateGardenItem(id: string, updates: Partial<InsertGardenItem>): Promise<GardenItem>;
  
  // Community stats
  getCommunityStats(): Promise<{
    activeGardeners: number;
    seedsPlanted: number;
    gardensBloomin: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  // Help request operations
  async getHelpRequests(categoryId?: string): Promise<(HelpRequest & { 
    user: User; 
    category: Category; 
    responseCount: number; 
    viewCount: number;
  })[]> {
    const query = db
      .select({
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
        viewCount: sql<number>`CAST(random() * 100 + 10 AS INTEGER)`, // Placeholder for view count
      })
      .from(helpRequests)
      .leftJoin(users, eq(helpRequests.userId, users.id))
      .leftJoin(categories, eq(helpRequests.categoryId, categories.id))
      .leftJoin(helpResponses, eq(helpRequests.id, helpResponses.helpRequestId))
      .groupBy(helpRequests.id, users.id, categories.id)
      .orderBy(desc(helpRequests.createdAt));

    if (categoryId) {
      query.where(eq(helpRequests.categoryId, categoryId));
    }

    return await query;
  }

  async getHelpRequestById(id: string): Promise<(HelpRequest & { 
    user: User; 
    category: Category; 
    responses: (HelpResponse & { user: User })[];
  }) | undefined> {
    const [request] = await db
      .select()
      .from(helpRequests)
      .leftJoin(users, eq(helpRequests.userId, users.id))
      .leftJoin(categories, eq(helpRequests.categoryId, categories.id))
      .where(eq(helpRequests.id, id));

    if (!request) return undefined;

    const responses = await db
      .select({
        id: helpResponses.id,
        helpRequestId: helpResponses.helpRequestId,
        userId: helpResponses.userId,
        content: helpResponses.content,
        isMarkedHelpful: helpResponses.isMarkedHelpful,
        createdAt: helpResponses.createdAt,
        user: users,
      })
      .from(helpResponses)
      .leftJoin(users, eq(helpResponses.userId, users.id))
      .where(eq(helpResponses.helpRequestId, id))
      .orderBy(desc(helpResponses.createdAt));

    return {
      ...request.help_requests,
      user: request.users!,
      category: request.categories!,
      responses,
    };
  }

  async createHelpRequest(request: InsertHelpRequest): Promise<HelpRequest> {
    const [newRequest] = await db
      .insert(helpRequests)
      .values(request)
      .returning();
    return newRequest;
  }

  async updateHelpRequest(id: string, updates: Partial<InsertHelpRequest>): Promise<HelpRequest> {
    const [updated] = await db
      .update(helpRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(helpRequests.id, id))
      .returning();
    return updated;
  }

  // Help response operations
  async createHelpResponse(response: InsertHelpResponse): Promise<HelpResponse> {
    const [newResponse] = await db
      .insert(helpResponses)
      .values(response)
      .returning();

    // Create a seed in the helper's garden
    await this.createGardenItem({
      userId: response.userId,
      helpResponseId: newResponse.id,
      type: 'seed',
      growth: 0,
    });

    return newResponse;
  }

  async markResponseHelpful(responseId: string, helpRequestId: string): Promise<void> {
    await db
      .update(helpResponses)
      .set({ isMarkedHelpful: true })
      .where(eq(helpResponses.id, responseId));

    // Grow the associated garden item
    const [gardenItem] = await db
      .select()
      .from(gardenItems)
      .where(eq(gardenItems.helpResponseId, responseId));

    if (gardenItem) {
      await this.updateGardenItem(gardenItem.id, {
        growth: Math.min(gardenItem.growth + 25, 100),
        type: gardenItem.growth >= 75 ? 'plant' : 'sprout',
        isGrown: gardenItem.growth >= 75,
      });
    }
  }

  // Garden operations
  async getUserGarden(userId: string): Promise<GardenItem[]> {
    return await db
      .select()
      .from(gardenItems)
      .where(eq(gardenItems.userId, userId))
      .orderBy(desc(gardenItems.createdAt));
  }

  async createGardenItem(item: InsertGardenItem): Promise<GardenItem> {
    const [newItem] = await db
      .insert(gardenItems)
      .values(item)
      .returning();
    return newItem;
  }

  async updateGardenItem(id: string, updates: Partial<InsertGardenItem>): Promise<GardenItem> {
    const [updated] = await db
      .update(gardenItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(gardenItems.id, id))
      .returning();
    return updated;
  }

  // Community stats
  async getCommunityStats(): Promise<{
    activeGardeners: number;
    seedsPlanted: number;
    gardensBloomin: number;
  }> {
    const [activeGardeners] = await db
      .select({ count: count() })
      .from(users);

    const [seedsPlanted] = await db
      .select({ count: count() })
      .from(gardenItems);

    const [gardensBloomin] = await db
      .select({ count: count() })
      .from(gardenItems)
      .where(eq(gardenItems.isGrown, true));

    return {
      activeGardeners: activeGardeners.count,
      seedsPlanted: seedsPlanted.count,
      gardensBloomin: gardensBloomin.count,
    };
  }
}

export const storage = new DatabaseStorage();
