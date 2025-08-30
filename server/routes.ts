import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
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
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Category routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Help request routes
  app.get('/api/help-requests', async (req, res) => {
    try {
      const categoryId = req.query.categoryId as string;
      const requests = await storage.getHelpRequests(categoryId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching help requests:", error);
      res.status(500).json({ message: "Failed to fetch help requests" });
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
      console.error("Error fetching help request:", error);
      res.status(500).json({ message: "Failed to fetch help request" });
    }
  });

  app.post('/api/help-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertHelpRequestSchema.parse({
        ...req.body,
        userId,
      });
      
      const request = await storage.createHelpRequest(validatedData);
      res.json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error creating help request:", error);
      res.status(500).json({ message: "Failed to create help request" });
    }
  });

  // Help response routes
  app.post('/api/help-requests/:id/responses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const helpRequestId = req.params.id;
      
      const validatedData = insertHelpResponseSchema.parse({
        ...req.body,
        userId,
        helpRequestId,
      });
      
      const response = await storage.createHelpResponse(validatedData);
      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid response data", errors: error.errors });
      }
      console.error("Error creating help response:", error);
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
      console.error("Error marking response helpful:", error);
      res.status(500).json({ message: "Failed to mark response helpful" });
    }
  });

  // Garden routes
  app.get('/api/garden/:userId', async (req, res) => {
    try {
      const garden = await storage.getUserGarden(req.params.userId);
      res.json(garden);
    } catch (error) {
      console.error("Error fetching garden:", error);
      res.status(500).json({ message: "Failed to fetch garden" });
    }
  });

  app.get('/api/garden', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const garden = await storage.getUserGarden(userId);
      res.json(garden);
    } catch (error) {
      console.error("Error fetching user garden:", error);
      res.status(500).json({ message: "Failed to fetch garden" });
    }
  });

  // Community stats
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getCommunityStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching community stats:", error);
      res.status(500).json({ message: "Failed to fetch community stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
