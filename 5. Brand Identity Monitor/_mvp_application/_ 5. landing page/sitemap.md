

# BrandWatch Africa — Marketing SaaS Landing Site Sitemap

A complete marketing site sitemap modeled after Brand24, adapted to BrandWatch Africa's actual feature set (radio + social + news monitoring, sentiment analysis, community risk, ESG reporting, field observation, AI briefs, knowledge graph). All routes below are marketing-site routes (separate from the in-app hash routes like `dashboard/executive`).

---

## Top-Level Navigation (Header Mega Menu)

```
[Logo]  Product   Features   Solutions   AI   Use Cases   Pricing   Resources   [Login] [Start Free Trial]
```

---

## 1. Product (`/product`)

The product overview hub — a landing page that links to persona-specific and capability-specific sub-pages.

### Route Tree

```
/product
├── /product/overview                    "One platform. Every signal that matters."
├── /product/dashboard                   Executive & analyst dashboards
├── /product/mention-feed                Real-time mention feed
├── /product/alerts                      Alert queue + incident war room
├── /product/knowledge-graph             Interactive knowledge graph
├── /product/community-risk              Community heatmap & field observations
├── /product/reports                     Report builder + ESG + regulatory
└── /product/integrations                Slack, Teams, Salesforce, API
```

### Page Content Highlights

| Route | H1 | Sub-headline | Key visuals |
|-------|-----|--------------|-------------|
| `/product/overview` | "Listen to every voice that matters" | Radio, news, and social — unified in one intelligence platform built for Africa. | Hero video loop of dashboard |
| `/product/dashboard` | "Your command center" | Executive KPIs, analyst workspace, AI daily brief — all in one view. | Screenshot of executive dashboard + AI brief card |
| `/product/mention-feed` | "Never miss a mention" | Real-time feed across radio, news, Twitter/X, Facebook, YouTube. Filter by sentiment, source, reach. | Animated GIF of live feed |
| `/product/alerts` | "Alerts that escalate themselves" | Define rules once. Get notified via email, Slack, SMS — auto-escalate to war room. | Screenshot of alert queue + war room chat |
| `/product/knowledge-graph` | "See the conversation, mapped" | Interactive force-directed graph. Drag nodes, group by topic, sentiment, source. | Interactive embedded mini-graph demo |
| `/product/community-risk` | "Know your communities" | Heatmap of risk scores across regions. Field officers log observations from mobile. | Heatmap of Ghana + field observation form |
| `/product/reports` | "Reports that write themselves" | Drag-and-drop builder, ESG disclosures (GRI/SASB/TCFD), regulatory tracker. | Report builder screenshot + export formats |
| `/product/integrations` | "Plays well with your stack" | Slack, Microsoft Teams, Salesforce, Zapier, webhook, full REST API. | Integration logos grid |

---

## 2. Features (`/features`)

Capability-level mega menu — each feature gets its own landing page with screenshots, use cases, and CTA.

### Route Tree

```
/features
├── /features/real-time-monitoring       Radio + social + news ingestion
├── /features/sentiment-analysis         Custom-trained model for Ghanaian English/Twi/Pidgin
├── /features/ai-daily-brief             AI-generated executive summary every morning
├── /features/brand-assistant            Conversational Q&A over your mentions
├── /features/ai-visibility              How AI assistants describe your brand
├── /features/knowledge-graph            Interactive mention graph
├── /features/social-mentions-graph      Sentiment-grouped social mentions
├── /features/transcript-browser         Searchable radio transcripts
├── /features/competitor-benchmarking    Share-of-voice vs peers
├── /features/query-builder              Visual boolean search
├── /features/alerts-and-incidents       Alert rules + war room
├── /features/community-registry         Track at-risk communities
├── /features/field-observation          Mobile forms for field officers
├── /features/esg-reporting              GRI/SASB/TCFD disclosure
├── /features/regulatory-tracker         Filing deadlines & compliance
├── /features/report-builder             Drag-and-drop report composer
├── /features/projects                   Multi-brand project workspaces
├── /features/map-view                   2D/3D geographic source map
└── /features/api-webhooks               REST API + webhooks + data exports
```

