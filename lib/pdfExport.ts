import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface ExportOptions {
  groupBy: 'none' | 'projectType' | 'person'
  sortBy: 'name' | 'date' | 'projectType'
  includeSkills: boolean
  includeRoles: boolean
  includeNotes: boolean
}

interface Person {
  id: string
  name: string
  role: string | null
  email: string | null
  skills: string[] | null
  notes: string | null
  created_at: string
}

interface Project {
  id: string
  name: string
  status: 'planned' | 'active' | 'paused' | 'complete'
  project_type: string | null
  description: string | null
  start_date: string | null
  end_date: string | null
  created_at: string
}

interface Assignment {
  id: string
  person_id: string
  project_id: string
  title: string | null
  status: string | null
  created_at: string
}

interface ProjectWithPeople extends Project {
  assignedPeople: Person[]
}

export function generatePDF(
  people: Person[],
  projects: Project[],
  assignments: Assignment[],
  options: ExportOptions
) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height
  let yPosition = 20

  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Team Tracker Report', pageWidth / 2, yPosition, { align: 'center' })

  yPosition += 10
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, pageWidth / 2, yPosition, { align: 'center' })

  // Summary Stats
  yPosition += 15
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Summary', 14, yPosition)

  yPosition += 7
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Total People: ${people.length}`, 14, yPosition)
  yPosition += 5
  doc.text(`Total Projects: ${projects.length}`, 14, yPosition)
  yPosition += 5
  doc.text(`Total Assignments: ${assignments.length}`, 14, yPosition)

  // Group projects by type for stats
  if (projects.length > 0) {
    const projectTypes = projects.reduce((acc, p) => {
      const type = p.project_type || 'Uncategorized'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    yPosition += 7
    doc.text('Projects by Type:', 14, yPosition)
    yPosition += 5
    Object.entries(projectTypes).forEach(([type, count]) => {
      doc.text(`  • ${type}: ${count}`, 14, yPosition)
      yPosition += 5
    })
  }

  yPosition += 10

  // Check if we need a new page
  if (yPosition > pageHeight - 40) {
    doc.addPage()
    yPosition = 20
  }

  // Create projects with assigned people
  const projectsWithPeople: ProjectWithPeople[] = projects.map(project => {
    const projectAssignments = assignments.filter(a => a.project_id === project.id)
    const assignedPeople = projectAssignments
      .map(a => people.find(p => p.id === a.person_id))
      .filter((p): p is Person => p !== undefined)

    return {
      ...project,
      assignedPeople
    }
  })

  // Export based on grouping option
  if (options.groupBy === 'projectType') {
    exportByProjectType(doc, people, projectsWithPeople, options, yPosition)
  } else if (options.groupBy === 'person') {
    exportByPerson(doc, people, projectsWithPeople, assignments, options, yPosition)
  } else {
    exportFlat(doc, people, projectsWithPeople, options, yPosition)
  }

  // Save the PDF
  const filename = `team-tracker-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}

