// Utility functions for the app

export function extractPowerBILink(description: string | null): string | null {
  if (!description) return null
  
  // Look for Power BI links with proper parsing
  const linkMatch = description.match(/Power BI Link:\s*(https?:\/\/app\.powerbi\.com[^\s|]*)/i)
  return linkMatch ? linkMatch[1] : null
}

export function cleanDescription(description: string | null): string {
  if (!description) return 'No description'
  
  // Split by | and filter out links and metadata
  const parts = description.split(' | ').filter(Boolean)
  const cleanParts = parts.filter(part => 
    !part.includes('Power BI Link:') && 
    !part.includes('Workspace:') &&
    !part.includes('Developer:') &&
    !part.includes('Tags:') &&
    part.trim().length > 0
  )
  
  return cleanParts.join(' • ') || 'Power BI Dashboard'
}