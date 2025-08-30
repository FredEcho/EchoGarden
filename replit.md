# Overview

EchoGarden is a community-driven help platform where users can request assistance, offer support, and visualize their positive contributions through a virtual garden metaphor. The application focuses on mental health support, study help, career advice, and other life skills, encouraging users to "plant seeds of kindness" by helping others in the community.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client uses a modern React-based architecture with TypeScript:

- **Framework**: React 18 with Vite for fast development and bundling
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Component Structure**: Modular component architecture with reusable UI components in `/components/ui/`
- **Design System**: Uses CSS custom properties for theming with a cohesive design language featuring gradients and plant-themed elements

## Backend Architecture
The server follows a RESTful API pattern built with Express.js:

- **Runtime**: Node.js with TypeScript and ES modules
- **Framework**: Express.js with middleware for request logging, JSON parsing, and error handling
- **Authentication**: Replit Auth integration using OpenID Connect with Passport.js
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **Database Access**: Drizzle ORM for type-safe database operations
- **API Routes**: Organized route handlers for authentication, categories, help requests, and responses

## Database Design
PostgreSQL database with Drizzle ORM providing type-safe schema definitions:

- **User Management**: Users table for Replit Auth integration storing profile information
- **Content Organization**: Categories for help request classification with color coding
- **Core Features**: Help requests (echoes) and responses with relationship mapping
- **Gamification**: Garden items and pay-it-forward tracking for user engagement
- **Session Storage**: Dedicated sessions table for authentication state persistence

## Authentication & Authorization
Replit-based authentication system:

- **Provider**: Replit OpenID Connect for seamless integration
- **Session Handling**: Server-side sessions with PostgreSQL storage
- **Route Protection**: Middleware-based authentication checks for protected endpoints
- **User Context**: Automatic user creation and profile management

## Key Features & Design Patterns

### Help Request System
- Category-based organization with visual color coding
- Request creation, viewing, and response functionality
- Community engagement tracking (views, response counts)

### Garden Visualization
- Gamified representation of user contributions
- Virtual plants that grow based on help provided
- Visual feedback system encouraging continued participation

### Real-time Interactivity
- Toast notifications for user feedback
- Dialog-based forms for content creation
- Responsive design with mobile-first approach

### Content Management
- Tag-based categorization system
- Rich text support for help requests and responses
- Community stats and engagement metrics

## External Dependencies

- **Database**: PostgreSQL via Neon serverless with connection pooling
- **Authentication**: Replit OpenID Connect service
- **UI Components**: Radix UI primitives for accessible component foundations
- **Styling**: Tailwind CSS with custom design tokens and gradients
- **Development**: Vite build system with TypeScript compilation
- **Session Storage**: PostgreSQL-backed session management
- **Development Tools**: Replit-specific plugins for development environment integration