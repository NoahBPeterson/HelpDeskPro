# Zendesk Clone (AutoCRM) Project Checklist

## Core Features

### 1. Authentication & Authorization
- [x] Set up Supabase Auth
  - [x] Email/password authentication
  - [ ] OAuth providers (Google, GitHub)
  - [ ] Password reset flow
  - [x] Email verification
- [x] Authorization Rules
  - [x] Row Level Security (RLS) policies
    - [x] Workspace isolation
    - [x] Role-based access
    - [x] Ticket visibility rules
  - [x] API endpoint protection
  - [x] Frontend route guards
- [x] Session management
  - [x] Token refresh

### 2. Invitation System & Onboarding
- [ ] Create "invitations" table with token and expiration
- [ ] Implement invitation flows
  - [ ] Agent/admin can invite new users
  - [ ] Track invitation status (pending, accepted, rejected)
  - [ ] Generate secure invitation tokens
  - [ ] Handle token expiration
- [ ] Automated relationship creation
  - [ ] Create triggers for auto-linking invited users
  - [ ] Send welcome emails on acceptance
  - [ ] Set up proper workspace access
- [ ] Email integration
  - [ ] Send invitation emails with secure tokens
  - [ ] Welcome email templates
  - [ ] Email verification flow

### 3. Ticket Management
- [x] Create ticket form for users/customers
- [x] Ticket status management (New, Open, Pending, Solved, Closed)
- [ ] Ticket assignment system (assign to agents)
- [x] Ticket priority levels (Low, Medium, High)
- [x] Ticket viewing/updating interface for agents
- [ ] Internal notes for agent collaboration
- [ ] Full conversation history (customer & agent messages)
- [ ] Bulk operations for queue management (optional enhancement)

### 4. User Management & Roles
- [x] Authentication system (Supabase Auth)
- [ ] Role-based permissions (Admin, Agent, End-user)
- [ ] User profile management
  - [ ] Extended profile fields (full name, avatar, phone)
  - [ ] Profile editing interface
  - [ ] Contact preferences
- [ ] Workspace-specific user access
- [ ] Team management
  - [ ] Create/manage teams
  - [ ] Team-based ticket routing
  - [ ] Coverage schedules
  - [ ] Agent-customer relationships
- [ ] Skills-based routing (assign tickets based on agent skills)

### 5. Workspace Isolation (Multi-Tenant)
- [ ] Unique workspace creation with slugs
- [ ] Workspace-specific branding/configuration
- [x] Data isolation between workspaces (tenant-level RLS)
- [ ] Workspace management interface

## Technical Implementation

### Database & Backend (Supabase)
- [x] Create workspaces table
- [x] Create users table
- [x] Create tickets table
- [x] Create comments table
- [ ] Create additional tables
  - [ ] Invitations table
  - [ ] Team/relationship tables
  - [ ] User profiles table
- [x] Set up Supabase connection
- [x] Configure row-level security policies
  - [ ] RLS for invitations table
  - [ ] RLS for team/relationship tables
  - [ ] RLS for user profiles
- [x] Set up authentication hooks
- [ ] Database optimization
  - [ ] Add proper indexes (foreign keys, tokens)
  - [ ] Query performance tuning
  - [ ] Connection pooling setup
- [ ] Implement event-driven webhooks (optional)
- [ ] Configure vector storage (for AI knowledge base/query)

### Frontend (React + Vite + Bun)
- [x] Set up React with Vite
- [x] Configure TypeScript
- [x] Create main layout/navigation
- [x] Implement user authentication flows
- [ ] Build ticket management interface
  - [x] List view
  - [ ] Filtering and sorting
  - [ ] Detail view
- [ ] Create workspace-specific views
- [x] Add responsive design
- [ ] Integrate real-time updates (via Supabase realtime or similar)
- [ ] Add caching and realtime updates for Dashboard and TicketList components

### Deployment (AWS Amplify)
- [x] Set up AWS Amplify project
- [x] Configure build settings (bun run build → dist)
- [x] Set up environment variables (Supabase url/keys)
- [x] Configure continuous deployment
- [ ] Set up custom domain (optional)

## AI Integration (Week 2 Objectives)
- [ ] LLM-generated responses for tickets
- [ ] RAG-based knowledge retrieval (context for LLM)
- [ ] AI-driven ticket routing (agentic approach)
- [ ] Human-assisted suggestions/prepopulation
- [ ] AI-summarized ticket/system status for admins
- [ ] Learning system for repeated resolutions

## Customer Portal & Self-Service
- [ ] Customer ticket tracking portal (ticket view/update)
- [ ] Knowledge base (searchable FAQs, articles)
- [ ] AI-powered chatbot (auto-response & triage)
- [ ] Public/secured article support (for different user roles)

## Administrative Control & Reporting
- [ ] Dashboard with metrics (response times, resolution rates)
- [ ] Rule-based assignment & SLA monitoring
- [ ] Ticket escalations and routing intelligence
- [ ] Performance optimization (caching, query tuning)

## Future Enhancements
- [ ] Multi-channel support (Email, Chat, Social Media)
- [ ] Automation & workflows (automatic ticket assignment/escalation)
- [ ] Advanced analytics & reporting (agent performance, volume metrics)
- [ ] Additional languages & localization
- [ ] Audio/visual attachment support for tickets
- [ ] Multi-modal support (e.g., phone transcripts, voice to text)

## Test2Pass (T2P) Requirements
- [ ] Brainlift Documentation
  - [ ] Purpose
  - [ ] Experts
  - [ ] Spiky POVs
  - [ ] Knowledge Tree
  - [ ] External Resources (≥5 credible sources)
  - [ ] Impact on project/LLM behavior
- [ ] Video Walkthrough (3-5 minutes)
  - [ ] Public link for demonstration
  - [ ] End-to-end ticket lifecycle showcase
  - [ ] AI agent involvement demo (response, routing, escalation)
- [ ] Git Repository
  - [ ] High-quality, production-grade code
  - [ ] Automated testing (unit, integration, edge cases)
  - [ ] CI/CD pipeline with automated build/test/deploy
  - [ ] Passing autograder checks for style & formatting 