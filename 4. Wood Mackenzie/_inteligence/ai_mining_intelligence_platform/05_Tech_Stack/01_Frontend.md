# Frontend Tech Stack

## Web Application

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.x | UI component library |
| **Next.js** | 15.x (App Router) | Full-stack React framework |
| **TypeScript** | 5.5+ | Type safety |
| **Tailwind CSS** | 3.4+ | Utility-first CSS |
| **shadcn/ui** | Latest | Headless UI components |
| **Radix UI** | Latest | Accessible primitives |

### State Management
| Technology | Purpose |
|------------|---------|
| **Zustand** | Global state (lightweight, no boilerplate) |
| **TanStack Query (React Query)** | Server state, caching, synchronization |
| **TanStack Table** | Data tables with sorting, filtering, pagination |
| **Zod** | Runtime schema validation |

### Data Visualization
| Technology | Purpose |
|------------|---------|
| **D3.js** | Custom interactive charts |
| **Recharts** | Standard chart types (line, bar, area) |
| **visx** | Airbnb's visualization library for complex charts |
| **Deck.gl** | Geospatial visualizations (mine maps, shipping routes) |
| **Mapbox GL JS** | Interactive maps with custom layers |

### Chat & Conversational UI
| Technology | Purpose |
|------------|---------|
| **Vercel AI SDK** | Streaming AI responses, chat UI components |
| **react-markdown** | Render AI responses as markdown |
| **react-syntax-highlighter** | Code blocks in AI responses |
| **framer-motion** | Smooth animations for chat interactions |

### Form & Input
| Technology | Purpose |
|------------|---------|
| **React Hook Form** | Performant form handling |
| **react-select** | Advanced dropdowns |
| **react-date-picker** | Date range selections |
| **react-dropzone** | File uploads (Excel, CSV, PDF) |

### Real-Time Features
| Technology | Purpose |
|------------|---------|
| **Socket.io** | Real-time alerts, live price updates |
| **Server-Sent Events (SSE)** | One-way streaming (price feeds, AI responses) |
| **Web Workers** | Background computation (large dataset processing) |

---

## Mobile Application

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Native** | 0.74+ | Cross-platform mobile (iOS/Android) |
| **Expo** | 51+ | Development framework, OTA updates |
| **React Navigation** | 6.x | Screen navigation |
| **Reanimated** | 3.x | Smooth animations |
| **React Native Maps** | Latest | Mine location maps |
| **React Native Chart Kit** | Latest | Mobile-optimized charts |

---

## Desktop Application

| Technology | Version | Purpose |
|------------|---------|---------|
| **Electron** | 30+ | Cross-platform desktop wrapper |
| **Tauri** | 2.0 (evaluating) | Lightweight Rust-based alternative |

---

## Build & Deployment

| Technology | Purpose |
|------------|---------|
| **Vercel** | Primary web deployment (edge network) |
| **GitHub Actions** | CI/CD pipelines |
| **Turborepo** | Monorepo management |
| **pnpm** | Fast, disk-space-efficient package manager |
| **ESLint + Prettier** | Code quality and formatting |
| **Husky** | Git hooks for pre-commit checks |
| **Playwright** | End-to-end testing |
| **Vitest** | Unit testing |
| **Storybook** | Component documentation and testing |

---

## Frontend Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Dashboard layout group
│   ├── (auth)/              # Auth pages
│   ├── api/                 # API routes (serverless)
│   └── layout.tsx           # Root layout
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── chat/                # Chat interface components
│   ├── charts/              # Data visualization
│   ├── maps/                # Geospatial components
│   ├── tables/              # Data tables
│   └── forms/               # Form components
├── hooks/                   # Custom React hooks
├── lib/                     # Utilities, API clients
├── stores/                  # Zustand stores
├── types/                   # TypeScript types
└── styles/                  # Global styles, Tailwind config
```

---

*Document Version: 1.0 | Date: June 2026*
