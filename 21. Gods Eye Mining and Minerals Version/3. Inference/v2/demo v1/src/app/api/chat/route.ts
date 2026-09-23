import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'

// ============================================================
// Multi-provider chat route
// Providers: zai (default, no key), openrouter, grok, openai, anthropic, gemini
// ============================================================

type Provider = 'zai' | 'openrouter' | 'grok' | 'openai' | 'anthropic' | 'gemini'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatRequestBody {
  messages: ChatMessage[]
  provider?: Provider
  apiKey?: string
  model?: string
  currentPage?: string
}

// ============================================================
// Load knowledge base (cached after first load)
// ============================================================
let knowledgeCache: string | null = null

async function loadKnowledge(): Promise<string> {
  if (knowledgeCache) return knowledgeCache
  try {
    const kbPath = path.join(process.cwd(), 'public', 'knowledge.json')
    const raw = await fs.readFile(kbPath, 'utf-8')
    const kb = JSON.parse(raw)
    const lines: string[] = []
    lines.push(`# ${kb.site_name}`)
    lines.push(`${kb.tagline}`)
    lines.push('')
    lines.push('## Pages')
    for (const p of kb.pages) {
      lines.push(`- [${p.title}](${p.url}) — ${p.description}`)
    }
    lines.push('')
    lines.push('## Categories (12 total)')
    for (const c of kb.categories) {
      lines.push(`- ${c.icon} ${c.title} (${c.source_count} sources) → ${c.url}`)
      lines.push(`  ${c.tagline}`)
    }
    lines.push('')
    lines.push('## Personas (60 total)')
    for (const p of kb.personas) {
      lines.push(`- ${p.icon} ${p.name} [stage: ${p.stage_name}] → ${p.url}`)
      lines.push(`  ${p.summary}`)
      lines.push(`  Sources (${p.sources.length}): ${p.sources.slice(0, 8).join(', ')}${p.sources.length > 8 ? '...' : ''}`)
      if (p.inference_titles.length) {
        lines.push(`  Inferences: ${p.inference_titles.join(' | ')}`)
      }
    }
    lines.push('')
    lines.push('## Combinations (10 total)')
    for (const c of kb.combinations) {
      lines.push(`- #${c.index} ${c.title} → ${c.url}`)
      lines.push(`  Sources: ${c.sources.join(', ')}`)
    }
    knowledgeCache = lines.join('\n')
    return knowledgeCache
  } catch (e) {
    console.error('Failed to load knowledge:', e)
    return ''
  }
}

const SYSTEM_PROMPT_TEMPLATE = `You are Atlas Voice, the AI assistant for the Mining Intelligence Atlas — a comprehensive documentation site covering 125 mining-intelligence data sources across 12 categories, 60 mining value-chain personas, and 10 cross-category insight combinations.

Your capabilities:
1. ANSWER questions about any source, persona, category, or combination in the atlas.
2. NAVIGATE the user to specific pages by emitting a navigation action.
3. RECOMMEND sources or personas for a user's task or role.
4. EXPLAIN how combinations of data sources produce specific insights.

# Navigation Protocol
When the user asks to go somewhere, open a page, show something, or you judge that navigating would help, include this exact line at the END of your response (on its own line):

NAVIGATE: <relative-url>

Examples:
- "Take me to the ESG page" → NAVIGATE: esg-environmental.html
- "Show me the Tailings Engineer persona" → NAVIGATE: personas.html#tailings-engineer
- "Open the combinations page" → NAVIGATE: combinations.html
- "Go home" → NAVIGATE: index.html
- "Show me mineral deposits" → NAVIGATE: mineral-deposits.html
- "Open the methodology page" → NAVIGATE: methodology.html

Use the URL field from the knowledge base below. If the user mentions a persona name, use the deep-link URL (personas.html#<id>). Only emit ONE NAVIGATE line per response. If you don't need to navigate, do not include the line.

# Response Style
- Be concise but informative. Aim for 2-4 sentences for simple questions, more for complex ones.
- When recommending sources, list them by name.
- When recommending personas, give the persona name and a one-line summary.
- When explaining combinations, mention which sources are combined and the key insight.
- Use natural spoken language — the user may be hearing this via TTS.
- Never use markdown headers or code blocks in your response — the output is spoken and shown in a chat bubble.
- If asked about something not in the atlas, say so and offer to navigate to the closest relevant page.

# Current Page Context
The user is currently on: {CURRENT_PAGE}

# Atlas Knowledge Base
{KNOWLEDGE_BASE}
`

// ============================================================
// Provider implementations
// ============================================================

