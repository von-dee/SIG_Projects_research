# Mining Intelligence Atlas

An interactive documentation site that maps **125 mining-intelligence data sources** across **12 categories**, **60 mining value-chain personas**, and **10 cross-category insight combinations** — wrapped in a voice-enabled AI assistant ("Atlas Voice") that can answer questions, recommend sources, and navigate the user around the site.

The site itself is a set of static HTML pages (generated from Python data modules), served by a Next.js app that also provides the chat and text-to-speech API routes.

---

## Contents

- 16 static pages: 1 home + 12 category pages + `personas` + `combinations` + `methodology`
- 125 sources (each with method: Static / Live / Keyed, plus format and usage notes)
- 60 personas across 13 value-chain stages (Exploration → Media)
- 10 worked multi-source "combination" workflows
- A knowledge base (`public/knowledge.json`, ~104 KB) that is injected into the LLM system prompt — no RAG/vector store required

---

## Features

| Feature                           | Description                                                                                                                                                |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Static atlas**            | Pre-rendered HTML pages with sidebar navigation, scroll-spy, search, source accordions, and per-category filtering (`public/js/main.js`)                 |
| **Atlas Voice widget**      | Floating chat panel available on every page (`public/js/voice-assistant.js`)                                                                             |
| **Voice output (TTS)**      | Premium Z.ai TTS via `/api/tts`; long answers are split at sentence boundaries and the returned WAV chunks are concatenated into one seamless audio file |
| **Voice input (STT)**       | Browser Web Speech API                                                                                                                                     |
| **Multi-provider chat**     | Z.ai (default, no key), OpenRouter, Grok (xAI), OpenAI, Anthropic, Gemini — with automatic Z.ai fallback                                                  |
| **Navigation protocol**     | The model emits `NAVIGATE: <url>` at the end of a reply; the widget strips it and moves the browser to that page after speech finishes                   |
| **Conversation continuity** | Chat history, panel state, and Live Session mode persist across page navigation via `sessionStorage`                                                     |
| **Live Session mode**       | Continuous, auto-listening conversation that survives page changes                                                                                         |

---

## Tech Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (Radix primitives) — available in `src/components/ui`, used by the Next app shell
- **Prisma 6** + **SQLite** — scaffolded `User` / `Post` models; the atlas itself is fully static
- **z-ai-web-dev-sdk** — default chat completion and TTS provider
- **bun** as package manager / runtime

---

## Project Structure

```
.
├── public/                     # The atlas (served statically)
│   ├── index.html              # Home — category overview
│   ├── personas.html           # 60 personas, deep-linkable via #<persona-id>
│   ├── combinations.html       # 10 multi-source insight workflows
│   ├── methodology.html        # Integration patterns & architecture
│   ├── <12 category pages>.html
│   ├── knowledge.json          # Compact KB injected into the system prompt
│   ├── css/styles.css, css/voice-assistant.css
│   └── js/main.js, js/voice-assistant.js
├── src/
│   ├── app/
│   │   ├── page.tsx            # Redirects / → /index.html
│   │   ├── layout.tsx
│   │   └── api/
│   │       ├── route.ts        # GET  /api        — health/hello
│   │       ├── chat/route.ts   # POST /api/chat   — multi-provider LLM
│   │       └── tts/route.ts    # POST /api/tts    — Z.ai TTS + WAV concat
│   ├── components/ui/          # shadcn/ui components
│   └── lib/                    # prisma client, utils
├── scripts/                    # Content generators (Python)
│   ├── source_data.py          # CATEGORIES (125 sources) + COMBINATIONS
│   ├── personas_data.py        # STAGES + PERSONAS (60)
│   ├── generate_docs.py        # Renders category/combination/methodology HTML
│   ├── generate_personas.py    # Renders personas.html
│   └── generate_knowledge.py   # Renders public/knowledge.json
├── prisma/schema.prisma        # SQLite datasource (User, Post)
├── db/custom.db                # Local SQLite database
├── examples/websocket/         # Optional WebSocket example (not wired in)
├── tests/                      # Runtime build test scripts
├── .zscripts/                  # Build / dev / deploy orchestration scripts
└── Caddyfile                   # Reverse proxy config (port 81 → 3000)
```

Note: the Python generators write to `/home/z/my-project/...` (sandbox paths) and are used to regenerate content offline — they are not required to run the site.

---

## Getting Started

### Prerequisites