### Feature Page Template (each route follows this structure)

```
[Hero]
  H1: "{Feature name}"
  Sub: "{One-line value prop}"
  CTA: [Start free trial] [Book demo]

[Social proof]
  "Trusted by {N}+ brands across Ghana, Nigeria, Kenya"

[Screenshot / interactive demo]
  Large product screenshot or embedded live demo

[How it works — 3 steps]
  1. Connect your sources
  2. We listen 24/7
  3. You act on insight

[Key benefits — 4 cards]
  - Benefit 1
  - Benefit 2
  - Benefit 3
  - Benefit 4

[Use case examples]
  "See how {Customer} used {feature} to {outcome}"

[FAQ — accordion]
  Common questions about this feature

[Bottom CTA]
  "Ready to try {feature}?"
  [Start free trial]
```

---

## 3. Solutions (`/solutions`) — "For [Persona]"

Persona-specific landing pages that reframe features around each audience's pain points.

### Route Tree

```
/solutions
├── /solutions/enterprise                For Enterprise
├── /solutions/agencies                  For Agencies
├── /solutions/marketers                 For Marketers
├── /solutions/pr-professionals          For PR Professionals
└── /solutions/saas                      For SaaS Companies
```

### Persona Page Content

#### `/solutions/enterprise`
- **H1**: "Enterprise-grade intelligence for complex organisations"
- **Pain points addressed**: Multi-region monitoring, RBAC, SSO, audit trail, dedicated support
- **Features highlighted**: API + webhooks, audit trail, branch management, custom roles, ESG reporting, regulatory tracker
- **Social proof**: Logo wall of enterprise customers
- **CTA**: "Talk to sales" (not "Start free trial")

#### `/solutions/agencies`
- **H1**: "Manage multiple clients from one workspace"
- **Pain points**: Client reporting, white-label, multi-project, competitive benchmarking
- **Features highlighted**: Projects (per-client workspaces), report builder with exports, competitor benchmarking, shareable report links
- **Pricing tie-in**: "Agency plan includes 10 projects"

#### `/solutions/marketers`
- **H1**: "Know what people are saying — before it trends"
- **Pain points**: Hashtag tracking, campaign measurement, influencer identification
- **Features highlighted**: Mention feed, knowledge graph, social mentions graph, influencer tracking, hashtag search
- **Use case**: "Track campaign launch sentiment in real-time"

#### `/solutions/pr-professionals`
- **H1**: "Get ahead of the story"
- **Pain points**: Crisis management, media monitoring, spokesperson prep
- **Features highlighted**: Alert queue, incident war room, transcript browser, AI daily brief, quote extraction
- **Use case**: "Open a war room in 60 seconds when a story breaks"

#### `/solutions/saas`
- **H1**: "Listen to what users really think"
- **Pain points**: Feature request mining, churn signals, competitor feature gaps
- **Features highlighted**: Query builder, sentiment analysis, competitor benchmarking, AI visibility ("how AI assistants describe your product")
- **Use case**: "Find churn signals in social mentions before they become reviews"

---

## 4. AI Solutions (`/ai`)

Dedicated AI hub — BrandWatch Africa's AI features are a key differentiator.

### Route Tree

```
/ai
├── /ai/overview                         "All AI Solutions" — hub page
├── /ai/insights                         AI Daily Brief
├── /ai/brand-assistant                  Conversational Q&A
├── /ai/visibility                       AI Visibility (how AIs describe your brand)
└── /ai/sentiment-model                  Custom sentiment model (Ghanaian English/Twi/Pidgin)
```

### Page Content

