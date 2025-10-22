# Assignments Export Design Plan

## Goal
Create comprehensive CSV and PDF exports for work assignments that include all relevant fields and relationships.

## Data Structure

### Assignment Fields (from database)
- **Core Info**: title, description, status, priority
- **People & Projects**: person_id → person.name, project_id → project.name
- **Timing**: start_date, end_date, due_date
- **Work Details**: role, percent (allocation), requester
- **Progress**: notes, created_at

### Export Fields (CSV & PDF)
1. Assignment Title
2. Person Name
3. Person Email
4. Project Name
5. Project Type
6. Status (pending, in_progress, complete, on_hold)
7. Priority (low, medium, high, urgent)
8. Due Date
9. Requester
10. Role
11. Allocation %
12. Description
13. Notes
14. Created Date

## CSV Export Format
```
Title,Person,Email,Project,Project Type,Status,Priority,Due Date,Requester,Role,Allocation %,Description,Notes,Created
"Update dashboard","Jim Manson","jim@redcross.org","Hurricane Planning","power-bi","in_progress","high","2025-01-15","Mary Smith","Power BI Developer","50","Fix data refresh issue","Working on it","2025-01-01"
```

## PDF Export Format

### Layout
- **Orientation**: Landscape (more columns)
- **Header**: "Work Assignments Report" with Red Cross branding
- **Summary**: Total assignments, breakdown by status and priority
- **Main Table**: All assignments with key fields
- **Sorting**: By status (Pending → In Progress → Complete → On Hold), then by priority

### Table Columns (PDF)
1. Person
2. Project
3. Title
4. Status (color-coded badge)
5. Priority (color-coded)
6. Due Date
7. Role
8. Requester

### Color Coding
- **Status**: Yellow (pending), Blue (in_progress), Green (complete), Red (on_hold)
- **Priority**: Red (urgent), Orange (high), Yellow (medium), Green (low)

## Implementation Pattern

### Data Fetching (separate queries for reliability)
```typescript
const [assignmentsResult, peopleResult, projectsResult] = await Promise.all([
  supabase.from('assignments').select('*'),
  supabase.from('people').select('*'),
  supabase.from('projects').select('*')
])

// Join manually in JavaScript
const enrichedAssignments = assignmentsResult.data.map(assignment => ({
  ...assignment,
  person_name: peopleData.find(p => p.id === assignment.person_id)?.name,
  person_email: peopleData.find(p => p.id === assignment.person_id)?.email,
  project_name: projectsData.find(p => p.id === assignment.project_id)?.name,
  project_type: projectsData.find(p => p.id === assignment.project_id)?.project_type
}))
```

### UI Integration
- Add "Export CSV" and "Export PDF" buttons next to "Add Assignment" button
- Same styling as People and Projects pages
- No complex dialog - simple click to export

## Success Criteria
- [ ] CSV includes all 14 fields
- [ ] PDF is readable and professionally formatted
- [ ] Red Cross branding in PDF header
- [ ] Color-coded status and priority in PDF
- [ ] Proper date formatting
- [ ] Handles empty/null values gracefully
- [ ] Error handling with user-friendly messages
- [ ] Works with existing assignments data

## File Changes Needed
- `/app/assignments/page.tsx` - Add export buttons and functions
- No new components needed (keep it simple)