function exportByProjectType(
  doc: jsPDF,
  people: Person[],
  projects: ProjectWithPeople[],
  options: ExportOptions,
  startY: number
) {
  // Group projects by type
  const projectsByType = projects.reduce((acc, project) => {
    const type = project.project_type || 'Uncategorized'
    if (!acc[type]) acc[type] = []
    acc[type].push(project)
    return acc
  }, {} as Record<string, ProjectWithPeople[]>)

  // Sort project types
  const sortedTypes = Object.keys(projectsByType).sort()

  let yPosition = startY

  sortedTypes.forEach((type, index) => {
    if (index > 0) {
      doc.addPage()
      yPosition = 20
    }

    // Section header
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(220, 38, 38) // Red color
    doc.text(type, 14, yPosition)
    yPosition += 2

    // Add a line under the header
    doc.setDrawColor(220, 38, 38)
    doc.setLineWidth(0.5)
    doc.line(14, yPosition, doc.internal.pageSize.width - 14, yPosition)
    yPosition += 8

    // Create table for this project type
    const tableData = projectsByType[type].map(project => {
      const peopleNames = project.assignedPeople.map(p => p.name).join(', ') || 'Unassigned'
      const row: any[] = [
        project.name,
        project.status,
        peopleNames
      ]

      if (options.includeSkills) {
        const allSkills = project.assignedPeople
          .flatMap(p => p.skills || [])
          .filter((v, i, a) => a.indexOf(v) === i) // unique
        row.push(allSkills.join(', ') || '-')
      }

      if (options.includeRoles) {
        const allRoles = project.assignedPeople
          .map(p => p.role)
          .filter((r): r is string => r !== null && r !== undefined)
          .filter((v, i, a) => a.indexOf(v) === i) // unique
        row.push(allRoles.join(', ') || '-')
      }

      if (options.includeNotes && project.description) {
        // Clean description (remove Power BI links and formatting)
        const cleanDesc = project.description
          .replace(/Power BI Link:.*?(?=\||$)/gi, '')
          .replace(/Workspace:.*?(?=\||$)/gi, '')
          .replace(/Developer:.*?(?=\||$)/gi, '')
          .replace(/\|/g, '')
          .trim()
        row.push(cleanDesc || '-')
      }

      return row
    })

    const headers: string[] = ['Project Name', 'Status', 'Assigned To']
    if (options.includeSkills) headers.push('Skills')
    if (options.includeRoles) headers.push('Roles')
    if (options.includeNotes) headers.push('Description')

    autoTable(doc, {
      startY: yPosition,
      head: [headers],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [37, 99, 235], // Blue
        fontSize: 10,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto' }
      },
      margin: { left: 14, right: 14 }
    })

    yPosition = (doc as any).lastAutoTable.finalY + 10
  })
}

function exportByPerson(
  doc: jsPDF,
  people: Person[],
  projects: ProjectWithPeople[],
  assignments: Assignment[],
  options: ExportOptions,
  startY: number
) {
  let yPosition = startY
  const pageHeight = doc.internal.pageSize.height

  people.forEach((person, personIndex) => {
    if (personIndex > 0 && yPosition > pageHeight - 60) {
      doc.addPage()
      yPosition = 20
    }

    // Person header
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(220, 38, 38)
    doc.text(person.name, 14, yPosition)
    yPosition += 2

    doc.setDrawColor(220, 38, 38)
    doc.setLineWidth(0.5)
    doc.line(14, yPosition, doc.internal.pageSize.width - 14, yPosition)
    yPosition += 8

    // Person details
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)

    if (person.email) {
      doc.text(`Email: ${person.email}`, 14, yPosition)
      yPosition += 5
    }

    if (options.includeRoles && person.role) {
      doc.text(`Roles: ${person.role}`, 14, yPosition)
      yPosition += 5
    }

    if (options.includeSkills && person.skills) {
      doc.text(`Skills: ${person.skills.join(', ')}`, 14, yPosition)
      yPosition += 5
    }

    if (options.includeNotes && person.notes) {
      doc.text(`Notes: ${person.notes}`, 14, yPosition)
      yPosition += 5
    }

    yPosition += 5

    // Person's projects
    const personAssignments = assignments.filter(a => a.person_id === person.id)
    const personProjects = personAssignments
      .map(a => projects.find(p => p.id === a.project_id))
      .filter((p): p is ProjectWithPeople => p !== undefined)

    if (personProjects.length > 0) {
      const tableData = personProjects.map(project => {
        const row: any[] = [
          project.name,
          project.status
        ]

        if (project.project_type) {
          row.push(project.project_type)
        }

        if (options.includeNotes && project.description) {
          const cleanDesc = project.description
            .replace(/Power BI Link:.*?(?=\||$)/gi, '')
            .replace(/Workspace:.*?(?=\||$)/gi, '')
            .replace(/Developer:.*?(?=\||$)/gi, '')
            .replace(/\|/g, '')
            .trim()
          row.push(cleanDesc || '-')
        }

        return row
      })

      const headers: string[] = ['Project Name', 'Status']
      if (personProjects.some(p => p.project_type)) headers.push('Type')
      if (options.includeNotes) headers.push('Description')

      autoTable(doc, {
        startY: yPosition,
        head: [headers],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [37, 99, 235],
          fontSize: 9,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        margin: { left: 14, right: 14 }
      })

      yPosition = (doc as any).lastAutoTable.finalY + 15
    } else {
      doc.setTextColor(100, 100, 100)
      doc.text('No projects assigned', 14, yPosition)
      yPosition += 15
    }
  })
}

