/* ============================================================
   Atlas Voice — Voice + Chat Widget (v2)
   - Persistent chat history across page navigation (sessionStorage)
   - Live Session mode: continuous conversation with auto-listen
   - TTS queue: navigation waits for speech to complete
   - Premium Z.ai TTS by default (xiaochen voice — natural/professional)
   - Web Speech API for STT; Z.ai for premium TTS
   ============================================================ */

(function () {
  'use strict'

  if (window.__atlasVoiceLoaded) return
  window.__atlasVoiceLoaded = true

  // ---------- Settings ----------
  const DEFAULT_SETTINGS = {
    provider: 'zai',
    apiKey: '',
    model: '',
    voiceOutput: true,
    premiumVoice: true, // default ON for natural voice
    autoListen: false,  // basic auto-listen (waits for response to finish, then listens)
    liveSession: false, // full live session mode (auto-listen + persistent across navigation)
    voiceSpeed: 1.0,
    voice: 'xiaochen', // default voice — steady & professional
  }

  function loadSettings() {
    try {
      const s = localStorage.getItem('atlas-voice-settings')
      return { ...DEFAULT_SETTINGS, ...(s ? JSON.parse(s) : {}) }
    } catch { return { ...DEFAULT_SETTINGS } }
  }
  function saveSettings(s) {
    localStorage.setItem('atlas-voice-settings', JSON.stringify(s))
  }

  // ---------- State ----------
  let settings = loadSettings()
  let recognition = null
  let isRecording = false
  let isThinking = false
  let isSpeaking = false
  let chatHistory = [] // {role, content}
  let currentAudio = null
  let pendingNavigation = null // URL to navigate to after speech finishes
  let ttsQueue = [] // array of {text, isLast}
  let liveSessionActive = false

  const PROVIDER_LABELS = {
    zai: 'Z.ai (default)',
    openrouter: 'OpenRouter',
    grok: 'Grok (xAI)',
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    gemini: 'Google Gemini',
  }

  const VOICE_OPTIONS = [
    { id: 'xiaochen', label: 'Xiaochen — Steady & Professional', lang: 'Natural English' },
    { id: 'tongtong', label: 'Tongtong — Warm & Friendly', lang: 'Natural English' },
    { id: 'jam', label: 'Jam — British Gentleman', lang: 'Natural English' },
    { id: 'kazi', label: 'Kazi — Clear & Standard', lang: 'Natural English' },
    { id: 'douji', label: 'Douji — Natural & Fluid', lang: 'Natural English' },
    { id: 'luodo', label: 'Luodo — Expressive', lang: 'Natural English' },
  ]

  // ---------- sessionStorage persistence ----------
  // Survives same-tab page navigation (so conversation continues across pages)
  function persistState() {
    try {
      sessionStorage.setItem('atlas-voice-history', JSON.stringify(chatHistory.slice(-20)))
      sessionStorage.setItem('atlas-voice-panel-open', $('va-panel')?.classList.contains('is-open') ? '1' : '0')
      sessionStorage.setItem('atlas-voice-live-session', liveSessionActive ? '1' : '0')
    } catch (e) { /* sessionStorage may be unavailable */ }
  }

  function loadPersistedState() {
    try {
      const hist = sessionStorage.getItem('atlas-voice-history')
      if (hist) chatHistory = JSON.parse(hist)
      const live = sessionStorage.getItem('atlas-voice-live-session')
      liveSessionActive = live === '1'
      const panelOpen = sessionStorage.getItem('atlas-voice-panel-open') === '1'
      return { hist: chatHistory, panelOpen, liveSession: liveSessionActive }
    } catch {
      return { hist: [], panelOpen: false, liveSession: false }
    }
  }

  function clearPersistedState() {
    try {
      sessionStorage.removeItem('atlas-voice-history')
      sessionStorage.removeItem('atlas-voice-panel-open')
      sessionStorage.removeItem('atlas-voice-live-session')
    } catch {}
  }

  // ---------- Inject HTML ----------
  function injectWidget() {
    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = 'css/voice-assistant.css'
    document.head.appendChild(css)

    const root = document.createElement('div')
    root.id = 'atlas-voice-root'
    root.innerHTML = `
      <button class="atlas-voice-launcher" id="va-launcher" title="Open Atlas Voice (Alt+V)" aria-label="Open voice assistant">
        <svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
        <span class="atlas-voice-launcher__badge"></span>
      </button>

      <div class="atlas-voice-panel" id="va-panel" role="dialog" aria-label="Atlas Voice chat">
        <div class="atlas-voice-header">
          <div class="atlas-voice-header__icon">
            <svg viewBox="0 0 24 24" fill="white"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
          </div>
          <div style="flex:1">
            <div class="atlas-voice-header__title">Atlas Voice</div>
            <div class="atlas-voice-header__subtitle" id="va-provider-label">${PROVIDER_LABELS[settings.provider]}</div>
          </div>
          <div class="atlas-voice-header__actions">
            <button class="atlas-voice-header__btn va-live-btn ${liveSessionActive ? 'is-live' : ''}" id="va-live-btn" title="Toggle Live Session (continuous conversation)" aria-label="Live session">
              <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4"/></svg>
            </button>
            <button class="atlas-voice-header__btn" id="va-settings-btn" title="Settings" aria-label="Settings">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
            <button class="atlas-voice-header__btn" id="va-close-btn" title="Close" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        <div class="atlas-voice-live-banner" id="va-live-banner" style="display:none">
          <span class="atlas-voice-live-pulse"></span>
          <span>LIVE SESSION — speak naturally, I'll listen after each response. Tap anywhere to interrupt.</span>
        </div>

        <div class="atlas-voice-body" id="va-body">
          <div class="va-msg va-msg--assistant">👋 Hi, I'm Atlas Voice. Ask me about any data source, persona, or combination — or tell me where to navigate. Tap the mic to speak, or type below.</div>
        </div>

        <div class="atlas-voice-suggestions" id="va-suggestions">
          <button class="va-suggestion-chip" data-q="Take me to the personas page">🎯 Show personas</button>
          <button class="va-suggestion-chip" data-q="What sources does a commodities trader need?">💹 Trader sources</button>
          <button class="va-suggestion-chip" data-q="Explain the tailings dam safety combination">🚧 Tailings combo</button>
          <button class="va-suggestion-chip" data-q="Show me the ESG category">🌱 ESG page</button>
        </div>

        <div class="atlas-voice-status" id="va-status">
          <span class="atlas-voice-status__dot"></span>
          <span id="va-status-text">Ready · ${PROVIDER_LABELS[settings.provider]}</span>
        </div>

        <div class="atlas-voice-waveform" id="va-waveform">
          <div class="atlas-voice-waveform__bar"></div>
          <div class="atlas-voice-waveform__bar"></div>
          <div class="atlas-voice-waveform__bar"></div>
          <div class="atlas-voice-waveform__bar"></div>
          <div class="atlas-voice-waveform__bar"></div>
        </div>

        <div class="atlas-voice-input">
          <button class="atlas-voice-input__mic" id="va-mic" title="Tap to speak (push to talk)" aria-label="Voice input">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
          </button>
          <textarea class="atlas-voice-input__text" id="va-text" placeholder="Type your question or use the mic..." rows="1"></textarea>
          <button class="atlas-voice-input__stop" id="va-stop" title="Stop voice" aria-label="Stop voice" style="display:none">
            <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
          </button>
          <button class="atlas-voice-input__send" id="va-send" title="Send" aria-label="Send">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
          </button>
        </div>

        <!-- Settings overlay -->
        <div class="atlas-voice-settings" id="va-settings">
          <div class="atlas-voice-settings__head">
            <div class="atlas-voice-settings__title">⚙️ Settings</div>
            <button class="atlas-voice-header__btn" id="va-settings-close" aria-label="Close settings">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="atlas-voice-settings__body">

            <div class="va-setting-group">
              <label class="va-setting-label">LLM Provider</label>
              <div class="va-setting-help">Choose the AI model that powers your assistant. Z.ai is the no-key default.</div>
              <select class="va-setting-select" id="va-provider-select">
                <option value="zai">Z.ai (default, no key needed)</option>
                <option value="openrouter">OpenRouter (multi-model gateway)</option>
                <option value="grok">Grok (xAI)</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic Claude</option>
                <option value="gemini">Google Gemini</option>
              </select>
              <div class="va-provider-info" id="va-provider-info"></div>
            </div>

            <div class="va-setting-group" id="va-key-group" style="display:none">
              <label class="va-setting-label">API Key</label>
              <div class="va-setting-help" id="va-key-help"></div>
              <input type="password" class="va-setting-input" id="va-api-key" placeholder="sk-..." autocomplete="off" />
            </div>

            <div class="va-setting-group" id="va-model-group" style="display:none">
              <label class="va-setting-label">Model (optional)</label>
              <div class="va-setting-help">Override the default model. Leave blank to use the default.</div>
              <input type="text" class="va-setting-input" id="va-model" placeholder="e.g. gpt-4o, claude-3-opus, gemini-1.5-pro" />
            </div>

            <div class="va-setting-group">
              <label class="va-setting-label">Voice (premium TTS)</label>
              <div class="va-setting-help">Natural-sounding Z.ai voice — used when Premium Voice is on. Xiaochen is the most natural for English.</div>
              <select class="va-setting-select" id="va-voice-select">
                ${VOICE_OPTIONS.map(v => `<option value="${v.id}">${v.label}</option>`).join('')}
              </select>
            </div>

            <div class="va-setting-group">
              <label class="va-setting-label">Voice Output</label>
              <div class="va-toggle-row">
                <span class="va-toggle-row__label">Speak responses aloud</span>
                <div class="va-toggle ${settings.voiceOutput ? 'is-on' : ''}" data-setting="voiceOutput"></div>
              </div>
              <div class="va-toggle-row">
                <span class="va-toggle-row__label">Premium Z.ai voice (natural, slower)</span>
                <div class="va-toggle ${settings.premiumVoice ? 'is-on' : ''}" data-setting="premiumVoice"></div>
              </div>
              <div class="va-toggle-row">
                <span class="va-toggle-row__label">Live Session (continuous conversation)</span>
                <div class="va-toggle ${settings.liveSession ? 'is-on' : ''}" data-setting="liveSession"></div>
              </div>
              <div class="va-toggle-row">
                <span class="va-toggle-row__label">Auto-listen after each response</span>
                <div class="va-toggle ${settings.autoListen ? 'is-on' : ''}" data-setting="autoListen"></div>
              </div>
            </div>

            <button class="va-save-btn" id="va-save-settings">Save settings</button>
            <button class="va-save-btn" id="va-clear-history" style="background:var(--va-surface-2);color:var(--va-text-2);margin-top:8px;border:1px solid var(--va-border)">Clear conversation history</button>
          </div>
        </div>
      </div>
    `
    document.body.appendChild(root)
  }

  // ---------- Helpers ----------
  function $(id) { return document.getElementById(id) }
  function getCurrentPage() {
    const p = window.location.pathname.split('/').pop() || 'index.html'
    return p + window.location.hash
  }
  function setStatus(text, state) {
    const status = $('va-status')
    const txt = $('va-status-text')
    if (txt) txt.textContent = text
    status.classList.remove('is-listening', 'is-thinking', 'is-error', 'is-speaking')
    if (state) status.classList.add('is-' + state)
  }

  function addMessage(role, content, extra) {
    const body = $('va-body')
    if (!body) return null
    const msg = document.createElement('div')
    msg.className = 'va-msg va-msg--' + role
    let html = content.replace(/\n/g, '<br>')
    if (extra && extra.provider) {
      html += `<span class="va-msg__provider">${extra.provider}${extra.model ? ' · ' + extra.model : ''}</span>`
    }
    msg.innerHTML = html
    body.appendChild(msg)
    body.scrollTop = body.scrollHeight
    persistState()
    return msg
  }

  function rebuildChatFromHistory() {
    const body = $('va-body')
    if (!body) return
    // Keep the welcome message
    const welcome = body.querySelector('.va-msg--assistant')
    body.innerHTML = ''
    if (chatHistory.length === 0) {
      body.innerHTML = '<div class="va-msg va-msg--assistant">👋 Hi, I\'m Atlas Voice. Ask me about any data source, persona, or combination — or tell me where to navigate. Tap the mic to speak, or type below.</div>'
      return
    }
    for (const m of chatHistory) {
      const msg = document.createElement('div')
      msg.className = 'va-msg va-msg--' + m.role
      msg.innerHTML = (m.content || '').replace(/\n/g, '<br>')
      body.appendChild(msg)
    }
    body.scrollTop = body.scrollHeight
  }

  function addTyping() {
    const body = $('va-body')
    const t = document.createElement('div')
    t.className = 'va-typing'
    t.id = 'va-typing'
    t.innerHTML = '<div class="va-typing__dot"></div><div class="va-typing__dot"></div><div class="va-typing__dot"></div>'
    body.appendChild(t)
    body.scrollTop = body.scrollHeight
  }
  function removeTyping() {
    const t = $('va-typing')
    if (t) t.remove()
  }

  // ---------- Speech Recognition ----------
  function initRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return null
    const r = new SR()
    r.continuous = false
    r.interimResults = true
    r.lang = 'en-US'
    r.maxAlternatives = 1

    let finalTranscript = ''

    r.onstart = () => {
      isRecording = true
      finalTranscript = ''
      $('va-mic').classList.add('is-recording')
      $('va-launcher').classList.add('is-listening')
      $('va-waveform').classList.add('is-active')
      setStatus('Listening… speak now', 'listening')
    }
    r.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const tr = event.results[i]
        if (tr.isFinal) finalTranscript += tr[0].transcript
        else interim += tr[0].transcript
      }
      const text = (finalTranscript + interim).trim()
      $('va-text').value = text
    }
    r.onerror = (e) => {
      console.error('Speech recognition error:', e.error)
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        setStatus('Voice error: ' + e.error, 'error')
      }
      stopRecording()
    }
    r.onend = () => {
      stopRecording()
      const text = $('va-text').value.trim()
      if (text && !isThinking) {
        // Slight delay to let UI settle
        setTimeout(() => sendMessage(text), 200)
      } else if (liveSessionActive && !isThinking && !isSpeaking) {
        // In live session, if no speech detected, restart listening after a brief pause
        setTimeout(() => {
          if (liveSessionActive && !isThinking && !isSpeaking && !isRecording) {
            startRecording()
          }
        }, 1000)
      }
    }
    return r
  }

  function startRecording() {
    if (!recognition) recognition = initRecognition()
    if (!recognition) {
      alert('Voice input not supported in this browser. Try Chrome, Edge, or Safari.')
      return
    }
    if (isRecording) {
      recognition.stop()
      return
    }
    // If AI is speaking, interrupt it (barge-in)
    if (isSpeaking) {
      stopAudio()
    }
    try {
      recognition.start()
    } catch (e) {
      console.error('Failed to start recognition:', e)
      // Retry once
      setTimeout(() => { try { recognition.start() } catch {} }, 200)
    }
  }
  function stopRecording() {
    isRecording = false
    $('va-mic').classList.remove('is-recording')
    $('va-launcher').classList.remove('is-listening')
    $('va-waveform').classList.remove('is-active')
    if (!isThinking && !isSpeaking) setStatus('Ready · ' + PROVIDER_LABELS[settings.provider])
  }

  // ---------- TTS (queue-based, with completion callback) ----------
  function stopAudio() {
    ttsQueue = []
    if (currentAudio) {
      try { currentAudio.pause() } catch {}
      currentAudio = null
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    isSpeaking = false
    $('va-stop').style.display = 'none'
    $('va-send').style.display = 'block'
    if (!isThinking && !isRecording) setStatus('Ready · ' + PROVIDER_LABELS[settings.provider])
  }

  async function speak(text, onDone) {
    if (!settings.voiceOutput) {
      if (onDone) onDone()
      return
    }
    stopAudio()

    const clean = text.replace(/NAVIGATE:\s*\S+/gi, '').replace(/[*_#`]/g, '').trim()
    if (!clean) {
      if (onDone) onDone()
      return
    }

    isSpeaking = true
    $('va-stop').style.display = 'block'
    $('va-send').style.display = 'none'
    setStatus('Speaking…', 'speaking')

    if (settings.premiumVoice) {
      // Use Z.ai TTS via API — natural-sounding voice
      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: clean, voice: settings.voice || 'xiaochen', speed: settings.voiceSpeed }),
        })
        if (!res.ok) throw new Error('TTS failed: ' + res.status)
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        currentAudio = new Audio(url)

        const finishHandler = () => {
          isSpeaking = false
          $('va-stop').style.display = 'none'
          $('va-send').style.display = 'block'
          URL.revokeObjectURL(url)
          setStatus('Ready · ' + PROVIDER_LABELS[settings.provider])
          if (onDone) onDone()
        }
        currentAudio.onended = finishHandler
        currentAudio.onerror = () => {
          isSpeaking = false
          $('va-stop').style.display = 'none'
          $('va-send').style.display = 'block'
          URL.revokeObjectURL(url)
          setStatus('Voice error', 'error')
          if (onDone) onDone()
        }
        await currentAudio.play()
      } catch (e) {
        console.error('Premium TTS failed, falling back to browser TTS:', e)
        isSpeaking = false
        $('va-stop').style.display = 'none'
        $('va-send').style.display = 'block'
        browserSpeak(clean, onDone)
      }
    } else {
      browserSpeak(clean, onDone)
    }
  }

  function browserSpeak(text, onDone) {
    if (!('speechSynthesis' in window)) {
      isSpeaking = false
      if (onDone) onDone()
      return
    }
    isSpeaking = true
    const u = new SpeechSynthesisUtterance(text)
    u.rate = settings.voiceSpeed
    u.pitch = 1
    u.volume = 1
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v => /Google US English|Samantha|Daniel|Karen|Microsoft Aria/i.test(v.name))
    if (preferred) u.voice = preferred
    const finishHandler = () => {
      isSpeaking = false
      $('va-stop').style.display = 'none'
      $('va-send').style.display = 'block'
      if (!isThinking && !isRecording) setStatus('Ready · ' + PROVIDER_LABELS[settings.provider])
      if (onDone) onDone()
    }
    u.onend = finishHandler
    u.onerror = finishHandler
    window.speechSynthesis.speak(u)
  }

  // ---------- Navigation (waits for speech) ----------
  function performNavigation(url) {
    // If AI is speaking, wait for it to finish first
    if (isSpeaking) {
      pendingNavigation = url
      addMessage('system', `→ Navigating to ${url} after speech…`)
      // Stop button becomes "skip & navigate now"
      $('va-stop').title = 'Skip voice and navigate now'
      return
    }
    doNavigate(url)
  }

  function doNavigate(url) {
    persistState() // save history before navigation
    const current = window.location.pathname.split('/').pop() || 'index.html'
    const target = url.split('#')[0]
    const hash = url.includes('#') ? '#' + url.split('#')[1] : ''
    if (current === target) {
      if (hash) window.location.hash = hash
    } else {
      window.location.href = url
    }
  }

  // ---------- Chat send ----------
  async function sendMessage(text) {
    if (!text || isThinking) return
    addMessage('user', text)
    chatHistory.push({ role: 'user', content: text })
    $('va-text').value = ''
    $('va-text').style.height = 'auto'
    isThinking = true
    setStatus('Thinking…', 'thinking')
    addTyping()
    stopAudio()

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory.slice(-12),
          provider: settings.provider,
          apiKey: settings.apiKey || undefined,
          model: settings.model || undefined,
          currentPage: getCurrentPage(),
        }),
      })
      const data = await res.json()
      removeTyping()

      if (data.error) {
        addMessage('system', '⚠️ ' + data.error)
        setStatus('Error', 'error')
        isThinking = false
      } else {
        const extra = { provider: PROVIDER_LABELS[data.provider] || data.provider, model: data.model }
        addMessage('assistant', data.response, extra)
        chatHistory.push({ role: 'assistant', content: data.response })

        const navUrl = data.navigate
        isThinking = false

        // Track pending navigation so the stop button can skip voice and navigate now
        if (navUrl) {
          pendingNavigation = navUrl
          $('va-stop').title = 'Skip voice and navigate now'
        }

        // Speak first, then navigate (so voice doesn't cut off)
        speak(data.response, () => {
          // After speech completes naturally, clear pending nav and navigate
          if (navUrl) {
            pendingNavigation = null
            doNavigate(navUrl)
          } else {
            // After speech, continue live session if active
            if ((liveSessionActive || settings.autoListen) && !isRecording) {
              setTimeout(() => startRecording(), 600)
            }
          }
        })
      }
    } catch (e) {
      removeTyping()
      addMessage('system', '⚠️ Network error: ' + e.message)
      setStatus('Network error', 'error')
      isThinking = false
    }
  }

  // ---------- Live Session ----------
  function toggleLiveSession(force) {
    const newState = (typeof force === 'boolean') ? force : !liveSessionActive
    liveSessionActive = newState
    settings.liveSession = newState
    saveSettings(settings)

    const btn = $('va-live-btn')
    const banner = $('va-live-banner')
    if (newState) {
      btn.classList.add('is-live')
      banner.style.display = 'flex'
      addMessage('system', '🔴 Live session started — I\'ll automatically listen after each response. Tap the mic to interrupt, or toggle Live off to stop.')
      // If panel is closed, open it
      $('va-panel').classList.add('is-open')
      // Start listening if not already speaking/thinking
      if (!isSpeaking && !isThinking && !isRecording) {
        setTimeout(() => startRecording(), 800)
      }
    } else {
      btn.classList.remove('is-live')
      banner.style.display = 'none'
      if (isRecording) recognition && recognition.stop()
      addMessage('system', '⚪ Live session ended')
    }
    persistState()
  }

  // ---------- Settings UI ----------
  const PROVIDER_INFO = {
    zai: 'Free, no key needed. Powered by Z.ai — fast and reliable for general Q&A.',
    openrouter: 'Multi-model gateway. Get a key at openrouter.ai/keys. Supports Claude, GPT-4, Gemini, Grok, and 100+ others.',
    grok: 'xAI Grok API. Get a key at console.x.ai. Default model: grok-2-1212.',
    openai: 'OpenAI GPT-4o family. Get a key at platform.openai.com. Default model: gpt-4o-mini.',
    anthropic: 'Anthropic Claude. Get a key at console.anthropic.com. Default model: claude-3-5-sonnet.',
    gemini: 'Google Gemini. Get a key at ai.google.dev. Default model: gemini-1.5-flash.',
  }

  function openSettings() {
    $('va-settings').classList.add('is-open')
    $('va-provider-select').value = settings.provider
    $('va-api-key').value = settings.apiKey
    $('va-model').value = settings.model
    $('va-voice-select').value = settings.voice
    updateProviderUI()
  }
  function closeSettings() { $('va-settings').classList.remove('is-open') }
  function updateProviderUI() {
    const p = $('va-provider-select').value
    $('va-provider-info').textContent = PROVIDER_INFO[p] || ''
    if (p === 'zai') {
      $('va-key-group').style.display = 'none'
      $('va-model-group').style.display = 'none'
    } else {
      $('va-key-group').style.display = 'block'
      $('va-model-group').style.display = 'block'
      const helpEl = $('va-key-help')
      const helps = {
        openrouter: 'Get your key at openrouter.ai/keys. Stored in browser localStorage only.',
        grok: 'Get your key at console.x.ai. Stored in browser localStorage only.',
        openai: 'Get your key at platform.openai.com. Stored in browser localStorage only.',
        anthropic: 'Get your key at console.anthropic.com. Stored in browser localStorage only.',
        gemini: 'Get your key at ai.google.dev. Stored in browser localStorage only.',
      }
      helpEl.textContent = helps[p] || 'Enter your API key.'
    }
  }
  function saveSettingsFromUI() {
    settings.provider = $('va-provider-select').value
    settings.apiKey = $('va-api-key').value.trim()
    settings.model = $('va-model').value.trim()
    settings.voice = $('va-voice-select').value
    saveSettings(settings)
    $('va-provider-label').textContent = PROVIDER_LABELS[settings.provider]
    setStatus('Ready · ' + PROVIDER_LABELS[settings.provider])
    closeSettings()
    addMessage('system', `✓ Settings saved. Provider: ${PROVIDER_LABELS[settings.provider]} · Voice: ${settings.voice}`)
  }

  function clearHistory() {
    chatHistory = []
    clearPersistedState()
    rebuildChatFromHistory()
    addMessage('system', 'Conversation cleared.')
  }

  // ---------- Wire up events ----------
  function bindEvents() {
    $('va-launcher').addEventListener('click', () => {
      $('va-panel').classList.toggle('is-open')
      if ($('va-panel').classList.contains('is-open')) {
        setTimeout(() => $('va-text').focus(), 200)
      }
      persistState()
    })
    $('va-close-btn').addEventListener('click', () => {
      $('va-panel').classList.remove('is-open')
      persistState()
    })
    $('va-settings-btn').addEventListener('click', openSettings)
    $('va-settings-close').addEventListener('click', closeSettings)
    $('va-save-settings').addEventListener('click', saveSettingsFromUI)
    $('va-clear-history').addEventListener('click', clearHistory)
    $('va-provider-select').addEventListener('change', updateProviderUI)

    $('va-live-btn').addEventListener('click', () => toggleLiveSession())

    $('va-mic').addEventListener('click', startRecording)
    $('va-stop').addEventListener('click', () => {
      // If there's a pending navigation, skip voice and navigate now
      if (pendingNavigation) {
        const nav = pendingNavigation
        pendingNavigation = null
        stopAudio()
        doNavigate(nav)
      } else {
        stopAudio()
      }
    })
    $('va-send').addEventListener('click', () => {
      const t = $('va-text').value.trim()
      if (t) sendMessage(t)
    })
    $('va-text').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        const t = $('va-text').value.trim()
        if (t) sendMessage(t)
      }
    })
    $('va-text').addEventListener('input', () => {
      const t = $('va-text')
      t.style.height = 'auto'
      t.style.height = Math.min(100, t.scrollHeight) + 'px'
    })

    document.querySelectorAll('.va-suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => sendMessage(chip.dataset.q))
    })

    document.querySelectorAll('.va-toggle').forEach(t => {
      t.addEventListener('click', () => {
        const key = t.dataset.setting
        settings[key] = !settings[key]
        t.classList.toggle('is-on', settings[key])
        saveSettings(settings)
        if (key === 'liveSession') {
          toggleLiveSession(settings.liveSession)
        }
      })
    })

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.altKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault()
        $('va-panel').classList.toggle('is-open')
        if ($('va-panel').classList.contains('is-open')) {
          setTimeout(() => $('va-text').focus(), 200)
        }
        persistState()
      }
      if (e.key === 'Escape') {
        if ($('va-settings').classList.contains('is-open')) {
          closeSettings()
        } else if ($('va-panel').classList.contains('is-open')) {
          if (isRecording) recognition && recognition.stop()
          else if (isSpeaking) stopAudio()
          else { $('va-panel').classList.remove('is-open'); persistState() }
        }
      }
      // Spacebar when not focused in input — toggle recording (live session style)
      if (e.code === 'Space' && document.activeElement !== $('va-text') && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        if ($('va-panel').classList.contains('is-open')) {
          e.preventDefault()
          startRecording()
        }
      }
    })

    // Click anywhere in panel during live session to interrupt speech
    $('va-panel').addEventListener('click', (e) => {
      if (liveSessionActive && isSpeaking && !e.target.closest('button, textarea, input, select, .va-suggestion-chip, .va-toggle')) {
        stopAudio()
      }
    })

    // Preload voices
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
    }
  }

  // ---------- Init ----------
  function init() {
    injectWidget()
    bindEvents()

    // Restore persisted state (so chat continues across page navigation)
    const persisted = loadPersistedState()
    if (persisted.hist.length > 0) {
      rebuildChatFromHistory()
    }
    if (persisted.panelOpen) {
      $('va-panel').classList.add('is-open')
    }
    if (persisted.liveSession) {
      // Apply UI state for resumed live session (banner + button styling)
      const btn = $('va-live-btn')
      const banner = $('va-live-banner')
      if (btn) btn.classList.add('is-live')
      if (banner) banner.style.display = 'flex'
      settings.liveSession = true
      liveSessionActive = true

      // Auto-listen after a brief delay (only if not already speaking/thinking)
      setTimeout(() => {
        if (liveSessionActive && !isSpeaking && !isThinking && !isRecording) {
          addMessage('system', '🔴 Live session resumed on this page — speak when ready')
          setTimeout(() => {
            if (liveSessionActive && !isSpeaking && !isThinking && !isRecording) {
              startRecording()
            }
          }, 1500)
        }
      }, 800)
    }

    console.log('%cAtlas Voice v2 loaded', 'color:#4fc3f7;font-weight:bold', '— persistent chat, live session, natural Z.ai voice')
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
