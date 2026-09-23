import { NextRequest, NextResponse } from 'next/server'

// ============================================================
// TTS route — uses Z.ai TTS (no user key needed)
// Splits long text into <1024 char chunks at sentence boundaries
// Properly concatenates WAV chunks into a single seamless audio file
// ============================================================

function splitTextIntoChunks(text: string, maxLength = 900): string[] {
  const chunks: string[] = []
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  let current = ''
  for (const s of sentences) {
    if ((current + s).length <= maxLength) {
      current += s
    } else {
      if (current) chunks.push(current.trim())
      current = s
    }
  }
  if (current) chunks.push(current.trim())
  return chunks
}

// ============================================================
// WAV concatenation
// Standard WAV: RIFF header (12B) + fmt chunk (24B typically) + data chunk
// We extract the PCM data from each WAV and concatenate, then write a fresh header
// ============================================================

interface WavInfo {
  sampleRate: number
  numChannels: number
  bitsPerSample: number
  audioData: Buffer
}

function parseWav(buf: Buffer): WavInfo | null {
  if (buf.length < 44) return null
  // Verify RIFF header
  if (buf.toString('ascii', 0, 4) !== 'RIFF') return null
  if (buf.toString('ascii', 8, 12) !== 'WAVE') return null

  let offset = 12
  let sampleRate = 24000
  let numChannels = 1
  let bitsPerSample = 16
  let audioData = Buffer.alloc(0)

  while (offset + 8 <= buf.length) {
    const chunkId = buf.toString('ascii', offset, offset + 4)
    const chunkSize = buf.readUInt32LE(offset + 4)
    if (chunkId === 'fmt ') {
      numChannels = buf.readUInt16LE(offset + 10)
      sampleRate = buf.readUInt32LE(offset + 12)
      bitsPerSample = buf.readUInt16LE(offset + 22)
    } else if (chunkId === 'data') {
      audioData = buf.subarray(offset + 8, offset + 8 + chunkSize)
      break // we have what we need
    }
    offset += 8 + chunkSize
    // Pad to even
    if (chunkSize % 2 === 1) offset += 1
  }

  if (audioData.length === 0) return null
  return { sampleRate, numChannels, bitsPerSample, audioData }
}

function buildWav(infos: WavInfo[]): Buffer {
  // All chunks must have same format
  const ref = infos[0]
  const totalDataLen = infos.reduce((sum, i) => sum + i.audioData.length, 0)
  const byteRate = ref.sampleRate * ref.numChannels * ref.bitsPerSample / 8
  const blockAlign = ref.numChannels * ref.bitsPerSample / 8

  const header = Buffer.alloc(44)
  header.write('RIFF', 0, 'ascii')
  header.writeUInt32LE(36 + totalDataLen, 4)
  header.write('WAVE', 8, 'ascii')
  header.write('fmt ', 12, 'ascii')
  header.writeUInt32LE(16, 16) // PCM fmt chunk size
  header.writeUInt16LE(1, 20)  // PCM format
  header.writeUInt16LE(ref.numChannels, 22)
  header.writeUInt32LE(ref.sampleRate, 24)
  header.writeUInt32LE(byteRate, 28)
  header.writeUInt16LE(blockAlign, 32)
  header.writeUInt16LE(ref.bitsPerSample, 34)
  header.write('data', 36, 'ascii')
  header.writeUInt32LE(totalDataLen, 40)

  return Buffer.concat([header, ...infos.map(i => i.audioData)])
}

// ============================================================
// Route handler
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'xiaochen', speed = 1.0 } = await req.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    const chunks = splitTextIntoChunks(text.slice(0, 6000)) // hard cap
    if (chunks.length === 0) {
      return NextResponse.json({ error: 'no text to synthesize' }, { status: 400 })
    }

    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()

    // Generate each chunk in parallel where possible (but keep order)
    const wavInfos: WavInfo[] = []
    for (let i = 0; i < chunks.length; i++) {
      try {
        const response = await zai.audio.tts.create({
          input: chunks[i],
          voice,
          speed,
          response_format: 'wav',
          stream: false,
        })
        const ab = await response.arrayBuffer()
        const buf = Buffer.from(new Uint8Array(ab))
        const info = parseWav(buf)
        if (info) wavInfos.push(info)
      } catch (e) {
        console.error(`TTS chunk ${i} failed:`, e)
      }
    }

    if (wavInfos.length === 0) {
      return NextResponse.json({ error: 'TTS generation failed' }, { status: 500 })
    }

    // Concatenate all WAV chunks into one seamless file
    const combined = buildWav(wavInfos)

    return new NextResponse(combined, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': combined.length.toString(),
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error: any) {
    console.error('TTS API error:', error)
    return NextResponse.json({ error: error.message || 'TTS failed' }, { status: 500 })
  }
}
