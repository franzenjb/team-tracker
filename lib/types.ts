export type Person = {
  id: string
  name: string
  role?: string | null
  email?: string | null
  skills?: string[] | null
  notes?: string | null
  created_at?: string
}

export type Project = {
  id: string
  name: string
  status: 'planned' | 'active' | 'paused' | 'complete'
  description?: string | null
  start_date?: string | null
  end_date?: string | null
  created_at?: string
}

export type Assignment = {
  id: string
  person_id: string
  project_id: string
  role?: string | null
  percent?: number | null
  start_date?: string | null
  end_date?: string | null
  notes?: string | null
  created_at?: string
}

export type ProjectNote = {
  id: string
  project_id: string
  person_id?: string | null
  content: string
  created_at: string
}

// Supabase database type definition
export type Database = {
  public: {
    Tables: {
      people: {
        Row: Person
        Insert: Omit<Person, 'id' | 'created_at'>
        Update: Partial<Omit<Person, 'id' | 'created_at'>>
      }
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'created_at'>
        Update: Partial<Omit<Project, 'id' | 'created_at'>>
      }
      assignments: {
        Row: Assignment
        Insert: Omit<Assignment, 'id' | 'created_at'>
        Update: Partial<Omit<Assignment, 'id' | 'created_at'>>
      }
      project_notes: {
        Row: ProjectNote
        Insert: Omit<ProjectNote, 'id' | 'created_at'>
        Update: Partial<Omit<ProjectNote, 'id' | 'created_at'>>
      }
    }
  }
}
