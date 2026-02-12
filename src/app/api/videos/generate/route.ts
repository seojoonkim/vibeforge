import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const generatedTitle = generateVideoTitle(prompt)
    const generatedScenePrompt = generateScenePrompt(prompt)

    return NextResponse.json({
      title: generatedTitle,
      scenePrompt: generatedScenePrompt
    })
  } catch (error) {
    console.error('Video generation error:', error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}

function generateVideoTitle(prompt: string): string {
  const isKorean = /[가-힣]/.test(prompt)
  
  if (prompt.includes('사이버펑크') || prompt.includes('cyberpunk')) {
    return isKorean ? 'Neon City Nights' : 'Neon City Nights'
  }
  if (prompt.includes('댄스') || prompt.includes('dance')) {
    return isKorean ? 'Electric Dance' : 'Electric Dance'
  }
  if (prompt.includes('드라이브') || prompt.includes('drive')) {
    return isKorean ? 'Midnight Drive' : 'Midnight Drive'
  }
  if (prompt.includes('로맨틱') || prompt.includes('romantic') || prompt.includes('사랑')) {
    return isKorean ? 'Love Story' : 'Love Story'
  }
  if (prompt.includes('파티') || prompt.includes('party')) {
    return isKorean ? 'Party All Night' : 'Party All Night'
  }
  
  const defaultTitles = ['Music Video', 'Visual Story', 'Dream Sequence', 'Motion Art']
  return defaultTitles[Math.floor(Math.random() * defaultTitles.length)]
}

function generateScenePrompt(prompt: string): string {
  const scenes: string[] = []
  const isKorean = /[가-힣]/.test(prompt)
  
  // Detect style and add appropriate scenes
  if (prompt.includes('사이버펑크') || prompt.includes('cyberpunk') || prompt.includes('네온')) {
    scenes.push(
      'Opening: Aerial shot of neon-lit cityscape at night, rain-soaked streets reflecting colorful lights',
      'Scene 1: Character walking through busy streets, neon signs flickering, holographic advertisements',
      'Scene 2: Close-up shots intercut with wide shots of dancing in an underground club with laser lights',
      'Scene 3: Rooftop scene overlooking the city, wind in hair, city lights twinkling below',
      'Ending: Slow-motion shot fading into the neon horizon'
    )
  } else if (prompt.includes('댄스') || prompt.includes('dance')) {
    scenes.push(
      'Opening: Silhouette against bright backlight, beat drop reveals full scene',
      'Scene 1: Dynamic dance sequence with dramatic lighting changes',
      'Scene 2: Group formation shots with synchronized movements',
      'Scene 3: Solo spotlight moment with emotional performance',
      'Ending: Freeze frame on powerful pose'
    )
  } else if (prompt.includes('로맨틱') || prompt.includes('romantic') || prompt.includes('사랑')) {
    scenes.push(
      'Opening: Soft focus morning light, intimate close-ups',
      'Scene 1: Two silhouettes walking together in golden hour light',
      'Scene 2: Montage of tender moments, stolen glances',
      'Scene 3: Dramatic separation scene with rain or sunset',
      'Ending: Reunion or hopeful look into the distance'
    )
  } else if (prompt.includes('드라이브') || prompt.includes('drive')) {
    scenes.push(
      'Opening: Dashboard POV, city lights streaming past',
      'Scene 1: Side profile shots through car window, city reflections',
      'Scene 2: Aerial tracking shot of car on highway at night',
      'Scene 3: Interior shots with character singing/lip-syncing',
      'Ending: Car disappearing into the distant highway lights'
    )
  } else {
    // Default music video structure
    scenes.push(
      'Opening: Establishing shot setting the mood and location',
      'Scene 1: Introduction of character with medium shots',
      'Scene 2: Performance or narrative development with dynamic camera movement',
      'Scene 3: Climax moment with emotional peak',
      'Ending: Resolution with memorable final image'
    )
  }
  
  // Add technical notes
  const technicalNotes = [
    '',
    '---',
    'Technical: Cinematic color grading, smooth transitions between scenes, beat-synced cuts'
  ]
  
  return [...scenes, ...technicalNotes].join('\n')
}
