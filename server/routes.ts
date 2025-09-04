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
    try {
      console.log('🌱 Initializing default categories...');
      const existingCategories = await storage.getCategories();
      console.log(`📋 Found ${existingCategories.length} existing categories`);
      
      if (existingCategories.length === 0) {
        console.log('🆕 No categories found, creating default ones...');
        const defaultCategories = [
          { name: "Mental Health Support", color: "green" },
          { name: "Study Help", color: "blue" },
          { name: "Career Advice", color: "purple" },
          { name: "Life Skills", color: "orange" },
          { name: "Creative Feedback", color: "pink" },
          { name: "Tech Support", color: "indigo" },
        ];
        
        for (const category of defaultCategories) {
          try {
            const created = await storage.createCategory(category);
            console.log(`✅ Created category: ${created.name} (${created.id})`);
          } catch (error) {
            console.error(`❌ Failed to create category ${category.name}:`, error);
          }
        }
        console.log('🎉 Category initialization completed');
      } else {
        console.log('✅ Categories already exist, skipping initialization');
        existingCategories.forEach(cat => {
          console.log(`  - ${cat.name} (${cat.id})`);
        });
      }
    } catch (error) {
      console.error('💥 Category initialization failed:', error);
      throw error;
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
      
      // Ensure user object exists and has required properties
      if (!req.user || !req.user.id) {
        console.error("User object missing or invalid:", req.user);
        return res.status(401).json({ message: "Invalid user session" });
      }
      
      const userId = req.user.id;
      console.log("User ID from session:", userId);
      
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
            isGrown: 1,
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
          isGrown: 0,
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
        timestamp: new Date(),
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
        timestamp: new Date(),
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  });

  // Community stats
  app.get('/api/community-stats', async (req, res) => {
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

  // Serve community feature plan
  app.get('/api/community-plan', async (req, res) => {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const planPath = path.join(process.cwd(), 'COMMUNITY_FEATURE_PLAN.md');
      const content = fs.readFileSync(planPath, 'utf8');
      
      // Create HTML page with markdown rendering
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EchoGarden Community Feature Plan</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        h1 {
            color: #667eea;
            font-size: 2.5rem;
            margin-bottom: 1rem;
            text-align: center;
        }
        
        h2 {
            color: #764ba2;
            font-size: 1.8rem;
            margin: 2rem 0 1rem 0;
            border-bottom: 2px solid #667eea;
            padding-bottom: 0.5rem;
        }
        
        h3 {
            color: #5a67d8;
            font-size: 1.4rem;
            margin: 1.5rem 0 0.8rem 0;
        }
        
        h4 {
            color: #4c51bf;
            font-size: 1.2rem;
            margin: 1.2rem 0 0.6rem 0;
        }
        
        p {
            margin-bottom: 1rem;
            text-align: justify;
        }
        
        code {
            background: #f7fafc;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', monospace;
            color: #e53e3e;
        }
        
        pre {
            background: #2d3748;
            color: #e2e8f0;
            padding: 20px;
            border-radius: 10px;
            overflow-x: auto;
            margin: 1rem 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        pre code {
            background: none;
            color: inherit;
            padding: 0;
        }
        
        ul, ol {
            margin: 1rem 0;
            padding-left: 2rem;
        }
        
        li {
            margin-bottom: 0.5rem;
        }
        
        blockquote {
            border-left: 4px solid #667eea;
            padding-left: 20px;
            margin: 1rem 0;
            font-style: italic;
            color: #4a5568;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }
        
        th {
            background: #667eea;
            color: white;
            font-weight: 600;
        }
        
        .emoji {
            font-size: 1.2em;
        }
        
        .highlight {
            background: linear-gradient(120deg, #a8edea 0%, #fed6e3 100%);
            padding: 2px 6px;
            border-radius: 4px;
        }
        
        .back-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #667eea;
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            text-decoration: none;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
        }
        
        .back-button:hover {
            background: #5a67d8;
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 20px;
                margin: 10px;
            }
            
            h1 {
                font-size: 2rem;
            }
            
            h2 {
                font-size: 1.5rem;
            }
            
            .back-button {
                position: relative;
                top: auto;
                right: auto;
                display: inline-block;
                margin-bottom: 20px;
            }
        }
    </style>
</head>
<body>
    <a href="javascript:history.back()" class="back-button">← Back to EchoGarden</a>
    <div class="container">
        <div id="content"></div>
    </div>
    
    <script>
        // Simple markdown to HTML converter
        function markdownToHtml(markdown) {
            return markdown
                // Headers
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                // Bold
                .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
                // Italic
                .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
                // Code blocks
                .replace(/```([\\s\\S]*?)```/g, '<pre><code>$1</code></pre>')
                // Inline code
                .replace(/`(.*?)`/g, '<code>$1</code>')
                // Lists
                .replace(/^\\* (.*$)/gim, '<li>$1</li>')
                .replace(/^\\- (.*$)/gim, '<li>$1</li>')
                .replace(/^\\+ (.*$)/gim, '<li>$1</li>')
                // Line breaks
                .replace(/\\n\\n/g, '</p><p>')
                .replace(/\\n/g, '<br>')
                // Wrap in paragraphs
                .replace(/^(?!<[h|l|p|d])/gm, '<p>')
                .replace(/(?<!>)$/gm, '</p>')
                // Clean up empty paragraphs
                .replace(/<p><\\/p>/g, '')
                .replace(/<p><br><\\/p>/g, '')
                // Wrap lists
                .replace(/(<li>.*<\\/li>)/gs, '<ul>$1</ul>')
                // Clean up nested lists
                .replace(/<\\/ul>\\s*<ul>/g, '');
        }
        
        // Render the content when page loads
        document.addEventListener('DOMContentLoaded', function() {
            const markdownContent = \`${content.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
            const contentDiv = document.getElementById('content');
            if (contentDiv) {
                contentDiv.innerHTML = markdownToHtml(markdownContent);
            }
        });
    </script>
</body>
</html>`;
      
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error("Error serving community plan:", error);
      res.status(404).json({ message: "Community plan not found" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
