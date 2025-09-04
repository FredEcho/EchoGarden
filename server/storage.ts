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
import { nanoid } from "nanoid";
import { eq, desc, count, and, sql } from "drizzle-orm";
import { XP_REWARDS, calculateLevelInfo } from "@shared/leveling";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Help request operations
  getHelpRequests(categoryId?: string, searchQuery?: string): Promise<(HelpRequest & { 
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
  deleteHelpRequest(id: string, userId: string): Promise<void>;
  
  // Help response operations
  createHelpResponse(response: InsertHelpResponse): Promise<HelpResponse>;
  markResponseHelpful(responseId: string, helpRequestId: string): Promise<void>;
  
  // Garden operations
  getUserGarden(userId: string): Promise<GardenItem[]>;
  createGardenItem(item: InsertGardenItem): Promise<GardenItem>;
  updateGardenItem(id: string, updates: Partial<InsertGardenItem>): Promise<GardenItem>;
  
  // XP and Leveling operations
  addXP(userId: string, xpAmount: number, reason: string): Promise<{ newXP: number; newLevel: number; leveledUp: boolean }>;
  getUserStats(userId: string): Promise<{ xp: number; level: number; totalHelpProvided: number; totalHelpReceived: number }>;
  
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
    const id = userData.id ?? nanoid();
    const now = new Date().toISOString();
    
    // For new user registration, we don't need upsert logic
    const [user] = await db
      .insert(users)
      .values({
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
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = nanoid();
    const now = new Date().toISOString();
    
    const [newCategory] = await db
      .insert(categories)
      .values({
        id,
        name: category.name,
        color: category.color,
        createdAt: now
      })
      .returning();
    return newCategory;
  }

  // Help request operations
  async getHelpRequests(categoryId?: string, searchQuery?: string): Promise<(HelpRequest & { 
    user: User; 
    category: Category; 
    responseCount: number; 
    viewCount: number;
  })[]> {
    let query = db
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
        viewCount: sql<number>`0`, // Cross-dialect safe placeholder for view count
      })
      .from(helpRequests)
      .leftJoin(users, eq(helpRequests.userId, users.id))
      .leftJoin(categories, eq(helpRequests.categoryId, categories.id))
      .leftJoin(helpResponses, eq(helpRequests.id, helpResponses.helpRequestId))
      .groupBy(helpRequests.id, users.id, categories.id)
      .orderBy(desc(helpRequests.createdAt));

    // Build where conditions
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
      user: request.users || null,
      category: request.categories || null,
      responses,
    };
  }

  async createHelpRequest(request: InsertHelpRequest): Promise<HelpRequest> {
    try {
      console.log('🌱 Creating help request:', request);
      
      const id = nanoid();
      const now = new Date().toISOString();
      
      // Create help request with explicit ID and timestamps
      const [newRequest] = await db
        .insert(helpRequests)
        .values({
          id,
          userId: request.userId,
          categoryId: request.categoryId,
          title: request.title,
          description: request.description,
          tags: request.tags || null,
          isResolved: 0,
          createdAt: now,
          updatedAt: now
        })
        .returning();
      
      console.log('✅ Help request created successfully:', newRequest.id);
      
      // Award XP for posting and update help received stats
      try {
        await this.addXP(request.userId, XP_REWARDS.POST_HELP_REQUEST, 'Posted help request');
        
        // Update help received count
        await db
          .update(users)
          .set({ 
            totalHelpReceived: sql`${users.totalHelpReceived} + 1`,
            updatedAt: now
          })
          .where(eq(users.id, request.userId));
        
        console.log('🎯 XP awarded and help received stats updated');
      } catch (xpError) {
        console.error('⚠️ Failed to award XP or update stats:', xpError);
        // Don't fail the request creation if XP fails
      }
      
      return newRequest;
    } catch (error) {
      console.error('❌ Failed to create help request:', error);
      console.error('Request data:', request);
      throw error;
    }
  }

  async updateHelpRequest(id: string, updates: Partial<InsertHelpRequest>): Promise<HelpRequest> {
    const [updated] = await db
      .update(helpRequests)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(helpRequests.id, id))
      .returning();
    return updated;
  }

  async deleteHelpRequest(id: string, userId: string): Promise<void> {
    console.log("Storage: Deleting help request", { id, userId });
    
    // First check if the help request belongs to the user
    const [request] = await db
      .select()
      .from(helpRequests)
      .where(eq(helpRequests.id, id));

    console.log("Storage: Found request", request);

    if (!request) {
      throw new Error("Help request not found");
    }

    if (request.userId !== userId) {
      throw new Error("Unauthorized: You can only delete your own help requests");
    }

    console.log("Storage: Authorization passed, getting responses...");

    // Get all responses for this help request
    const responses = await db
      .select()
      .from(helpResponses)
      .where(eq(helpResponses.helpRequestId, id));

    console.log("Storage: Found responses", responses.length);

    // Delete garden items that reference these responses first
    for (const response of responses) {
      console.log("Storage: Deleting garden items for response", response.id);
      await db
        .delete(gardenItems)
        .where(eq(gardenItems.helpResponseId, response.id));
    }

    console.log("Storage: Garden items deleted, deleting responses...");

    // Delete associated responses
    await db
      .delete(helpResponses)
      .where(eq(helpResponses.helpRequestId, id));

    console.log("Storage: Responses deleted, deleting help request...");

    // Delete the help request
    await db
      .delete(helpRequests)
      .where(eq(helpRequests.id, id));

    console.log("Storage: Help request deleted successfully");
  }

  // Help response operations
  async createHelpResponse(response: InsertHelpResponse): Promise<HelpResponse> {
    const id = nanoid();
    const now = new Date().toISOString();
    
    const [newResponse] = await db
      .insert(helpResponses)
      .values({
        id,
        helpRequestId: response.helpRequestId,
        userId: response.userId,
        content: response.content,
        isMarkedHelpful: 0,
        createdAt: now
      })
      .returning();

    // Award XP for providing a helpful response and update help provided stats
    await this.addXP(response.userId, XP_REWARDS.PROVIDE_HELPFUL_RESPONSE, 'Provided helpful response');
    
    // Update help provided count
    await db
      .update(users)
      .set({ 
        totalHelpProvided: sql`${users.totalHelpProvided} + 1`,
        updatedAt: now
      })
      .where(eq(users.id, response.userId));

    // Get the help request to determine seed type based on category
    const [helpRequest] = await db
      .select({
        categoryId: helpRequests.categoryId,
        category: categories,
      })
      .from(helpRequests)
      .leftJoin(categories, eq(helpRequests.categoryId, categories.id))
      .where(eq(helpRequests.id, response.helpRequestId));

    // Determine seed type based on category
    let seedType = 'healing-seed'; // default
    if (helpRequest?.category?.name) {
      switch (helpRequest.category.name) {
        case 'Mental Health Support':
          seedType = 'healing-seed';
          break;
        case 'Study Help':
          seedType = 'knowledge-seed';
          break;
        case 'Career Advice':
          seedType = 'success-seed';
          break;
        case 'Life Skills':
          seedType = 'wisdom-seed';
          break;
        case 'Creative Feedback':
          seedType = 'inspiration-seed';
          break;
        case 'Tech Support':
          seedType = 'innovation-seed';
          break;
      }
    }

    // Create a seed in the helper's garden
    await this.createGardenItem({
      userId: response.userId,
      helpResponseId: newResponse.id,
      type: seedType,
      growth: 0,
    });

    return newResponse;
  }

  async markResponseHelpful(responseId: string, helpRequestId: string): Promise<void> {
    // First get the current response to check if it's already marked as helpful
    const [currentResponse] = await db
      .select()
      .from(helpResponses)
      .where(eq(helpResponses.id, responseId));

    if (!currentResponse) {
      throw new Error('Response not found');
    }

    // If already marked as helpful, don't increment count again
    if (currentResponse.isMarkedHelpful) {
      return;
    }

    // Mark as helpful and increment the helpful count
    await db
      .update(helpResponses)
      .set({ 
        isMarkedHelpful: 1,
        helpfulCount: (currentResponse.helpfulCount || 0) + 1
      })
      .where(eq(helpResponses.id, responseId));

    // Get the response to award XP to the helper
    const [response] = await db
      .select()
      .from(helpResponses)
      .where(eq(helpResponses.id, responseId));

    if (response) {
      // Award XP for having response marked as helpful
      await this.addXP(response.userId, XP_REWARDS.RESPONSE_MARKED_HELPFUL, 'Response marked as helpful');

      // Get the help request to determine the category
      const [helpRequest] = await db
        .select({
          categoryId: helpRequests.categoryId,
          categoryName: categories.name
        })
        .from(helpRequests)
        .leftJoin(categories, eq(helpRequests.categoryId, categories.id))
        .where(eq(helpRequests.id, helpRequestId));

      // Find and grow the existing garden item for this response
      const [gardenItem] = await db
        .select()
        .from(gardenItems)
        .where(eq(gardenItems.helpResponseId, responseId));

      if (gardenItem && gardenItem.growth !== null) {
        const currentGrowth = gardenItem.growth || 0;
        const newGrowth = Math.min(currentGrowth + 50, 100); // More growth when marked helpful
        
        let newType = gardenItem.type;
        if (newGrowth >= 100) {
          newType = 'flower';
        } else if (newGrowth >= 75) {
          newType = 'plant';
        } else if (newGrowth >= 25) {
          newType = 'sprout';
        }

        await this.updateGardenItem(gardenItem.id, {
          growth: newGrowth,
          type: newType,
          isGrown: newGrowth >= 100 ? 1 : 0,
        });
      }
    }
  }

  // Garden operations
  async getUserGarden(userId: string): Promise<GardenItem[]> {
    const items = await db
      .select()
      .from(gardenItems)
      .where(eq(gardenItems.userId, userId))
      .orderBy(desc(gardenItems.createdAt));

    // Auto-grow seeds based on time passed
    const now = new Date();
    for (const item of items) {
      if (item.type.includes('seed') && item.growth < 25) {
        const createdAt = new Date(item.createdAt);
        const hoursPassed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        
        // Seeds grow to 25% after 24 hours
        if (hoursPassed >= 24 && item.growth < 25) {
          await this.updateGardenItem(item.id, {
            growth: 25,
            type: 'sprout',
          });
        }
      }
    }

    // Return updated garden items
    return await db
      .select()
      .from(gardenItems)
      .where(eq(gardenItems.userId, userId))
      .orderBy(desc(gardenItems.createdAt));
  }

  async createGardenItem(item: InsertGardenItem): Promise<GardenItem> {
    const id = nanoid();
    const now = new Date().toISOString();
    
    const [newItem] = await db
      .insert(gardenItems)
      .values({
        id,
        userId: item.userId,
        helpResponseId: item.helpResponseId,
        type: item.type,
        growth: item.growth || 0,
        isGrown: item.isGrown || 0,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    return newItem;
  }

  async updateGardenItem(id: string, updates: Partial<InsertGardenItem>): Promise<GardenItem> {
    const [updated] = await db
      .update(gardenItems)
      .set({ ...updates, updatedAt: new Date().toISOString() })
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
      .where(eq(gardenItems.isGrown, 1));

    return {
      activeGardeners: activeGardeners.count,
      seedsPlanted: seedsPlanted.count,
      gardensBloomin: gardensBloomin.count,
    };
  }

  // XP and Leveling operations
  async addXP(userId: string, xpAmount: number, reason: string): Promise<{ newXP: number; newLevel: number; leveledUp: boolean }> {
    // Get current user data
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const currentXP = user.xp || 0;
    const currentLevel = user.level || 1;
    const newXP = currentXP + xpAmount;
    
    // Calculate new level
    const levelInfo = calculateLevelInfo(newXP);
    const newLevel = levelInfo.level;
    const leveledUp = newLevel > currentLevel;

    // Update user with new XP and level
    await db
      .update(users)
      .set({ 
        xp: newXP,
        level: newLevel,
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.id, userId));

    // Log XP gain
    console.log(`🎯 User ${userId} gained ${xpAmount} XP (${reason}). New total: ${newXP} XP, Level ${newLevel}${leveledUp ? ' (LEVELED UP!)' : ''}`);

    return { newXP, newLevel, leveledUp };
  }

  async getUserStats(userId: string): Promise<{ xp: number; level: number; totalHelpProvided: number; totalHelpReceived: number }> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      xp: user.xp || 0,
      level: user.level || 1,
      totalHelpProvided: user.totalHelpProvided || 0,
      totalHelpReceived: user.totalHelpReceived || 0,
    };
  }
}

export const storage = new DatabaseStorage();
