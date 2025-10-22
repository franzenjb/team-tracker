// Utility functions for the app

export function extractPowerBILink(description: string | null): string | null {
  if (!description) return null
  
  // Look for Power BI links in the description
  const linkMatch = description.match(/https?:\/\/app\.powerbi\.com[^\s|]+/)
  return linkMatch ? linkMatch[0] : null
}

export function cleanDescription(description: string | null): string {
  if (!description) return 'No description'
  
  // Split by | and filter out links and metadata
  const parts = description.split(' | ').filter(Boolean)
  const cleanParts = parts.filter(part => 
    !part.includes('Link:') && 
    !part.includes('Workspace:') &&
    !part.includes('Developer:')
  )
  
  return cleanParts.join(' • ') || 'Power BI Dashboard'
}