| Route | H1 | What it shows |
|-------|-----|---------------|
| `/ai/overview` | "AI that listens, understands, and briefs you" | Hub page with 4 AI feature cards + video |
| `/ai/insights` | "Your AI daily brief, every morning at 9am" | Sample AI brief output + "what it covers" list |
| `/ai/brand-assistant` | "Ask anything about your brand" | Chat interface screenshot + sample Q&A |
| `/ai/visibility` | "How do AI assistants describe your brand?" | Sample visibility report + methodology |
| `/ai/sentiment-model` | "Sentiment that understands Twi" | Model card + accuracy comparison vs generic models |

---

## 5. Use Cases (`/use-cases`)

Outcome-focused pages — each shows how to achieve a specific goal with BrandWatch Africa.

### Route Tree

```
/use-cases
├── /use-cases/online-reputation-management    ORM
├── /use-cases/competitive-analysis            Competitor benchmarking
├── /use-cases/market-research                 Trend & share-of-voice
├── /use-cases/comprehensive-reports           Board packs + ESG + regulatory
├── /use-cases/customer-feedback               Field observation + forms
├── /use-cases/hashtag-search                  Social hashtag tracking
└── /use-cases/backlinks-checker               Source & mention authority checker
```

### Use Case Page Template

```
[Hero]
  H1: "{Use case name}"
  Sub: "{Outcome statement}"
  CTA: [See it in action]

[The challenge]
  "Without BrandWatch Africa, {use case} looks like..."

[The solution]
  "With BrandWatch Africa, {use case} looks like..."
  Screenshot of relevant feature

[Step-by-step playbook]
  1. Set up your sources
  2. Configure alerts / queries
  3. Monitor + analyze
  4. Report + act

[Results]
  "Customers who use this use case see {metric} improvement"

[Related features]
  Cards linking to /features/*

[Bottom CTA]
```

### Use Case → Feature Mapping

| Use Case | Primary Features Used |
|----------|----------------------|
| Online Reputation Management | Mention Feed, Alerts, Incident War Room, AI Daily Brief |
| Competitive Analysis | Competitor Benchmarking, Knowledge Graph, Projects |
| Market Research | Query Builder, Mention Feed, Sentiment Overview, Map View |
| Comprehensive Reports | Report Builder, ESG Reporting, Regulatory Tracker, Report Library |
| Customer Feedback | Field Observation, Forms, Public Submissions, Analytics |
| Hashtag Search | Query Builder, Social Mentions Graph, Mention Feed |
| Backlinks Checker | Source Health, Connect Sources, Mention Feed (source authority) |

---

## 6. Pricing (`/pricing`)

### Route Tree

```
/pricing
├── /pricing                              Main pricing page (3 tiers + enterprise)
├── /pricing/individual                   Individual / solo analyst
├── /pricing/team                         Team plan (most popular)
├── /pricing/agency                       Agency plan (multi-project)
├── /pricing/enterprise                   Custom enterprise
└── /pricing/faq                          Pricing FAQ
```

### Pricing Tiers

| Tier | Price | Mentions/mo | Projects | Sources | AI Brief | Key Feature |
|------|-------|-------------|----------|---------|----------|-------------|
| **Individual** | $49/mo | 5,000 | 1 | 5 | ✗ | Mention feed + alerts |
| **Team** | $149/mo | 25,000 | 5 | 20 | Daily | + Knowledge graph + reports |
| **Agency** | $399/mo | 100,000 | 25 | 50 | Daily | + White-label + API |
| **Enterprise** | Custom | Unlimited | Unlimited | Unlimited | Custom | + SSO + dedicated support + on-prem option |

---

## 7. Resources (`/resources`)

The content marketing + support hub.

### Route Tree

```
/resources
├── /resources/testimonials              Testimonials & Reviews
├── /resources/case-studies              Case Studies
├── /resources/help-center               Help Center (docs)
├── /resources/brand-checker             Free tool: check your brand's visibility
├── /resources/webinars                  Webinars + on-demand
├── /resources/partner-with-us           Partner program
├── /resources/partner-directory         Find a partner
└── /resources/blog                      Blog
```

### Resource Page Details

