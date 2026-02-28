export interface BrandAnalysis {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  tone: 'corporate' | 'playful' | 'minimal' | 'bold' | 'elegant'
  industry: string
  mood: string
  description: string
}

export interface ColorPalette {
  dataColors: string[]
  background: string
  foreground: string
  tableAccent: string
  hyperlink: string
  headerBackground: string
  headerForeground: string
  selectionColor: string
  contrastRatios: { color: string; ratio: number; passesAA: boolean }[]
}

export interface TypographyConfig {
  fontFamily: string
  fontSize: number
  headerFontFamily: string
  headerFontSize: number
  titleFontSize: number
  labelFontSize: number
}

export interface PowerBITheme {
  name: string
  dataColors: string[]
  background: string
  foreground: string
  tableAccent: string
  maximum: string
  center: string
  minimum: string
  header: string
  headerForeground: string
  hyperlink: string
  selection: string
  good: string
  neutral: string
  bad: string
  textClasses: {
    callout: { fontSize: number; fontFace: string; color: string }
    title: { fontSize: number; fontFace: string; color: string }
    header: { fontSize: number; fontFace: string; color: string }
    label: { fontSize: number; fontFace: string; color: string }
  }
  visualStyles: Record<string, unknown>
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  fixedTheme?: PowerBITheme
}

export interface ThemeExplanation {
  summary: string
  colorChoices: string
  typographyChoices: string
  accessibilityNotes: string
}

export type AgentStep =
  | 'input-analysis'
  | 'color-palette'
  | 'typography'
  | 'theme-building'
  | 'validation'
  | 'explanation'

export interface AgentStatus {
  step: AgentStep
  status: 'pending' | 'running' | 'done' | 'error'
  message?: string
}

export interface OrchestratorResult {
  theme: PowerBITheme
  palette: ColorPalette
  explanation: ThemeExplanation
}

export interface GenerateRequest {
  input: string
  inputType: 'text' | 'image'
  imageBase64?: string
  locale: string
}
