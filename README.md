# HelpDesk Pro

A modern customer support platform built with React, TypeScript, and Supabase.

## Features

- 🎫 Smart ticket management
- 🔍 Full-text search with prefix matching
- 👥 Team collaboration
- 📝 Internal notes
- 🔐 Role-based access control
- 📊 Status and priority tracking
- 🤝 Team assignment
- 🔔 Real-time updates

## Prerequisites

- Bun
- Supabase CLI
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/NoahBPeterson/HelpDeskPro.git
cd HelpDeskPro
```

2. Install dependencies:
```bash
bun install
```

3. Set up Supabase:

   a. Create a new project at [Supabase](https://supabase.com)
   
   b. Install Supabase CLI if you haven't:
   ```bash
   bun install -g supabase
   ```
   
   c. Login to Supabase:
   ```bash
   supabase login
   ```
   
   d. Link your project (replace YOUR_PROJECT_REF with your project reference):
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   
   e. Push the database migrations:
   ```bash
   supabase db push
   ```

4. Set up environment variables:
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

5. Start the development server:
```bash
bun run dev
```

## Database Migrations

When making database changes:

1. Create a new migration:
```bash
supabase migration new your_migration_name
```

2. Edit the migration file in `supabase/migrations/`

3. Push the changes:
```bash
supabase db push
```

## Project Structure

- `/src` - Frontend React application
  - `/components` - Reusable React components
  - `/contexts` - React context providers
  - `/hooks` - Custom React hooks
  - `/lib` - Utility functions and configurations
  - `/pages` - Page components
  - `/types` - TypeScript type definitions
- `/supabase` - Database migrations and configurations
  - `/migrations` - SQL migration files
  - `/seed.sql` - Initial database seed data
- `/public` - Static assets
- `/docs` - Documentation files

## Development

- Run tests: `bun test`
- Build for production: `bun run build`
- Preview production build: `bun run preview`
- Lint code: `bun run lint`

## License

MIT License