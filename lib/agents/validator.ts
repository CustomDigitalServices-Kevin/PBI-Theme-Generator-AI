import type { AIExecutor } from '../ai/types'
import type { PowerBITheme, ValidationResult } from './types'
import { parseJsonResponse } from './utils'

const systemPrompt = `You are a Power BI theme JSON validator. Check the provided theme JSON against the official Power BI theme specification.

Validate:
1. All required top-level fields exist and are non-empty: name, dataColors, background, foreground, tableAccent, maximum, center, minimum, header, headerForeground, hyperlink, selection, good, neutral, bad
2. dataColors is an array of 6 to 10 hex strings (Power BI cycles through this list for chart series; too few makes multi-series charts ambiguous)
3. All color values are valid hex strings (#RRGGBB or #RGB) — flag any color that isn't, including if a color was accidentally left as a color name or an rgb()/hsl() string
4. Font families in textClasses are from Power BI's Windows-installed font set (Segoe UI, Segoe UI Semibold, Arial, Calibri, Cambria, Georgia, Tahoma, Verdana, Trebuchet MS, Courier New, Consolas, DIN, Helvetica Neue) — flag and replace any custom/web font with the closest match from this list
5. Font sizes are reasonable (8-72) and textClasses.title >= textClasses.header >= textClasses.callout is not required, but no fontSize should be 0, negative, or missing
6. textClasses has callout, title, header, label sub-objects, each with fontSize, fontFace, color
7. visualStyles is present and includes at least a visualStyles["*"]["*"] wildcard entry
8. No invalid, misspelled, or duplicate keys at the top level (e.g. "dataColor" instead of "dataColors")

If there are errors, fix them in place (adjust the minimal number of fields needed) and return the corrected theme. Do not fabricate an entirely new theme — preserve every field that already passes validation.

Return ONLY valid JSON:
{
  "isValid": true/false,
  "errors": ["error1", "error2"],
  "fixedTheme": { ... the corrected theme if there were errors, or the original if valid ... }
}`

export async function runValidator(executor: AIExecutor, theme: PowerBITheme): Promise<ValidationResult> {
  const text = await executor.complete({
    system: systemPrompt,
    userText: `Validate this Power BI theme JSON and fix any issues:\n\n${JSON.stringify(theme, null, 2)}`,
    maxTokens: 4000,
    schemaName: 'validation_result',
    // No `schema`: fixedTheme embeds a full PowerBITheme, same open-ended
    // visualStyles issue as themeBuilder — see lib/agents/schemas.ts.
  })

  return parseJsonResponse<ValidationResult>(text)
}
