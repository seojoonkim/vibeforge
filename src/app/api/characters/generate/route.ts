import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Use Replicate's LLM to generate character details
    // For now, we'll use a simple template-based approach
    // In production, you'd call an LLM API
    
    const generatedName = generateName(prompt)
    const generatedDescription = generateDescription(prompt)
    const generatedStylePrompt = generateStylePrompt(prompt)

    return NextResponse.json({
      name: generatedName,
      description: generatedDescription,
      stylePrompt: generatedStylePrompt
    })
  } catch (error) {
    console.error('Character generation error:', error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}

function generateName(prompt: string): string {
  // Extract potential name hints from prompt
  const koreanNames = ['루나', '아리아', '네오', '노바', '제나', '카이', '리나', '소라', '유나', '미카']
  const englishNames = ['Luna', 'Aria', 'Neo', 'Nova', 'Zena', 'Kai', 'Lina', 'Sora', 'Yuna', 'Mika']
  
  // Check if prompt is in Korean
  const isKorean = /[가-힣]/.test(prompt)
  const names = isKorean ? koreanNames : englishNames
  
  // Simple keyword-based name selection
  if (prompt.includes('사이버') || prompt.includes('cyber')) {
    return isKorean ? '네오' : 'Neo'
  }
  if (prompt.includes('판타지') || prompt.includes('fantasy') || prompt.includes('마법')) {
    return isKorean ? '아리아' : 'Aria'
  }
  if (prompt.includes('우주') || prompt.includes('space') || prompt.includes('별')) {
    return isKorean ? '노바' : 'Nova'
  }
  if (prompt.includes('달') || prompt.includes('moon')) {
    return isKorean ? '루나' : 'Luna'
  }
  
  // Random selection
  return names[Math.floor(Math.random() * names.length)]
}

function generateDescription(prompt: string): string {
  const isKorean = /[가-힣]/.test(prompt)
  
  // Build description based on prompt keywords
  let desc = ''
  
  if (prompt.includes('아이돌') || prompt.includes('idol')) {
    desc = isKorean 
      ? `가상 아이돌 캐릭터. ${prompt}의 컨셉을 가진 AI 생성 캐릭터입니다.`
      : `Virtual idol character. An AI-generated character with ${prompt} concept.`
  } else if (prompt.includes('사이버') || prompt.includes('cyber')) {
    desc = isKorean
      ? `미래 도시를 배경으로 한 사이버펑크 스타일의 캐릭터. 네온 조명과 하이테크 요소가 특징입니다.`
      : `Cyberpunk style character set in a futuristic city. Features neon lighting and high-tech elements.`
  } else {
    desc = isKorean
      ? `${prompt}을 테마로 한 AI 생성 캐릭터입니다.`
      : `AI-generated character themed around ${prompt}.`
  }
  
  return desc
}

function generateStylePrompt(prompt: string): string {
  // Convert user's simple description to detailed AI prompt
  let style = ''
  
  // Detect style keywords and enhance
  const styleEnhancements = []
  
  // Hair
  if (prompt.includes('파란') || prompt.includes('blue')) {
    styleEnhancements.push('vibrant blue hair')
  } else if (prompt.includes('보라') || prompt.includes('purple')) {
    styleEnhancements.push('purple gradient hair')
  } else if (prompt.includes('분홍') || prompt.includes('pink')) {
    styleEnhancements.push('pink hair with highlights')
  } else {
    styleEnhancements.push('stylish colored hair')
  }
  
  // Style
  if (prompt.includes('사이버펑크') || prompt.includes('cyberpunk')) {
    styleEnhancements.push('cyberpunk aesthetic', 'neon lighting', 'futuristic cityscape background', 'holographic effects')
  } else if (prompt.includes('판타지') || prompt.includes('fantasy')) {
    styleEnhancements.push('fantasy style', 'magical aura', 'ethereal lighting', 'mystical background')
  } else if (prompt.includes('아이돌') || prompt.includes('idol')) {
    styleEnhancements.push('K-pop idol style', 'stage lighting', 'glamorous makeup', 'trendy fashion')
  } else if (prompt.includes('로파이') || prompt.includes('lofi')) {
    styleEnhancements.push('lofi aesthetic', 'warm lighting', 'cozy atmosphere', 'soft colors')
  }
  
  // Gender
  if (prompt.includes('여성') || prompt.includes('여자') || prompt.includes('woman') || prompt.includes('girl') || prompt.includes('female')) {
    styleEnhancements.unshift('beautiful young woman')
  } else if (prompt.includes('남성') || prompt.includes('남자') || prompt.includes('man') || prompt.includes('boy') || prompt.includes('male')) {
    styleEnhancements.unshift('handsome young man')
  } else {
    styleEnhancements.unshift('beautiful character')
  }
  
  // Always add quality enhancers
  styleEnhancements.push('highly detailed', 'professional quality', '8k resolution', 'cinematic composition')
  
  style = styleEnhancements.join(', ')
  
  return style
}
