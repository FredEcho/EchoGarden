import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Use PostgreSQL store if available, otherwise fall back to memory store
  let store;
  if (process.env.DATABASE_URL?.startsWith('postgresql://')) {
    try {
      const connectPg = require('connect-pg-simple');
      const PostgresStore = connectPg(session);
      store = new PostgresStore({
        conObject: {
          connectionString: process.env.DATABASE_URL,
        },
        tableName: 'sessions',
        createTableIfMissing: true,
      });
    } catch (error) {
      console.warn('PostgreSQL session store not available, using memory store:', (error as Error).message);
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
      sameSite: 'lax',
    },
  });
}

// Local Strategy for username/password authentication
import LocalStrategy from "passport-local";

passport.use(new LocalStrategy.Strategy(
  {
    usernameField: 'email',
    passwordField: 'password',
  },
  async (email, password, done) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));

      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }

      // For existing users without password hash, allow login with any password
      // This is for migration from Replit auth
      if (!user.passwordHash) {
        return done(null, user);
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user: any, cb) => cb(null, user.id));
passport.deserializeUser(async (id: string, cb) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) {
      return cb(new Error('User not found'));
    }
    cb(null, user);
  } catch (error) {
    console.error('Deserialize user error:', error);
    cb(error);
  }
});

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Registration endpoint
  app.post("/api/register", async (req, res) => {
    try {
      console.log("Registration attempt:", req.body);
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        console.log("Missing email or password");
        return res.status(400).json({ message: "Email and password are required" });
      }

      console.log("Checking if user exists...");
      // Check if user already exists
      const [existingUser] = await db.select().from(users).where(eq(users.email, email));

      if (existingUser) {
        console.log("User already exists:", email);
        return res.status(400).json({ message: "User already exists" });
      }

      console.log("Hashing password...");
      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      console.log("Creating user...");
      // Create user
      const newUser = await storage.upsertUser({
        id: nanoid(),
        email,
        firstName,
        lastName,
        passwordHash,
      });

      console.log("User created:", newUser.id);

      // Log in the user
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
      console.error("Error stack:", (error as Error).stack);
      res.status(500).json({ message: "Registration failed", error: (error as Error).message });
    }
  });

  // Login endpoint
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.json({ message: "Login successful", user: req.user });
  });

  // Logout endpoint
  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logout successful" });
    });
  });

  // Get current user
  app.get("/api/me", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (req.isAuthenticated() && req.user) {
    // Ensure req.user has the necessary properties
    if (!(req.user as any).id) {
      console.error("User object missing ID:", req.user);
      return res.status(401).json({ message: "Invalid user session" });
    }
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