#### `/resources/testimonials`
- Customer quote cards (filterable by industry, region, company size)
- Star ratings
- Video testimonials
- G2/Capterra review badges
- "Read full story" → links to case study

#### `/resources/case-studies`
- Grid of case study cards (industry, outcome, metric)
- Filter by: Industry (Mining, Banking, Telecom, Govt), Outcome (Crisis prevention, ESG, Market entry), Region
- Each case study page: `/resources/case-studies/{slug}`
- Template: Challenge → Solution → Results (with metrics) → Quote

#### `/resources/help-center`
- Searchable docs (powered by Algolia or similar)
- Categories: Getting Started, Sources, Mentions, Alerts, Reports, AI, API, Account
- Each article: `/resources/help-center/{category}/{slug}`
- Video tutorials embedded
- "Was this helpful?" thumbs up/down

#### `/resources/brand-checker` (free lead-gen tool)
- **H1**: "How visible is your brand online?"
- Input: brand name
- Output: free mini-report (5 most recent mentions, sentiment snapshot, top source)
- CTA: "Get the full report — Start free trial"
- Email gate to see full results

#### `/resources/webinars`
- Upcoming webinars (with registration)
- On-demand library (filter by topic)
- Each webinar: `/resources/webinars/{slug}`
- Topics: "Crisis Communications in the Social Age", "ESG Reporting for African Mining", "Using AI for Brand Intelligence"

#### `/resources/partner-with-us`
- Partner program tiers: Referral, Reseller, Technology
- Benefits: Revenue share, co-marketing, training
- Application form
- Partner portal login link

#### `/resources/partner-directory`
- Searchable directory of certified partners
- Filter by: Country, Industry specialty, Services offered
- Each partner: `/resources/partner-directory/{slug}`

#### `/resources/blog`
- Blog post grid (filterable by topic)
- Topics: Brand Intelligence, Crisis Management, ESG, AI, Africa Tech, Case Studies
- Each post: `/resources/blog/{slug}`
- Author pages: `/resources/blog/author/{slug}`
- Newsletter signup

---

## 8. Footer Navigation

```
PRODUCT
  Overview · Features · AI Solutions · Use Cases · Pricing · Integrations · API Docs

SOLUTIONS
  Enterprise · Agencies · Marketers · PR · SaaS

RESOURCES
  Blog · Case Studies · Help Center · Webinars · Brand Checker · Partner Directory

COMPANY
  About · Careers · Press · Contact · Partner With Us

LEGAL
  Privacy Policy · Terms of Service · DPA · Security · Status

CONNECT
  Twitter/X · LinkedIn · YouTube · GitHub
```

---

## 9. Complete Route Tree (Flat List)

