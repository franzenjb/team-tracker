# Jim's Team Tracker

A modern, web-based team and project management system - your Microsoft Access replacement for the 21st century!

**Live App:** https://team-tracker-r3z0mrjz1-jbf-2539-e1ec6bfb.vercel.app
**GitHub:** https://github.com/franzenjb/team-tracker
**Built:** October 2025

## Quick Reference

- **Deployed on:** Vercel (auto-deploys from GitHub)
- **Database:** Supabase (PostgreSQL)
- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS
- **Language:** TypeScript

## Features

- **People Management**: Track team members, their roles, skills, and contact information
- **Project Management**: Manage projects with statuses, dates, and descriptions
- **Assignments**: Link people to projects with roles, time allocation, and dates
- **Notes**: Keep project notes and updates organized
- **Cross-platform**: Works on Mac, Windows, Linux - any device with a browser
- **Collaborative**: Multiple team members can access and update simultaneously
- **Modern UI**: Clean, responsive design that works on desktop, tablet, and mobile

## Tech Stack

- **Frontend**: Next.js 15 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier available at [supabase.com](https://supabase.com))

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to finish setting up (takes 1-2 minutes)
4. Go to **Settings** → **API** and copy:
   - Project URL
   - Anon/Public key

### 2. Set Up the Database

1. In your Supabase project, go to the **SQL Editor**
2. Open the file `supabase/schema.sql` from this project
3. Copy all the SQL code and paste it into the Supabase SQL Editor
4. Click **Run** to create all tables and sample data

### 3. Clone and Configure the Project

```bash
# Clone this repository (or download it)
cd team-tracker

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
```

### 4. Add Your Supabase Credentials

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## Project Structure

```
team-tracker/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Dashboard
│   ├── people/            # People management
│   ├── projects/          # Project management
│   ├── assignments/       # Assignment linking
│   ├── notes/             # Project notes
│   ├── layout.tsx         # Root layout with navigation
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── PersonForm.tsx
│   ├── ProjectForm.tsx
├── lib/                   # Utilities and configuration
│   ├── supabase.ts        # Supabase client
│   └── types.ts           # TypeScript types
├── supabase/              # Database
│   └── schema.sql         # Database schema
└── package.json
```

## Database Schema

The app uses four main tables:

1. **people**: Team members with roles, skills, and contact info
2. **projects**: Projects with status, dates, and descriptions
3. **assignments**: Links between people and projects
4. **project_notes**: Notes and updates for projects

Relationships:
- One person can have many assignments
- One project can have many assignments
- One project can have many notes
- Notes can optionally reference a person (author)

## Deployment to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click **Import Project** and select your GitHub repository
4. Add your environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**

Your app will be live in minutes with a URL like `your-app.vercel.app`!

## Usage Guide

### Adding People

1. Go to the **People** page
2. Click **Add Person**
3. Fill in name (required), role, email, skills (comma-separated), and notes
4. Click **Create**

### Adding Projects

1. Go to the **Projects** page
2. Click **Add Project**
3. Fill in project details and select a status
4. Click **Create**

### Assigning People to Projects

1. Go to the **Assignments** page
2. Click **Add Assignment**
3. Select a person and project
4. Optionally add their role, time allocation (%), and dates
5. Click **Create**

### Adding Notes

1. Go to the **Notes** page
2. Click **Add Note**
3. Select a project and optionally an author
4. Write your note content
5. Click **Create**

## How to Make Changes

### Editing the Code

1. **Clone the repo locally:**
   ```bash
   git clone https://github.com/franzenjb/team-tracker.git
   cd team-tracker
   npm install
   ```

2. **Make your changes** in any code editor (VS Code, Cursor, etc.)

3. **Test locally:**
   ```bash
   npm run dev
   # Visit http://localhost:3000
   ```

4. **Deploy changes:**
   ```bash
   git add .
   git commit -m "Description of your changes"
   git push
   ```
   Vercel will automatically redeploy within 2-3 minutes!

### Common Edits

**Change the title/branding:**
- Edit `app/layout.tsx` (line 6 and 24)
- Edit `app/page.tsx` (line 39)

**Change styling/colors:**
- Edit `app/globals.css` for global styles
- Edit individual page files for component-specific styles

**Add/modify database fields:**
- Run SQL in Supabase SQL Editor to alter tables
- Update types in `lib/types.ts`
- Update forms in `components/` folder

**Change form behavior:**
- People form: `components/PersonForm.tsx`
- Project form: `components/ProjectForm.tsx`
- Assignments: `app/assignments/page.tsx`
- Notes: `app/notes/page.tsx`

## Security & Access Control

The current setup allows anyone with the URL to access the data. For production use, you should:

1. Enable Supabase Auth (email/password, Google, etc.)
2. Update Row-Level Security (RLS) policies in Supabase
3. Add authentication to the Next.js app

See [Supabase Auth docs](https://supabase.com/docs/guides/auth) for details.

## Customization

### Changing Colors

Edit the button colors in the component files or add custom colors to `tailwind.config.ts`.

### Adding Fields

1. Add columns to Supabase tables via SQL Editor
2. Update TypeScript types in `lib/types.ts`
3. Update form components to include new fields

### Adding Features

- Export to CSV/Excel
- File attachments for projects
- Time tracking
- Gantt charts
- Email notifications

## Troubleshooting

### "Failed to fetch" errors

- Check that your `.env.local` has the correct Supabase URL and key
- Make sure you ran the schema.sql in Supabase
- Verify Row-Level Security policies allow access

### Build errors

- Run `npm install` to ensure all dependencies are installed
- Check that Node.js version is 18+
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

### Data not showing up

- Check the browser console for errors
- Verify tables were created in Supabase (SQL Editor → Tables)
- Make sure RLS policies allow reading data

## Contributing

This is a starter project - feel free to customize it for your team's needs!

## License

MIT

## Support

For issues or questions:
- Check the [Next.js docs](https://nextjs.org/docs)
- Check the [Supabase docs](https://supabase.com/docs)
- Search for solutions on GitHub Issues or Stack Overflow

---

## Complete Project Overview

### What This Project Is

Jim's Team Tracker is a full-stack web application that replaces Microsoft Access for team and project management. It's accessible from any device with a web browser and allows multiple people to collaborate in real-time.

### The Complete Technology Stack

#### Frontend (What Users See)
- **Next.js 15** - React framework that handles routing, server-side rendering, and optimization
- **React 18** - UI library for building interactive components
- **TypeScript** - Adds type safety to JavaScript
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Location**: All frontend code lives in the `app/` and `components/` folders

#### Backend (Data & Logic)
- **Supabase** - PostgreSQL database hosted in the cloud
- **Supabase Client** - JavaScript library that connects the app to the database
- **Location**: Database configuration in `lib/supabase.ts`, schema in `supabase/schema.sql`

#### Deployment & Hosting
- **Vercel** - Hosting platform that auto-deploys from GitHub
- **GitHub** - Version control and code repository
- **Location**:
  - Code: https://github.com/franzenjb/team-tracker
  - Live app: https://team-tracker-r3z0mrjz1-jbf-2539-e1ec6bfb.vercel.app

### How Everything Connects

```
┌─────────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                           │
│  (Chrome, Safari, Firefox - any device)                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ HTTPS Request
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL (Hosting)                         │
│  - Serves the Next.js app                                   │
│  - Auto-deploys when you push to GitHub                    │
│  - URL: team-tracker-xxx.vercel.app                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Data requests
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE (Database)                            │
│  - PostgreSQL database                                      │
│  - Stores people, projects, assignments, notes             │
│  - Project: xnwzwppmknnyawffkpry.supabase.co              │
└─────────────────────────────────────────────────────────────┘

                      ▲
                      │ You make changes
                      │
┌─────────────────────────────────────────────────────────────┐
│                 GITHUB (Code Storage)                       │
│  - Stores all source code                                   │
│  - Version history of all changes                          │
│  - Triggers Vercel deployment on push                      │
│  - Repo: franzenjb/team-tracker                            │
└─────────────────────────────────────────────────────────────┘
```

### What Each File/Folder Does

#### `app/` - The Application Pages
- `app/page.tsx` - **Dashboard/Homepage** - shows stats and recent activity
- `app/layout.tsx` - **Site-wide wrapper** - navigation bar and page structure
- `app/globals.css` - **Global styles** - colors, fonts, input styling
- `app/people/page.tsx` - **People page** - list and manage team members
- `app/projects/page.tsx` - **Projects page** - list and manage projects
- `app/assignments/page.tsx` - **Assignments page** - link people to projects
- `app/notes/page.tsx` - **Notes page** - project notes and updates

#### `components/` - Reusable Form Components
- `PersonForm.tsx` - Form for adding/editing people
- `ProjectForm.tsx` - Form for adding/editing projects

#### `lib/` - Configuration & Types
- `supabase.ts` - Database connection setup
- `types.ts` - TypeScript definitions for data structures

#### `supabase/` - Database
- `schema.sql` - SQL code to create all database tables

#### Root Configuration Files
- `package.json` - Lists all dependencies (libraries the app needs)
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `next.config.js` - Next.js configuration
- `.env.local` - Environment variables (Supabase credentials) - **NOT in GitHub**
- `.gitignore` - Files to exclude from GitHub

### The Data Flow (What Happens When You Click "Add Person")

1. **User fills out form** → `components/PersonForm.tsx` handles the input
2. **User clicks "Create"** → Form calls `supabase.from('people').insert()`
3. **Request goes to Supabase** → Data is validated and inserted into the database
4. **Success response** → Page refreshes and calls `supabase.from('people').select()`
5. **Data comes back** → React renders the updated list with the new person

### Where Your Data Lives

**Database Tables (in Supabase):**
- `people` - Team members (name, role, email, skills, notes)
- `projects` - Projects (name, description, status, dates)
- `assignments` - Links people to projects (person_id, project_id, role, %)
- `project_notes` - Notes about projects (project_id, content, author)

**Access the database:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "Table Editor" to view/edit data
4. Click "SQL Editor" to run queries

### Key Locations & Credentials

| What | Where | How to Access |
|------|-------|---------------|
| **Live App** | Vercel | https://team-tracker-r3z0mrjz1-jbf-2539-e1ec6bfb.vercel.app |
| **Source Code** | GitHub | https://github.com/franzenjb/team-tracker |
| **Database** | Supabase | https://supabase.com/dashboard → xnwzwppmknnyawffkpry |
| **Local Code** | MacBook | `~/team-tracker/` |
| **Deployment** | Vercel Dashboard | https://vercel.com/dashboard |

### Environment Variables (Secrets)

These connect your app to Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=https://xnwzwppmknnyawffkpry.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (long string)
```

**Where they're stored:**
- Locally: `~/team-tracker/.env.local` (NOT in GitHub)
- Production: Vercel Dashboard → Project Settings → Environment Variables
- To view in Vercel: `cd ~/team-tracker && vercel env ls`

### How Auto-Deployment Works

1. You make changes to code locally
2. You run `git push` to send changes to GitHub
3. GitHub notifies Vercel "new code available"
4. Vercel automatically:
   - Downloads the new code
   - Runs `npm install` to get dependencies
   - Runs `npm run build` to compile the app
   - Deploys to production URL
   - Takes 2-3 minutes total

### Development Workflow

**Making a change:**
```bash
# 1. Edit files in your code editor
# 2. Test locally
cd ~/team-tracker
npm run dev
# Visit http://localhost:3000

# 3. Commit and deploy
git add .
git commit -m "What you changed"
git push
# Vercel auto-deploys in 2-3 minutes
```

### Costs (All Free Tier)

- **GitHub**: Free for public repositories
- **Vercel**: Free (100GB bandwidth/month, unlimited deployments)
- **Supabase**: Free (500MB database, 2GB bandwidth/month)
- **Total monthly cost**: $0 (unless you exceed free tier limits)

### Technologies You Should Know About

**If you want to make changes, learn these:**
1. **React/TypeScript** - For UI components and logic
2. **Tailwind CSS** - For styling/colors
3. **SQL** - For database queries and schema changes
4. **Git** - For version control

**Helpful Resources:**
- [Next.js Tutorial](https://nextjs.org/learn)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Supabase Quickstart](https://supabase.com/docs/guides/getting-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

Built with ❤️ as a modern replacement for Microsoft Access
