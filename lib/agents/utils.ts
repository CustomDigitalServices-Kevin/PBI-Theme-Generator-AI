/**
 * Extract and parse JSON from an LLM response that may contain markdown fences
 * or trailing text after the JSON object.
 */
export function parseJsonResponse<T>(raw: string): T {
  let cleaned = raw.trim()

  // Strip markdown code fences if present
  const fenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim()
  }

  // Try direct parse first
  try {
    return JSON.parse(cleaned) as T
  } catch {
    // Find the outermost JSON object by matching braces
    const start = cleaned.indexOf('{')
    if (start === -1) throw new Error('No JSON object found in response')

    let depth = 0
    let end = -1
    for (let i = start; i < cleaned.length; i++) {
      if (cleaned[i] === '{') depth++
      else if (cleaned[i] === '}') {
        depth--
        if (depth === 0) { end = i; break }
      }
    }

    if (end === -1) throw new Error('Unclosed JSON object in response')
    return JSON.parse(cleaned.slice(start, end + 1)) as T
  }
}