```
/                                         Homepage
/product                                  Product overview
/product/overview                         Product overview (alias)
/product/dashboard                        Dashboard
/product/mention-feed                     Mention feed
/product/alerts                           Alerts + war room
/product/knowledge-graph                  Knowledge graph
/product/community-risk                   Community risk
/product/reports                          Reports + ESG
/product/integrations                     Integrations

/features                                 Features hub
/features/real-time-monitoring            Real-time monitoring
/features/sentiment-analysis              Sentiment analysis
/features/ai-daily-brief                  AI daily brief
/features/brand-assistant                 Brand assistant
/features/ai-visibility                   AI visibility
/features/knowledge-graph                 Knowledge graph
/features/social-mentions-graph           Social mentions graph
/features/transcript-browser              Transcript browser
/features/competitor-benchmarking         Competitor benchmarking
/features/query-builder                   Query builder
/features/alerts-and-incidents            Alerts + incidents
/features/community-registry              Community registry
/features/field-observation               Field observation
/features/esg-reporting                   ESG reporting
/features/regulatory-tracker              Regulatory tracker
/features/report-builder                  Report builder
/features/projects                        Projects
/features/map-view                        Map view
/features/api-webhooks                    API + webhooks

/solutions                                Solutions hub
/solutions/enterprise                     For Enterprise
/solutions/agencies                       For Agencies
/solutions/marketers                      For Marketers
/solutions/pr-professionals              For PR Professionals
/solutions/saas                           For SaaS

/ai                                       AI solutions hub
/ai/overview                              All AI solutions
/ai/insights                              AI insights (daily brief)
/ai/brand-assistant                       Brand assistant
/ai/visibility                            AI visibility
/ai/sentiment-model                       Custom sentiment model

/use-cases                                Use cases hub
/use-cases/online-reputation-management   ORM
/use-cases/competitive-analysis           Competitive analysis
/use-cases/market-research                Market research
/use-cases/comprehensive-reports          Comprehensive reports
/use-cases/customer-feedback              Customer feedback
/use-cases/hashtag-search                 Hashtag search
/use-cases/backlinks-checker              Backlinks checker

/pricing                                  Pricing
/pricing/individual                       Individual plan
/pricing/team                             Team plan
/pricing/agency                           Agency plan
/pricing/enterprise                       Enterprise plan
/pricing/faq                              Pricing FAQ

/resources                                Resources hub
/resources/testimonials                   Testimonials & reviews
/resources/case-studies                   Case studies index
/resources/case-studies/{slug}            Individual case study
/resources/help-center                    Help center
/resources/help-center/{category}/{slug}  Help article
/resources/brand-checker                  Brand checker (free tool)
/resources/webinars                       Webinars
/resources/webinars/{slug}                Individual webinar
/resources/partner-with-us                Partner program
/resources/partner-directory              Partner directory
/resources/partner-directory/{slug}       Partner profile
/resources/blog                           Blog index
/resources/blog/{slug}                    Blog post
/resources/blog/author/{slug}             Author page

/about                                    About
/careers                                  Careers
/press                                    Press
/contact                                  Contact

/login                                    Login (→ app)
/signup                                   Start free trial (→ app)
/demo                                     Book a demo (form)

/legal/privacy                            Privacy policy
/legal/terms                              Terms of service
/legal/dpa                                Data processing agreement
/security                                 Security overview
/status                                   System status (public)
```

---

## 10. Homepage Structure (`/`)

The homepage ties it all together — here's the section breakdown:

```
[Header]
  Logo | Product | Features | Solutions | AI | Use Cases | Pricing | Resources | [Login] [Start Free Trial]

[Hero]
  H1: "Listen to every voice that matters"
  Sub: "Brand intelligence for Africa — radio, news, and social, unified."
  CTA: [Start free trial] [Book demo]
  Visual: Animated dashboard mockup

[Logo wall]
  "Trusted by leading brands across Africa"
  6-8 customer logos

[Problem statement]
  "The conversation is happening. Are you listening?"
  3 pain points: Radio call-ins go viral before you notice. Social threads resurface old incidents. Community grievances escalate without warning.

[Solution — 3 columns]
  Listen | Understand | Act
  Each with icon + 2-line description

[Feature highlights — 6 cards]
  - Real-time monitoring (radio + social + news)
  - AI daily brief
  - Knowledge graph
  - Community risk heatmap
  - Alerts + war room
  - ESG + regulatory reporting
  Each card → links to /features/*

[AI section]
  "AI that listens, understands, and briefs you"
  4 AI features: Daily Brief, Brand Assistant, AI Visibility, Sentiment Model
  CTA: "Explore AI solutions →" → /ai

[Use cases — 4 cards]
  - Crisis prevention
  - Competitive intelligence
  - ESG & compliance
  - Community relations
  Each → /use-cases/*

[Persona section]
  "Built for your role"
  5 personas: Enterprise, Agencies, Marketers, PR, SaaS
  Each → /solutions/*

[Testimonial carousel]
  3 customer quotes with photo + company

[Stats band]
  "1.2B+ mentions tracked | 9 radio stations | 3 countries | 99.9% uptime"

[Pricing teaser]
  "Starts at $49/mo" + 3-tier summary + "View all plans →"

[Final CTA]
  "Ready to listen?"
  [Start free trial] [Book demo]

[Footer]
  (as described in §8)
```