- [bun](https://bun.sh) (`curl -fsSL https://bun.sh/install | bash`) — or Node.js 20+ with `npm`
- Git

### 1. Install dependencies

```bash
bun install
```

### 2. Configure the database URL

[.env](<file:///Users/selasie/Documents/GitHub/SIG_Projects_research/21.%20Gods%20Eye%20Mining%20and%20Minerals%20Version/3.%20Inference/v2/demo%20v1/.env>) ships with a sandbox path (`file:/home/z/my-project/db/custom.db`), which does not exist on a normal machine. Set it to the repo's `db/` folder:

```bash
# .env
DATABASE_URL="file:./db/custom.db"
```

### 3. Create the database

```bash
bun run db:push        # prisma db push --accept-data-loss + generates the client
```

### 4. Run the dev server

```bash
bun run dev            # next dev -p 3000
```

Open **http://localhost:3000** — `/` redirects to `/index.html`.

### 5. Production build & start

```bash
bun run build          # next build (standalone output) + copies static/public into .next/standalone
bun run start          # NODE_ENV=production bun .next/standalone/server.js
```

---

## Configuration

### Chat providers

`/api/chat` accepts a `provider` field. `zai` is the default and needs no key; the others require a key.

| Provider      | `provider`      | Default model                   | Key source                                    |
| ------------- | ----------------- | ------------------------------- | --------------------------------------------- |
| Z.ai          | `zai` (default) | SDK-managed                     | `.z-ai-config` in project / home / `/etc` |
| OpenRouter    | `openrouter`    | `anthropic/claude-3.5-sonnet` | user key                                      |
| Grok (xAI)    | `grok`          | `grok-2-1212`                 | user key                                      |
| OpenAI        | `openai`        | `gpt-4o-mini`                 | user key                                      |
| Anthropic     | `anthropic`     | `claude-3-5-sonnet-20241022`  | user key                                      |
| Google Gemini | `gemini`        | `gemini-1.5-flash`            | user key                                      |

Non-Z.ai keys are entered in the widget UI and stored in `localStorage` (see `DEFAULT_SETTINGS` in [voice-assistant.js](<file:///Users/selasie/Documents/GitHub/SIG_Projects_research/21.%20Gods%20Eye%20Mining%20and%20Minerals%20Version/3.%20Inference/v2/demo%20v1/public/js/voice-assistant.js#L17-L27>)). If a provider call fails, the route falls back to Z.ai. To use the default provider you must supply a `.z-ai-config` file — without it `/api/chat` returns `502`.

### TTS voices

Available Z.ai voices (set in the widget): `xiaochen` (default), `tongtong`, `jam`, `kazi`, `douji`, `luodo`.

---

## API Reference

### `GET /api`

Health/hello endpoint → `{"message":"Hello, world!"}`

### `POST /api/chat`

```jsonc
{
  "messages": [{ "role": "user", "content": "What is this site?" }],
  "provider": "zai",              // optional, default "zai"
  "apiKey": "",                   // required for non-zai providers
  "model": "",                    // optional model override
  "currentPage": "index.html"     // gives the assistant page context
}
```

Response:

```jsonc
{
  "response": "…answer without the NAVIGATE line…",
  "navigate": "esg-environmental.html",   // or null
  "provider": "zai",
  "model": ""
}
```

### `POST /api/tts`

```jsonc
{ "text": "…", "voice": "xiaochen", "speed": 1.0 }
```

Returns `audio/wav` — a single file reassembled from sentence-split chunks (see `buildWav` in [tts/route.ts](<file:///Users/selasie/Documents/GitHub/SIG_Projects_research/21.%20Gods%20Eye%20Mining%20and%20Minerals%20Version/3.%20Inference/v2/demo%20v1/src/app/api/tts/route.ts#L70-L93>)).

---

## Regenerating Content

Edit the data modules, then re-run the generators (they write into the sandbox paths noted above — adjust `OUT_DIR` if running elsewhere):

```bash
python scripts/generate_docs.py       # category / combination / methodology pages
python scripts/generate_personas.py   # personas.html
python scripts/generate_knowledge.py  # public/knowledge.json
```

---

## Deployment

`.zscripts/` contains the orchestration used by the hosting sandbox:

- `build.sh` — `bun install` → `bun run build` → collects standalone output, static assets, `public/`, Python runtime, and SQLite DB into a tarball
- `start.sh` — runs the standalone Next server on port 3000 and starts Caddy as the foreground process
- `dev.sh` — local dev loop (install → `db:push` → `next dev` → health check → mini-services)
- `mini-services-*.sh` — install/build/start any service found under `mini-services/` (currently empty)

[Caddyfile](<file:///Users/selasie/Documents/GitHub/SIG_Projects_research/21.%20Gods%20Eye%20Mining%20and%20Minerals%20Version/3.%20Inference/v2/demo%20v1/Caddyfile>) listens on `:81` and reverse-proxies to `localhost:3000`, with an `XTransformPort` query escape hatch for additional ports.

---

## Troubleshooting

| Symptom                                               | Fix                                                                                   |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `bun: command not found`                            | Install bun, or use `npm install` / `npx next dev -p 3000`                        |
| Prisma can't open the database                        | Point `DATABASE_URL` at a writable local path (see step 2)                          |
| `/api/chat` → `502 Configuration file not found` | Add `.z-ai-config`, or pick a provider and paste its API key in the widget settings |
| `/api/tts` → `500 TTS generation failed`         | Same Z.ai credentials issue                                                           |
| Standalone `server.js` missing after build          | `next.config.ts` must keep `output: "standalone"`                                 |

---

## Known Limitations

- Conversation state lives in `sessionStorage`/`localStorage` — it is per-tab and per-browser, not server-side.
- Speech recognition relies on the browser Web Speech API (best support in Chrome/Edge).
- The Prisma `User`/`Post` models are scaffold boilerplate and are not used by any atlas feature.
- `examples/websocket/` is a standalone reference, not wired into the app.
