import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const generatedTitle = generateTitle(prompt)
    const generatedGenre = detectGenre(prompt)
    const generatedLyrics = generateLyrics(prompt, generatedGenre)
    const generatedPrompt = generateMusicPrompt(prompt, generatedGenre)

    return NextResponse.json({
      title: generatedTitle,
      genre: generatedGenre,
      lyrics: generatedLyrics,
      generationPrompt: generatedPrompt
    })
  } catch (error) {
    console.error('Track generation error:', error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}

function generateTitle(prompt: string): string {
  const isKorean = /[가-힣]/.test(prompt)
  
  // Extract keywords for title
  if (prompt.includes('여름') || prompt.includes('summer')) {
    return isKorean ? '한여름 밤의 드라이브' : 'Summer Night Drive'
  }
  if (prompt.includes('밤') || prompt.includes('night')) {
    return isKorean ? 'Midnight City' : 'Midnight City'
  }
  if (prompt.includes('드라이브') || prompt.includes('drive')) {
    return isKorean ? 'Neon Highway' : 'Neon Highway'
  }
  if (prompt.includes('사랑') || prompt.includes('love')) {
    return isKorean ? '너에게로' : 'To You'
  }
  if (prompt.includes('별') || prompt.includes('star')) {
    return isKorean ? 'Starlight' : 'Starlight'
  }
  if (prompt.includes('비') || prompt.includes('rain')) {
    return isKorean ? 'Rainy Mood' : 'Rainy Mood'
  }
  
  // Default titles by mood
  const defaultTitles = isKorean 
    ? ['Midnight Glow', 'City Lights', 'Neon Dreams', 'Electric Heart']
    : ['Midnight Glow', 'City Lights', 'Neon Dreams', 'Electric Heart']
  
  return defaultTitles[Math.floor(Math.random() * defaultTitles.length)]
}

function detectGenre(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase()
  
  if (lowerPrompt.includes('시티팝') || lowerPrompt.includes('city pop')) return 'city pop'
  if (lowerPrompt.includes('케이팝') || lowerPrompt.includes('k-pop') || lowerPrompt.includes('kpop')) return 'k-pop'
  if (lowerPrompt.includes('힙합') || lowerPrompt.includes('hip-hop') || lowerPrompt.includes('rap')) return 'hip-hop'
  if (lowerPrompt.includes('로파이') || lowerPrompt.includes('lo-fi') || lowerPrompt.includes('lofi')) return 'lo-fi'
  if (lowerPrompt.includes('일렉트로닉') || lowerPrompt.includes('electronic') || lowerPrompt.includes('edm')) return 'electronic'
  if (lowerPrompt.includes('재즈') || lowerPrompt.includes('jazz')) return 'jazz'
  if (lowerPrompt.includes('록') || lowerPrompt.includes('rock')) return 'rock'
  if (lowerPrompt.includes('알앤비') || lowerPrompt.includes('r&b')) return 'r&b'
  if (lowerPrompt.includes('인디') || lowerPrompt.includes('indie')) return 'indie'
  
  // Default based on mood keywords
  if (lowerPrompt.includes('레트로') || lowerPrompt.includes('80') || lowerPrompt.includes('네온')) return 'city pop'
  if (lowerPrompt.includes('편안') || lowerPrompt.includes('chill') || lowerPrompt.includes('relax')) return 'lo-fi'
  if (lowerPrompt.includes('신나는') || lowerPrompt.includes('upbeat') || lowerPrompt.includes('dance')) return 'pop'
  
  return 'pop'
}

function generateLyrics(prompt: string, genre: string): string {
  const isKorean = /[가-힣]/.test(prompt)
  
  // Generate sample lyrics based on genre and prompt
  if (genre === 'city pop') {
    return isKorean 
      ? `[Verse 1]
네온 불빛 아래 달리는 밤
창문 너머로 스쳐가는 도시
너의 목소리가 라디오처럼
내 마음속에 울려 퍼져

[Chorus]
Tonight, 이 밤이 끝나지 않게
달빛 아래 너와 함께
시간이 멈춘 것처럼
영원히 이 순간 속에`
      : `[Verse 1]
Neon lights guide us through the night
City skyline fading in the rearview
Your voice like a radio melody
Echoing through my heart

[Chorus]
Tonight, don't let this moment end
Under the moonlight with you
Time stands still
Forever in this dream`
  }
  
  if (genre === 'lo-fi') {
    return isKorean
      ? `[Verse]
창밖의 빗소리
차 한잔의 온기
오늘도 그렇게
하루가 지나가

[Chorus]
괜찮아, 천천히
이 시간만큼은
나만의 것이니까`
      : `[Verse]
Raindrops on my window
Warmth of a coffee cup
Another day passes by
Slowly and gently

[Chorus]
It's okay, take it slow
This moment is mine
And mine alone`
  }
  
  // Default pop lyrics
  return isKorean
    ? `[Verse 1]
새로운 시작을 알리는 아침
어제와는 다른 오늘이 될 거야
두려움 없이 한 걸음씩
나아가 볼게

[Chorus]
빛나는 내일을 향해
두 팔 벌려 날아올라
이 순간을 느껴봐
We're gonna shine tonight`
    : `[Verse 1]
A new morning, a fresh start
Today will be different from yesterday
Step by step without fear
I'll keep moving forward

[Chorus]
Towards a shining tomorrow
Spread your wings and fly
Feel this moment now
We're gonna shine tonight`
}

function generateMusicPrompt(prompt: string, genre: string): string {
  const basePrompts: Record<string, string> = {
    'city pop': 'upbeat city pop, 80s synth, groovy bass, warm analog sound, female vocals, 115-120 BPM, nostalgic retro vibe',
    'k-pop': 'energetic K-pop, catchy hook, powerful vocals, crisp production, dance beat, 125-130 BPM, modern pop sound',
    'pop': 'catchy pop melody, radio-friendly, polished production, uplifting mood, 120 BPM',
    'lo-fi': 'chill lo-fi hip hop, vinyl crackle, mellow piano, relaxing beats, 85 BPM, cozy atmosphere',
    'hip-hop': 'modern hip-hop beat, hard-hitting drums, 808 bass, trap hi-hats, 140 BPM',
    'electronic': 'electronic dance music, synthesizers, drop build-up, energetic, 128 BPM',
    'jazz': 'smooth jazz, saxophone melody, soft drums, upright bass, sophisticated harmony',
    'rock': 'rock energy, electric guitars, powerful drums, raw vocals, 130 BPM',
    'r&b': 'smooth R&B, soulful vocals, groovy rhythm, warm production, 95 BPM',
    'indie': 'indie pop, dreamy guitars, atmospheric synths, introspective lyrics, 110 BPM'
  }
  
  let musicPrompt = basePrompts[genre] || basePrompts['pop']
  
  // Add mood-specific elements
  if (prompt.includes('밤') || prompt.includes('night')) {
    musicPrompt += ', nighttime atmosphere, dreamy'
  }
  if (prompt.includes('여름') || prompt.includes('summer')) {
    musicPrompt += ', summer vibes, bright and warm'
  }
  if (prompt.includes('슬픈') || prompt.includes('sad')) {
    musicPrompt += ', emotional, melancholic undertones'
  }
  if (prompt.includes('신나는') || prompt.includes('upbeat') || prompt.includes('happy')) {
    musicPrompt += ', uplifting energy, feel-good'
  }
  
  return musicPrompt
}