async function callZai(messages: ChatMessage[]): Promise<string> {
  const ZAI = (await import('z-ai-web-dev-sdk')).default
  const zai = await ZAI.create()
  const completion = await zai.chat.completions.create({
    messages: messages as any,
    thinking: { type: 'disabled' },
  })
  return completion.choices[0]?.message?.content || ''
}

async function callOpenRouter(messages: ChatMessage[], apiKey: string, model: string): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://mining-atlas.local',
      'X-Title': 'Mining Intelligence Atlas',
    },
    body: JSON.stringify({ model, messages }),
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`OpenRouter ${res.status}: ${txt.slice(0, 200)}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

async function callGrok(messages: ChatMessage[], apiKey: string, model: string): Promise<string> {
  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, stream: false }),
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Grok ${res.status}: ${txt.slice(0, 200)}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

async function callOpenAI(messages: ChatMessage[], apiKey: string, model: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, stream: false }),
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`OpenAI ${res.status}: ${txt.slice(0, 200)}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

async function callAnthropic(messages: ChatMessage[], apiKey: string, model: string): Promise<string> {
  const systemMsg = messages.find(m => m.role === 'system')
  const otherMsgs = messages.filter(m => m.role !== 'system')
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: systemMsg?.content || '',
      messages: otherMsgs.map(m => ({ role: m.role, content: m.content })),
    }),
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Anthropic ${res.status}: ${txt.slice(0, 200)}`)
  }
  const data = await res.json()
  return data.content?.[0]?.text || ''
}

async function callGemini(messages: ChatMessage[], apiKey: string, model: string): Promise<string> {
  const systemMsg = messages.find(m => m.role === 'system')
  const contents = messages.filter(m => m.role !== 'system').map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      systemInstruction: systemMsg ? { parts: [{ text: systemMsg.content }] } : undefined,
      generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
    }),
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Gemini ${res.status}: ${txt.slice(0, 200)}`)
  }
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

const DEFAULT_MODELS: Record<Provider, string> = {
  zai: '',
  openrouter: 'anthropic/claude-3.5-sonnet',
  grok: 'grok-2-1212',
  openai: 'gpt-4o-mini',
  anthropic: 'claude-3-5-sonnet-20241022',
  gemini: 'gemini-1.5-flash',
}

// ============================================================
// Route handler
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json()
    const { messages, provider = 'zai', apiKey, model, currentPage = 'index.html' } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 })
    }

    const knowledge = await loadKnowledge()
    const systemPrompt = SYSTEM_PROMPT_TEMPLATE
      .replace('{CURRENT_PAGE}', currentPage)
      .replace('{KNOWLEDGE_BASE}', knowledge)

    const fullMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.filter(m => m.role !== 'system'),
    ]

    const useProvider: Provider = (provider as Provider) || 'zai'
    const selectedModel = model || DEFAULT_MODELS[useProvider]

    let responseText = ''
    try {
      if (useProvider === 'zai') {
        responseText = await callZai(fullMessages)
      } else if (useProvider === 'openrouter') {
        if (!apiKey) throw new Error('OpenRouter API key required')
        responseText = await callOpenRouter(fullMessages, apiKey, selectedModel)
      } else if (useProvider === 'grok') {
        if (!apiKey) throw new Error('Grok (xAI) API key required')
        responseText = await callGrok(fullMessages, apiKey, selectedModel)
      } else if (useProvider === 'openai') {
        if (!apiKey) throw new Error('OpenAI API key required')
        responseText = await callOpenAI(fullMessages, apiKey, selectedModel)
      } else if (useProvider === 'anthropic') {
        if (!apiKey) throw new Error('Anthropic API key required')
        responseText = await callAnthropic(fullMessages, apiKey, selectedModel)
      } else if (useProvider === 'gemini') {
        if (!apiKey) throw new Error('Gemini API key required')
        responseText = await callGemini(fullMessages, apiKey, selectedModel)
      } else {
        responseText = await callZai(fullMessages)
      }
    } catch (providerErr: any) {
      console.error(`Provider ${useProvider} failed, falling back to Z.ai:`, providerErr.message)
      try {
        responseText = await callZai(fullMessages)
      } catch (zaiErr: any) {
        return NextResponse.json({
          error: `Provider ${useProvider} failed (${providerErr.message}) and Z.ai fallback also failed (${zaiErr.message})`,
        }, { status: 502 })
      }
    }

    let navigateUrl: string | null = null
    let cleanResponse = responseText
    const navMatch = responseText.match(/NAVIGATE:\s*(\S+)/i)
    if (navMatch) {
      navigateUrl = navMatch[1].trim()
      cleanResponse = responseText.replace(navMatch[0], '').trim()
    }

    return NextResponse.json({
      response: cleanResponse,
      navigate: navigateUrl,
      provider: useProvider,
      model: selectedModel,
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
