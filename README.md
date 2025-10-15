# Team Tracker

A modern, web-based team and project management system - your Microsoft Access replacement for the 21st century!

Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

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

Built with ❤️ as a modern replacement for Microsoft Access
