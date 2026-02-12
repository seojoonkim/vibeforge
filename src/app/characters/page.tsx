'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, Sparkles, Loader2 } from 'lucide-react'

export default function CharactersPage() {
  const [open, setOpen] = useState(false)
  const [characters, setCharacters] = useState<any[]>([])
  const [generating, setGenerating] = useState(false)
  const [creating, setCreating] = useState(false)

  // Fetch characters on mount
  useEffect(() => {
    fetchCharacters()
  }, [])

  const fetchCharacters = async () => {
    try {
      const res = await fetch('/api/characters')
      if (res.ok) {
        const data = await res.json()
        setCharacters(data)
      }
    } catch (e) {
      console.error('Failed to fetch characters:', e)
    }
  }

  const handleCreateCharacter = async () => {
    if (!name.trim() || !stylePrompt.trim()) return
    
    setCreating(true)
    try {
      const res = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          style_prompt: stylePrompt.trim(),
          reference_images: referenceImages ? referenceImages.split(',').map(s => s.trim()).filter(Boolean) : []
        })
      })
      
      if (res.ok) {
        const newCharacter = await res.json()
        setCharacters(prev => [newCharacter, ...prev])
        setOpen(false)
        resetForm()
      } else {
        const error = await res.json()
        console.error('Failed to create character:', error)
        alert('캐릭터 생성 실패: ' + (error.error || 'Unknown error'))
      }
    } catch (e) {
      console.error('Error creating character:', e)
      alert('캐릭터 생성 중 오류가 발생했습니다.')
    } finally {
      setCreating(false)
    }
  }
  
  // Form state
  const [quickPrompt, setQuickPrompt] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [stylePrompt, setStylePrompt] = useState('')
  const [referenceImages, setReferenceImages] = useState('')

  const handleAIAssist = async () => {
    if (!quickPrompt.trim()) return
    
    setGenerating(true)
    try {
      const res = await fetch('/api/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'character', prompt: quickPrompt })
      })
      
      console.log('[AI Assist] Response status:', res.status)
      
      const data = await res.json()
      console.log('[AI Assist] Response data:', data)
      
      if (!res.ok) {
        console.error('[AI Assist] API error:', data.error || data)
        return
      }
      
      // Map API response fields to form state
      setName(data.name || '')
      setDescription(data.description || data.personality || '')
      setStylePrompt(data.stylePrompt || '')
      
      console.log('[AI Assist] Fields set - name:', data.name, 'stylePrompt:', data.stylePrompt?.substring(0, 50) + '...')
    } catch (e) {
      console.error('[AI Assist] Exception:', e)
    } finally {
      setGenerating(false)
    }
  }

  const resetForm = () => {
    setQuickPrompt('')
    setName('')
    setDescription('')
    setStylePrompt('')
    setReferenceImages('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Characters</h1>
          <p className="text-muted-foreground">
            Define AI characters for consistent video generation
          </p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Character
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Character</DialogTitle>
              <DialogDescription>
                Describe your character and let AI fill in the details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* AI Assist Section */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-violet-50 to-pink-50 border border-violet-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                  <span className="text-sm font-medium text-violet-700">AI Assist</span>
                </div>
                <Textarea 
                  placeholder="캐릭터를 자유롭게 설명하세요 (여러 줄 가능)&#10;&#10;예시:&#10;20대 여성 아이돌&#10;사이버펑크 스타일&#10;파란색 숏컷 헤어"
                  value={quickPrompt}
                  onChange={(e) => setQuickPrompt(e.target.value)}
                  className="bg-white mb-2"
                />
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={handleAIAssist}
                  disabled={generating || !quickPrompt.trim()}
                  className="w-full"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate All Fields
                    </>
                  )}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    or fill manually
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input 
                  placeholder="e.g., Luna, Neo, Aria..." 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Description <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <Textarea 
                  placeholder="Brief description of the character..." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Style Prompt <span className="text-red-500">*</span>
                </label>
                <Textarea 
                  placeholder="Detailed visual description for AI generation... e.g., young woman with purple hair, cyberpunk style, neon lighting..."
                  className="min-h-[100px]"
                  value={stylePrompt}
                  onChange={(e) => setStylePrompt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Reference Images <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <Input 
                  placeholder="Comma-separated image URLs..." 
                  value={referenceImages}
                  onChange={(e) => setReferenceImages(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateCharacter}
                disabled={!name.trim() || !stylePrompt.trim() || creating}
              >
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Character'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {characters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No characters yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first AI character to get started
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Character
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {characters.map((character) => (
            <Card key={character.id} className="cursor-pointer hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{character.name}</CardTitle>
                  <Badge variant="secondary">
                    {character.reference_images?.length || 0} refs
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {character.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {character.style_prompt}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
