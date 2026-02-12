import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

type AssistType = 'track' | 'character' | 'video'

interface AssistRequest {
  type: AssistType
  prompt: string
}

export async function POST(req: Request) {
  try {
    const { type, prompt } = (await req.json()) as AssistRequest

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    if (!type || !['track', 'character', 'video'].includes(type)) {
      return NextResponse.json({ error: 'Valid type (track/character/video) is required' }, { status: 400 })
    }

    const systemPrompt = getSystemPrompt(type)
    
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 })
    }

    // Parse the JSON response from Claude
    const result = JSON.parse(content.text)

    return NextResponse.json(result)
  } catch (error) {
    console.error('AI Assist error:', error)
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
  }
}

function getSystemPrompt(type: AssistType): string {
  const baseInstructions = `You are a creative AI assistant for VibeForge, a platform for generating AI music, characters, and videos. 
Respond ONLY with valid JSON, no markdown or explanation.`

  switch (type) {
    case 'track':
      return `${baseInstructions}

Your task is to generate rich, detailed music production parameters from a simple user prompt.

Output JSON format:
{
  "title": "Creative song title (can be Korean or English based on input language)",
  "genre": "Detected or suggested genre",
  "mood": "Overall mood/vibe of the track",
  "tempo": "BPM recommendation (number)",
  "key": "Musical key recommendation",
  "lyrics": "Full lyrics with [Verse], [Chorus], [Bridge] structure. Match input language (Korean/English). Be creative and emotionally resonant.",
  "generationPrompt": "Detailed prompt for AI music generation - include genre, instruments, vocals, tempo, mood, production style. Be very specific.",
  "references": "2-3 reference artists or songs that match this style"
}

Be creative, specific, and match the user's language (Korean/English).`

    case 'character':
      return `${baseInstructions}

Your task is to generate a compelling virtual character concept from a simple user prompt.

Output JSON format:
{
  "name": "Character name (Korean-style if input is Korean)",
  "nameRomanized": "Romanized version if Korean name",
  "age": "Apparent age",
  "personality": "2-3 sentence personality description",
  "description": "Detailed character backstory and concept (3-4 sentences)",
  "visualStyle": "Art style recommendation (anime, realistic, 3D, etc)",
  "stylePrompt": "Detailed image generation prompt - include appearance, clothing, colors, lighting, background, art style. Be very specific for AI image generation.",
  "voiceType": "Recommended voice characteristics for TTS",
  "colorPalette": ["color1", "color2", "color3", "color4"]
}

Be creative and develop a unique, memorable character.`

    case 'video':
      return `${baseInstructions}

Your task is to create a detailed music video concept and scene breakdown from a simple user prompt.

Output JSON format:
{
  "title": "Video title",
  "concept": "Overall video concept (2-3 sentences)",
  "mood": "Visual mood and atmosphere",
  "colorGrading": "Color grading/LUT recommendation",
  "scenes": [
    {
      "name": "Scene name",
      "duration": "Approximate duration",
      "description": "Detailed scene description",
      "camera": "Camera movement and angles",
      "lighting": "Lighting setup"
    }
  ],
  "scenePrompt": "Combined detailed prompt for AI video generation - all scenes described in sequence",
  "technicalNotes": "Production notes, transitions, effects recommendations",
  "references": "2-3 reference music videos for style inspiration"
}

Create cinematic, visually striking video concepts.`

    default:
      return baseInstructions
  }
}
