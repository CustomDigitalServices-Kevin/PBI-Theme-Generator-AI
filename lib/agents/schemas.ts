/**
 * JSON Schema definitions for the closed-shape agent outputs, used to
 * activate Mistral's strict Custom Structured Outputs mode
 * (responseFormat: { type: 'json_schema', jsonSchema: { schemaDefinition, strict: true } }).
 *
 * PowerBITheme (themeBuilder / validator) is intentionally excluded: its
 * visualStyles field is an open-ended, deeply-varying cascade
 * (Record<string, unknown> in lib/agents/types.ts) that doesn't fit a
 * strict closed schema. Those two agents use Mistral's JSON Mode
 * (responseFormat: { type: 'json_object' }) instead, which still
 * guarantees valid JSON without forcing a rigid nested shape — see
 * lib/ai/mistralClient.ts.
 */

export const brandAnalysisSchema = {
  type: 'object',
  properties: {
    primaryColor: { type: 'string' },
    secondaryColor: { type: 'string' },
    accentColor: { type: 'string' },
    tone: { type: 'string', enum: ['corporate', 'playful', 'minimal', 'bold', 'elegant'] },
    industry: { type: 'string' },
    mood: { type: 'string' },
    description: { type: 'string' },
  },
  required: ['primaryColor', 'secondaryColor', 'accentColor', 'tone', 'industry', 'mood', 'description'],
  additionalProperties: false,
}

export const colorPaletteSchema = {
  type: 'object',
  properties: {
    dataColors: { type: 'array', items: { type: 'string' } },
    background: { type: 'string' },
    foreground: { type: 'string' },
    tableAccent: { type: 'string' },
    hyperlink: { type: 'string' },
    headerBackground: { type: 'string' },
    headerForeground: { type: 'string' },
    selectionColor: { type: 'string' },
    contrastRatios: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          color: { type: 'string' },
          ratio: { type: 'number' },
          passesAA: { type: 'boolean' },
        },
        required: ['color', 'ratio', 'passesAA'],
        additionalProperties: false,
      },
    },
  },
  required: ['dataColors', 'background', 'foreground', 'tableAccent', 'hyperlink', 'headerBackground', 'headerForeground', 'selectionColor', 'contrastRatios'],
  additionalProperties: false,
}

export const typographyConfigSchema = {
  type: 'object',
  properties: {
    fontFamily: { type: 'string' },
    fontSize: { type: 'number' },
    headerFontFamily: { type: 'string' },
    headerFontSize: { type: 'number' },
    titleFontSize: { type: 'number' },
    labelFontSize: { type: 'number' },
  },
  required: ['fontFamily', 'fontSize', 'headerFontFamily', 'headerFontSize', 'titleFontSize', 'labelFontSize'],
  additionalProperties: false,
}

export const themeExplanationSchema = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    colorChoices: { type: 'string' },
    typographyChoices: { type: 'string' },
    accessibilityNotes: { type: 'string' },
  },
  required: ['summary', 'colorChoices', 'typographyChoices', 'accessibilityNotes'],
  additionalProperties: false,
}
