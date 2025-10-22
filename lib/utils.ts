// Utility functions for the app

export function extractPowerBILink(description: string | null): string | null {
  if (!description) return null
  
  // Look for any dashboard/resource links with generic parsing
  const linkPatterns = [
    /Power BI Link:\s*(https?:\/\/[^\s|]*)/i,
    /ArcGIS Link:\s*(https?:\/\/[^\s|]*)/i,
    /SharePoint Link:\s*(https?:\/\/[^\s|]*)/i,
    /Tableau Link:\s*(https?:\/\/[^\s|]*)/i,
    /Dashboard Link:\s*(https?:\/\/[^\s|]*)/i
  ]
  
  for (const pattern of linkPatterns) {
    const match = description.match(pattern)
    if (match) return match[1]
  }
  
  return null
}

export function cleanDescription(description: string | null): string {
  if (!description) return 'No description'
  
  // Split by | and filter out links and metadata
  const parts = description.split(' | ').filter(Boolean)
  const cleanParts = parts.filter(part => 
    !part.includes('Power BI Link:') && 
    !part.includes('ArcGIS Link:') && 
    !part.includes('SharePoint Link:') && 
    !part.includes('Tableau Link:') && 
    !part.includes('Dashboard Link:') && 
    !part.includes('Workspace:') &&
    !part.includes('Developer:') &&
    !part.includes('Tags:') &&
    part.trim().length > 0
  )
  
  return cleanParts.join(' • ') || 'Project Resource'
}