function exportFlat(
  doc: jsPDF,
  people: Person[],
  projects: ProjectWithPeople[],
  options: ExportOptions,
  startY: number
) {
  // Sort projects
  let sortedProjects = [...projects]
  if (options.sortBy === 'name') {
    sortedProjects.sort((a, b) => a.name.localeCompare(b.name))
  } else if (options.sortBy === 'date') {
    sortedProjects.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } else if (options.sortBy === 'projectType') {
    sortedProjects.sort((a, b) => (a.project_type || '').localeCompare(b.project_type || ''))
  }

  // People section
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(220, 38, 38)
  doc.text('Team Members', 14, startY)
  startY += 2

  doc.setDrawColor(220, 38, 38)
  doc.setLineWidth(0.5)
  doc.line(14, startY, doc.internal.pageSize.width - 14, startY)
  startY += 8

  const peopleData = people.map(person => {
    const row: any[] = [person.name]

    if (person.email) row.push(person.email)
    if (options.includeRoles && person.role) row.push(person.role)
    if (options.includeSkills && person.skills) row.push(person.skills.join(', '))

    return row
  })

  const peopleHeaders: string[] = ['Name']
  if (people.some(p => p.email)) peopleHeaders.push('Email')
  if (options.includeRoles) peopleHeaders.push('Roles')
  if (options.includeSkills) peopleHeaders.push('Skills')

  autoTable(doc, {
    startY: startY,
    head: [peopleHeaders],
    body: peopleData,
    theme: 'striped',
    headStyles: {
      fillColor: [37, 99, 235],
      fontSize: 10,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    margin: { left: 14, right: 14 }
  })

  let yPosition = (doc as any).lastAutoTable.finalY + 15

  // Projects section
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(220, 38, 38)
  doc.text('Projects', 14, yPosition)
  yPosition += 2

  doc.setDrawColor(220, 38, 38)
  doc.setLineWidth(0.5)
  doc.line(14, yPosition, doc.internal.pageSize.width - 14, yPosition)
  yPosition += 8

  const projectsData = sortedProjects.map(project => {
    const peopleNames = project.assignedPeople.map(p => p.name).join(', ') || 'Unassigned'
    const row: any[] = [
      project.name,
      project.status,
      peopleNames
    ]

    if (project.project_type) row.push(project.project_type)

    if (options.includeNotes && project.description) {
      const cleanDesc = project.description
        .replace(/Power BI Link:.*?(?=\||$)/gi, '')
        .replace(/Workspace:.*?(?=\||$)/gi, '')
        .replace(/Developer:.*?(?=\||$)/gi, '')
        .replace(/\|/g, '')
        .trim()
      row.push(cleanDesc || '-')
    }

    return row
  })

  const projectHeaders: string[] = ['Project Name', 'Status', 'Assigned To']
  if (sortedProjects.some(p => p.project_type)) projectHeaders.push('Type')
  if (options.includeNotes) projectHeaders.push('Description')

  autoTable(doc, {
    startY: yPosition,
    head: [projectHeaders],
    body: projectsData,
    theme: 'striped',
    headStyles: {
      fillColor: [37, 99, 235],
      fontSize: 10,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    margin: { left: 14, right: 14 }
  })
}