---

## 11. Navigation Mega Menu Structure (Desktop)

### "Product" mega menu (on hover)

```
┌─────────────────────────┬─────────────────────────┐
│  PLATFORM               │  WHAT YOU CAN DO        │
│  → Overview             │  → Monitor mentions     │
│  → Dashboard            │  → Set alerts           │
│  → Mention feed         │  → Map the conversation │
│  → Alerts & war room    │  → Track communities    │
│  → Knowledge graph      │  → Build reports        │
│  → Community risk       │  → Integrate via API    │
│  → Reports & ESG        │                          │
│  → Integrations         │                          │
└─────────────────────────┴─────────────────────────┘
```

### "Features" mega menu

```
┌──────────────┬──────────────┬──────────────┐
│  MONITORING  │  AI          │  ANALYSIS    │
│  Real-time   │  AI Brief    │  Sentiment   │
│  Mention feed│  Brand Asst  │  Knowledge   │
│  Transcripts │  AI Visib.   │   graph      │
│  Map view    │  Sentiment   │  Competitor  │
│  Sources     │   model      │   benchmark  │
│              │              │  Query builder│
├──────────────┼──────────────┼──────────────┤
│  ALERTS      │  REPORTS     │  COMMUNITY   │
│  Alert rules │  Report      │  Registry    │
│  War room    │   builder    │  Heatmap     │
│  Incidents   │  ESG report  │  Field obs   │
│              │  Regulatory  │  Forms       │
│              │  Library     │              │
└──────────────┴──────────────┴──────────────┘
```

### "Solutions" mega menu

```
┌─────────────────────────────────────────┐
│  FOR YOUR ROLE                          │
│  → Enterprise  → Agencies               │
│  → Marketers   → PR Professionals       │
│  → SaaS Companies                       │
└─────────────────────────────────────────┘
```

### "AI" mega menu

```
┌─────────────────────────┐
│  AI SOLUTIONS           │
│  → All AI solutions     │
│  → AI insights (brief)  │
│  → Brand assistant      │
│  → AI visibility        │
│  → Custom sentiment     │
└─────────────────────────┘
```

### "Use Cases" mega menu

```
┌─────────────────────────┐
│  WHAT YOU CAN ACHIEVE   │
│  → Reputation mgmt      │
│  → Competitive analysis │
│  → Market research      │
│  → Comprehensive reports│
│  → Customer feedback    │
│  → Hashtag search       │
│  → Backlinks checker    │
└─────────────────────────┘
```

### "Resources" mega menu

```
┌─────────────────┬─────────────────┐
│  LEARN          │  CONNECT        │
│  → Blog         │  → Partner with │
│  → Case studies │     us          │
│  → Webinars     │  → Partner      │
│  → Help center  │     directory   │
│  → Brand checker│  → Testimonials │
│                 │     & reviews   │
└─────────────────┴─────────────────┘
```

---

## 12. Mobile Navigation

Hamburger menu with accordion sections:

```
☰ Menu
  ▾ Product
    Overview / Dashboard / Mention feed / ...
  ▾ Features
    Real-time monitoring / Sentiment / AI / ...
  ▾ Solutions
    Enterprise / Agencies / Marketers / PR / SaaS
  ▾ AI
    All AI / Insights / Brand assistant / Visibility
  ▾ Use Cases
    ORM / Competitive / Market research / ...
  Pricing
  ▾ Resources
    Blog / Case studies / Help / Webinars / ...
  [Login]
  [Start free trial]
```

---

This sitemap maps Brand24's proven marketing structure onto BrandWatch Africa's actual feature set — every `/features/*` route corresponds to a real feature in the app, every `/use-cases/*` route maps to a workflow the product supports, and every `/solutions/*` route reframes the features for a specific buyer persona. The `/resources/brand-checker` free tool is the primary lead-gen hook, and the `/ai/*` section highlights the AI differentiators (daily brief, brand assistant, AI visibility, custom Ghanaian-language sentiment model).