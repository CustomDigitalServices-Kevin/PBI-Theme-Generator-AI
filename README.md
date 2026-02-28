# PBI Theme Generator AI

Generate Power BI Desktop theme JSON files from a text description or brand image — powered by a multi-agent AI pipeline.

**[Live Demo](https://pbi-theme-generator.vercel.app)** | [Français](#fr)

---

## Features

- **Text or Image Input** — Describe your brand or upload a logo/style guide
- **6-Agent AI Pipeline** — Each step handled by a specialized Claude AI agent
- **WCAG AA Accessible** — Color palettes validated for contrast compliance
- **Live Preview** — See colors, fonts, and JSON before downloading
- **9 Languages** — FR, EN, ES, IT, PT, DE, ZH, AR, HI
- **Instant Download** — Get a ready-to-import `.json` theme file

## Architecture

```mermaid
graph TD
    A[User Input<br/>Text or Image] --> B[InputAnalyzerAgent<br/>Brand extraction]
    B --> C[ColorPaletteAgent<br/>8-color WCAG palette]
    B --> D[TypographyAgent<br/>Font selection]
    C --> E[ThemeBuilderAgent<br/>Full JSON assembly]
    D --> E
    E --> F[ValidatorAgent<br/>Schema validation]
    F --> G[ExplainerAgent<br/>Localized summary]
    G --> H[Download .json]

    style A fill:#6C63FF,color:#fff
    style H fill:#22c55e,color:#fff
```

Each agent is a standalone function calling Claude Sonnet via the Anthropic API. The orchestrator chains them via Server-Sent Events for real-time progress tracking.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI | Claude Sonnet 4.5 (Anthropic API) |
| i18n | next-intl (9 languages) |
| Deployment | Vercel |

## Quick Start

### Prerequisites

- **Node.js 18+** — [download here](https://nodejs.org/)
- **Anthropic API key** — required to run the AI agents

### How to get your API key

1. Go to [console.anthropic.com](https://console.anthropic.com/) and create an account
2. Navigate to **Settings > API Keys**
3. Click **Create Key** and copy the key (starts with `sk-ant-api03-...`)
4. Add credits in **Settings > Billing** (minimum $5 to start)

> **Important:** The API key is never stored on any server. It stays in your local `.env.local` file (for local dev) or in your Vercel environment variables (for deployment). The `.env.local` file is git-ignored and will never be committed.

### Installation

```bash
git clone https://github.com/CustomDigitalServices-Kevin/PBI-Theme-Generator-AI.git
cd PBI-Theme-Generator-AI
npm install
```

### Configuration

Copy the example env file and add your API key:

```bash
cp .env.example .env.local
```

Then open `.env.local` and replace the placeholder with your real key:

```env
# .env.local (this file is git-ignored — your key stays private)
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

### Deploy on Vercel

1. Fork or clone this repo
2. Import the project in [Vercel](https://vercel.com/new)
3. In **Settings > Environment Variables**, add:
   | Name | Value |
   |------|-------|
   | `ANTHROPIC_API_KEY` | `sk-ant-api03-your-key-here` |
4. Click **Deploy**

> Your API key is encrypted and stored securely by Vercel. It is never exposed in the client-side bundle.

## Project Structure

```
pbi-theme-generator/
├── app/
│   ├── api/generate/route.ts    # SSE endpoint — orchestrates agents
│   ├── [locale]/
│   │   ├── layout.tsx           # Localized root layout
│   │   └── page.tsx             # Main single-page UI
│   ├── layout.tsx               # Root layout (redirect)
│   └── globals.css              # Global styles
├── components/
│   ├── LanguageSelector.tsx     # 9-language dropdown
│   ├── InputZone.tsx            # Text/image input toggle
│   ├── PipelineTracker.tsx      # Real-time 6-step progress
│   ├── ColorPreview.tsx         # Color swatch grid
│   └── JsonPreview.tsx          # Collapsible JSON viewer
├── lib/agents/
│   ├── types.ts                 # Shared TypeScript types
│   ├── orchestrator.ts          # Agent pipeline (async generator)
│   ├── inputAnalyzer.ts         # Agent 1: Brand analysis
│   ├── colorPalette.ts          # Agent 2: WCAG color palette
│   ├── typography.ts            # Agent 3: Font selection
│   ├── themeBuilder.ts          # Agent 4: JSON assembly
│   ├── validator.ts             # Agent 5: Schema validation
│   └── explainer.ts             # Agent 6: Localized summary
├── i18n/
│   ├── routing.ts               # Locale routing config
│   └── request.ts               # Server-side locale resolution
├── messages/                    # Translation files (9 languages)
│   ├── en.json
│   ├── fr.json
│   └── ...
├── middleware.ts                 # next-intl locale middleware
├── .env.example
├── vercel.json
└── LICENSE (MIT)
```

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add `ANTHROPIC_API_KEY` in Environment Variables
4. Deploy

### Manual

```bash
npm run build
npm start
```

---

<a id="fr"></a>

## FR — Documentation en français

### Fonctionnalités

- **Saisie texte ou image** — Décrivez votre marque ou uploadez un logo
- **Pipeline de 6 agents IA** — Chaque étape gérée par un agent Claude spécialisé
- **Accessibilité WCAG AA** — Palettes de couleurs validées pour le contraste
- **Aperçu en direct** — Visualisez couleurs, polices et JSON avant téléchargement
- **9 langues** — FR, EN, ES, IT, PT, DE, ZH, AR, HI
- **Téléchargement instantané** — Obtenez un fichier `.json` prêt à importer

### Obtenir une clé API

1. Allez sur [console.anthropic.com](https://console.anthropic.com/) et créez un compte
2. Allez dans **Settings > API Keys**
3. Cliquez **Create Key** et copiez la clé (commence par `sk-ant-api03-...`)
4. Ajoutez des crédits dans **Settings > Billing** (minimum 5$ pour démarrer)

> **Important :** La clé API n'est jamais stockée sur un serveur. Elle reste dans votre fichier `.env.local` (en local) ou dans les variables d'environnement Vercel (en production). Le fichier `.env.local` est ignoré par git et ne sera jamais commité.

### Installation

```bash
git clone https://github.com/CustomDigitalServices-Kevin/PBI-Theme-Generator-AI.git
cd PBI-Theme-Generator-AI
npm install
cp .env.example .env.local
```

Ouvrez `.env.local` et remplacez le placeholder par votre clé :

```env
# .env.local (ce fichier est ignoré par git — votre clé reste privée)
ANTHROPIC_API_KEY=sk-ant-api03-votre-cle-ici
```

```bash
npm run dev
```

### Déploiement Vercel

1. Forkez ou clonez ce repo
2. Importez le projet dans [Vercel](https://vercel.com/new)
3. Dans **Settings > Environment Variables**, ajoutez :
   | Nom | Valeur |
   |-----|--------|
   | `ANTHROPIC_API_KEY` | `sk-ant-api03-votre-cle-ici` |
4. Cliquez **Deploy**

---

MIT License — Built with Claude AI
