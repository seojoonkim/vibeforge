'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, Sparkles, Loader2, ImageIcon, Pencil, Trash2 } from 'lucide-react'

export default function CharactersPage() {
  const [open, setOpen] = useState(false)
  const [characters, setCharacters] = useState<any[]>([])
  const [generating, setGenerating] = useState(false)
  const [creating, setCreating] = useState(false)
  const [generatingImageFor, setGeneratingImageFor] = useState<string | null>(null)
  const [selectedCharacter, setSelectedCharacter] = useState<any | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', description: '', style_prompt: '' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const generateImage = async (characterId: string, stylePrompt: string) => {
    setGeneratingImageFor(characterId)
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: stylePrompt, characterId })
      })
      
      if (res.ok) {
        const { imageUrl } = await res.json()
        // Update local state immediately
        setCharacters(prev => prev.map(c => 
          c.id === characterId ? { ...c, generated_image: imageUrl } : c
        ))
        // Also update selected character if viewing
        if (selectedCharacter?.id === characterId) {
          setSelectedCharacter((prev: any) => prev ? { ...prev, generated_image: imageUrl } : null)
        }
        // Refetch from DB to ensure consistency
        await fetchCharacters()
      } else {
        const error = await res.json()
        alert('이미지 생성 실패: ' + (error.error || 'Unknown error'))
      }
    } catch (e) {
      console.error('Image generation error:', e)
      alert('이미지 생성 중 오류가 발생했습니다.')
    } finally {
      setGeneratingImageFor(null)
    }
  }

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

  const startEditing = () => {
    if (selectedCharacter) {
      setEditForm({
        name: selectedCharacter.name || '',
        description: selectedCharacter.description || '',
        style_prompt: selectedCharacter.style_prompt || ''
      })
      setIsEditing(true)
    }
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditForm({ name: '', description: '', style_prompt: '' })
  }

  const handleUpdateCharacter = async () => {
    if (!selectedCharacter || !editForm.name.trim() || !editForm.style_prompt.trim()) return
    
    setSaving(true)
    try {
      const res = await fetch(`/api/characters/${selectedCharacter.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name.trim(),
          description: editForm.description.trim(),
          style_prompt: editForm.style_prompt.trim()
        })
      })
      
      if (res.ok) {
        const updated = await res.json()
        setCharacters(prev => prev.map(c => c.id === updated.id ? updated : c))
        setSelectedCharacter(updated)
        setIsEditing(false)
      } else {
        const error = await res.json()
        alert('수정 실패: ' + (error.error || 'Unknown error'))
      }
    } catch (e) {
      console.error('Error updating character:', e)
      alert('캐릭터 수정 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCharacter = async () => {
    if (!selectedCharacter) return
    if (!confirm(`정말 "${selectedCharacter.name}"을(를) 삭제하시겠습니까?`)) return
    
    setDeleting(true)
    try {
      const res = await fetch(`/api/characters/${selectedCharacter.id}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        setCharacters(prev => prev.filter(c => c.id !== selectedCharacter.id))
        setSelectedCharacter(null)
      } else {
        const error = await res.json()
        alert('삭제 실패: ' + (error.error || 'Unknown error'))
      }
    } catch (e) {
      console.error('Error deleting character:', e)
      alert('캐릭터 삭제 중 오류가 발생했습니다.')
    } finally {
      setDeleting(false)
    }
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
            <Card 
              key={character.id} 
              className="cursor-pointer hover:border-primary transition-colors overflow-hidden"
              onClick={() => setSelectedCharacter(character)}
            >
              {/* Character Visual Preview */}
              <div className="h-48 bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center relative">
                {character.generated_image ? (
                  <img 
                    src={character.generated_image} 
                    alt={character.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-white">
                    {generatingImageFor === character.id ? (
                      <>
                        <Loader2 className="h-12 w-12 mx-auto mb-2 animate-spin opacity-80" />
                        <span className="text-xs opacity-70">Generating...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-80" />
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation()
                            generateImage(character.id, character.style_prompt)
                          }}
                          className="text-xs"
                        >
                          <Sparkles className="mr-1 h-3 w-3" />
                          Generate Image
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{character.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {character.reference_images?.length || 0} refs
                  </Badge>
                </div>
                {character.description && (
                  <CardDescription className="line-clamp-2 text-sm">
                    {character.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-muted/50 rounded-md p-2">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Style Prompt:</p>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {character.style_prompt}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Character Detail Dialog */}
      <Dialog open={!!selectedCharacter} onOpenChange={(open) => { if (!open) { setSelectedCharacter(null); cancelEditing(); } }}>
        <DialogContent className="max-w-7xl w-[95vw] max-h-[90vh] overflow-y-auto">
          {selectedCharacter && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-2xl">{isEditing ? '캐릭터 수정' : selectedCharacter.name}</DialogTitle>
                    <DialogDescription>
                      {isEditing ? '캐릭터 정보를 수정합니다' : '캐릭터 상세 정보'}
                    </DialogDescription>
                  </div>
                  {!isEditing && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={startEditing}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={handleDeleteCharacter}
                        disabled={deleting}
                        className="text-destructive hover:text-destructive"
                      >
                        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  )}
                </div>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                {/* Image Section - Left */}
                <div className="relative flex items-start justify-center">
                  {selectedCharacter.generated_image ? (
                    <img 
                      src={selectedCharacter.generated_image} 
                      alt={selectedCharacter.name}
                      className="w-full max-h-[600px] object-contain rounded-lg bg-muted"
                    />
                  ) : (
                    <div className="w-full aspect-[9/16] max-h-[600px] bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <div className="text-center text-white">
                        {generatingImageFor === selectedCharacter.id ? (
                          <>
                            <Loader2 className="h-16 w-16 mx-auto mb-3 animate-spin opacity-80" />
                            <span className="text-sm opacity-70">이미지 생성 중...</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="h-16 w-16 mx-auto mb-3 opacity-80" />
                            <Button 
                              variant="secondary"
                              onClick={() => generateImage(selectedCharacter.id, isEditing ? editForm.style_prompt : selectedCharacter.style_prompt)}
                            >
                              <Sparkles className="mr-2 h-4 w-4" />
                              이미지 생성하기
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Info Section - Right */}
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        이름 <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">설명</label>
                      <Textarea 
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Style Prompt <span className="text-red-500">*</span>
                      </label>
                      <Textarea 
                        className="min-h-[200px]"
                        value={editForm.style_prompt}
                        onChange={(e) => setEditForm(prev => ({ ...prev, style_prompt: e.target.value }))}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedCharacter.description && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">설명</h4>
                        <p className="text-sm text-muted-foreground">{selectedCharacter.description}</p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Style Prompt</h4>
                      <div className="bg-muted rounded-md p-3 max-h-[300px] overflow-y-auto">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedCharacter.style_prompt}</p>
                      </div>
                    </div>
                    
                    {selectedCharacter.reference_images?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Reference Images</h4>
                        <div className="flex gap-2 flex-wrap">
                          {selectedCharacter.reference_images.map((url: string, i: number) => (
                            <img key={i} src={url} alt={`ref-${i}`} className="h-20 w-20 object-cover rounded" />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      생성일: {new Date(selectedCharacter.created_at).toLocaleString('ko-KR')}
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={cancelEditing}>
                      취소
                    </Button>
                    <Button 
                      onClick={handleUpdateCharacter}
                      disabled={saving || !editForm.name.trim() || !editForm.style_prompt.trim()}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          저장 중...
                        </>
                      ) : (
                        '저장'
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setSelectedCharacter(null)}>
                      닫기
                    </Button>
                    {selectedCharacter.generated_image ? (
                      <Button 
                        variant="secondary"
                        onClick={() => generateImage(selectedCharacter.id, selectedCharacter.style_prompt)}
                        disabled={generatingImageFor === selectedCharacter.id}
                      >
                        {generatingImageFor === selectedCharacter.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            재생성 중...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            이미지 재생성
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => generateImage(selectedCharacter.id, selectedCharacter.style_prompt)}
                        disabled={generatingImageFor === selectedCharacter.id}
                      >
                        {generatingImageFor === selectedCharacter.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            생성 중...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            이미지 생성
                          </>
                        )}
                      </Button>
                    )}
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
