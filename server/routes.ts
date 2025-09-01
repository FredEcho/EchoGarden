import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./localAuth";
import { insertHelpRequestSchema, insertHelpResponseSchema, insertCategorySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Initialize default categories
  const initializeCategories = async () => {
    const existingCategories = await storage.getCategories();
    if (existingCategories.length === 0) {
      const defaultCategories = [
        { name: "Mental Health Support", color: "green" },
        { name: "Study Help", color: "blue" },
        { name: "Career Advice", color: "purple" },
        { name: "Life Skills", color: "orange" },
        { name: "Creative Feedback", color: "pink" },
        { name: "Tech Support", color: "indigo" },
      ];
      
      for (const category of defaultCategories) {
        await storage.createCategory(category);
      }
    }
  };
  
  await initializeCategories();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching user:", error);
      }
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Category routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching categories:", error);
      }
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Help request routes
  app.get('/api/help-requests', async (req, res) => {
    try {
      const categoryId = req.query.categoryId as string;
      const searchTerm = req.query.search as string;
      const requests = await storage.getHelpRequests(categoryId, searchTerm);
      res.json(requests);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching help requests:", error);
      }
      res.status(500).json({ message: "Failed to fetch help requests" });
    }
  });

  app.get('/api/help-requests/:id/responses', async (req, res) => {
    try {
      const request = await storage.getHelpRequestById(req.params.id);
      if (!request) {
        return res.status(404).json({ message: "Help request not found" });
      }
      res.json(request.responses);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching help request responses:", error);
      }
      res.status(500).json({ message: "Failed to fetch help request responses" });
    }
  });

  app.get('/api/help-requests/:id', async (req, res) => {
    try {
      const request = await storage.getHelpRequestById(req.params.id);
      if (!request) {
        return res.status(404).json({ message: "Help request not found" });
      }
      res.json(request);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching help request:", error);
      }
      res.status(500).json({ message: "Failed to fetch help request" });
    }
  });

  app.post('/api/help-requests', isAuthenticated, async (req: any, res) => {
    try {
      console.log("Creating help request:", req.body);
      const userId = req.user.id;
      
      const requestData = {
        ...req.body,
        userId,
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
      if (process.env.NODE_ENV === 'development') {
        console.error("Error creating help request:", error);
      }
      res.status(500).json({ message: "Failed to create help request" });
    }
  });

  app.delete('/api/help-requests/:id', isAuthenticated, async (req: any, res) => {
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
      if (process.env.NODE_ENV === 'development') {
        console.error("Error deleting help request:", error);
      }
      res.status(500).json({ message: "Failed to delete help request" });
    }
  });

  // Help response routes
  app.post('/api/help-requests/:id/responses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const helpRequestId = req.params.id;
      
      const validatedData = insertHelpResponseSchema.parse({
        ...req.body,
        userId,
        helpRequestId,
      });
      
      const response = await storage.createHelpResponse(validatedData);
      
      // Ensure garden item is created (backup in case storage layer fails)
      try {
        const gardenItems = await storage.getUserGarden(userId);
        const hasGardenItem = gardenItems.some(item => item.helpResponseId === response.id);
        
        if (!hasGardenItem) {
          console.log('⚠️ Garden item not found, creating backup...');
          // Get the help request to determine seed type
          const helpRequest = await storage.getHelpRequestById(helpRequestId);
          if (helpRequest) {
            let seedType = 'healing-seed'; // default
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
            
            await storage.createGardenItem({
              userId: response.userId,
              helpResponseId: response.id,
              type: seedType,
              growth: 0,
            });
            console.log('✅ Backup garden item created');
          }
        }
      } catch (gardenError) {
        console.error('Error in garden item backup creation:', gardenError);
      }
      
      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid response data", errors: error.errors });
      }
      if (process.env.NODE_ENV === 'development') {
        console.error("Error creating help response:", error);
      }
      res.status(500).json({ message: "Failed to create help response" });
    }
  });

  app.post('/api/help-responses/:id/mark-helpful', isAuthenticated, async (req: any, res) => {
    try {
      const responseId = req.params.id;
      const { helpRequestId } = req.body;
      
      await storage.markResponseHelpful(responseId, helpRequestId);
      res.json({ message: "Response marked as helpful" });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error marking response helpful:", error);
      }
      res.status(500).json({ message: "Failed to mark response helpful" });
    }
  });

  // Garden routes
  app.get('/api/garden/:userId', async (req, res) => {
    try {
      const garden = await storage.getUserGarden(req.params.userId);
      res.json(garden);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching garden:", error);
      }
      res.status(500).json({ message: "Failed to fetch garden" });
    }
  });

  app.get('/api/garden', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const garden = await storage.getUserGarden(userId);
      res.json(garden);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching user garden:", error);
      }
      res.status(500).json({ message: "Failed to fetch garden" });
    }
  });

  // Temporary endpoint to mature all seeds for testing
  app.post('/api/garden/mature-all', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const garden = await storage.getUserGarden(userId);
      
      // Update all seeds to 100% growth
      for (const item of garden) {
        if (item.growth < 100) {
          await storage.updateGardenItem(item.id, {
            growth: 100,
            isGrown: true,
          });
        }
      }
      
      // Return updated garden
      const updatedGarden = await storage.getUserGarden(userId);
      res.json({ 
        message: "All seeds matured successfully!", 
        garden: updatedGarden 
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error maturing seeds:", error);
      }
      res.status(500).json({ message: "Failed to mature seeds" });
    }
  });

  // Reset garden to seeds for testing
  app.post('/api/garden/reset-to-seeds', isAuthenticated, async (req: any, res) => {
    try {
      console.log('Reset endpoint called by user:', req.user.id);
      const userId = req.user.id;
      const garden = await storage.getUserGarden(userId);
      
      console.log('Found garden items:', garden.length);
      
      // Reset all items back to seed stage
      for (const item of garden) {
        console.log('Resetting item:', item.id, 'from growth', item.growth, 'to 0');
        await storage.updateGardenItem(item.id, {
          growth: 0,
          isGrown: false,
        });
      }
      
      // Return updated garden
      const updatedGarden = await storage.getUserGarden(userId);
      console.log('Reset complete. Updated garden items:', updatedGarden.length);
      
      res.json({ 
        message: "Garden reset to seeds successfully!", 
        garden: updatedGarden 
      });
    } catch (error) {
      console.error("Error resetting garden:", error);
      res.status(500).json({ message: "Failed to reset garden", error: error.message });
    }
  });

  // XP and Leveling routes
  app.get('/api/user/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching user stats:", error);
      }
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.get('/api/user/:id/stats', async (req, res) => {
    try {
      const userId = req.params.id;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching user stats:", error);
      }
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Health check endpoint for production monitoring
  app.get('/api/health', async (req, res) => {
    try {
      // Basic health check
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
      };
      
      // Test database connection
      try {
        await storage.getCommunityStats();
        health.database = 'connected';
      } catch (dbError) {
        health.database = 'disconnected';
        health.status = 'degraded';
      }
      
      const statusCode = health.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(health);
    } catch (error) {
      res.status(503).json({ 
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  });

  // Community stats
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getCommunityStats();
      res.json(stats);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error fetching community stats:", error);
      }
      res.status(500).json({ message: "Failed to fetch community stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
