'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Music, Play, Sparkles, Loader2, Pencil, Trash2 } from 'lucide-react'

const genres = ['City Pop', 'K-Pop', 'Pop', 'Rock', 'Hip-Hop', 'Electronic', 'R&B', 'Jazz', 'Lo-Fi', 'Indie']

export default function TracksPage() {
  const [open, setOpen] = useState(false)
  const [tracks, setTracks] = useState<any[]>([])
  const [generating, setGenerating] = useState(false)
  const [creating, setCreating] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState<any | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', genre: '', lyrics: '', prompt: '', audio_url: '' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchTracks = async () => {
    try {
      const res = await fetch('/api/tracks')
      if (res.ok) {
        const data = await res.json()
        setTracks(data)
      }
    } catch (e) {
      console.error('Failed to fetch tracks:', e)
    }
  }

  useEffect(() => {
    fetchTracks()
  }, [])

  // Form state
  const [quickPrompt, setQuickPrompt] = useState('')
  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState('')
  const [lyrics, setLyrics] = useState('')
  const [generationPrompt, setGenerationPrompt] = useState('')
  const [audioUrl, setAudioUrl] = useState('')

  const handleAIAssist = async () => {
    if (!quickPrompt.trim()) return
    
    setGenerating(true)
    try {
      const res = await fetch('/api/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'track', prompt: quickPrompt })
      })
      
      if (res.ok) {
        const data = await res.json()
        setTitle(data.title || '')
        setGenre(data.genre?.toLowerCase() || '')
        setLyrics(data.lyrics || '')
        setGenerationPrompt(data.generationPrompt || '')
      }
    } catch (e) {
      console.error('AI assist failed:', e)
    } finally {
      setGenerating(false)
    }
  }

  const resetForm = () => {
    setQuickPrompt('')
    setTitle('')
    setGenre('')
    setLyrics('')
    setGenerationPrompt('')
    setAudioUrl('')
  }

  const handleCreateTrack = async () => {
    if (!title.trim() || !genre || !generationPrompt.trim()) return
    
    setCreating(true)
    try {
      const res = await fetch('/api/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          genre,
          lyrics: lyrics.trim() || null,
          prompt: generationPrompt.trim(),
          audio_url: audioUrl.trim() || null
        })
      })
      
      if (res.ok) {
        const newTrack = await res.json()
        setTracks(prev => [newTrack, ...prev])
        setOpen(false)
        resetForm()
      } else {
        const error = await res.json()
        alert('트랙 생성 실패: ' + (error.error || 'Unknown error'))
      }
    } catch (e) {
      console.error('Error creating track:', e)
      alert('트랙 생성 중 오류가 발생했습니다.')
    } finally {
      setCreating(false)
    }
  }

  const startEditing = () => {
    if (selectedTrack) {
      setEditForm({
        title: selectedTrack.title || '',
        genre: selectedTrack.genre || '',
        lyrics: selectedTrack.lyrics || '',
        prompt: selectedTrack.prompt || '',
        audio_url: selectedTrack.audio_url || ''
      })
      setIsEditing(true)
    }
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditForm({ title: '', genre: '', lyrics: '', prompt: '', audio_url: '' })
  }

  const handleUpdateTrack = async () => {
    if (!selectedTrack || !editForm.title.trim()) return
    
    setSaving(true)
    try {
      const res = await fetch(`/api/tracks/${selectedTrack.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title.trim(),
          genre: editForm.genre,
          lyrics: editForm.lyrics.trim() || null,
          prompt: editForm.prompt.trim(),
          audio_url: editForm.audio_url.trim() || null
        })
      })
      
      if (res.ok) {
        const updated = await res.json()
        setTracks(prev => prev.map(t => t.id === updated.id ? updated : t))
        setSelectedTrack(updated)
        setIsEditing(false)
      } else {
        const error = await res.json()
        alert('수정 실패: ' + (error.error || 'Unknown error'))
      }
    } catch (e) {
      console.error('Error updating track:', e)
      alert('트랙 수정 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTrack = async () => {
    if (!selectedTrack) return
    if (!confirm(`정말 "${selectedTrack.title}"을(를) 삭제하시겠습니까?`)) return
    
    setDeleting(true)
    try {
      const res = await fetch(`/api/tracks/${selectedTrack.id}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        setTracks(prev => prev.filter(t => t.id !== selectedTrack.id))
        setSelectedTrack(null)
      } else {
        const error = await res.json()
        alert('삭제 실패: ' + (error.error || 'Unknown error'))
      }
    } catch (e) {
      console.error('Error deleting track:', e)
      alert('트랙 삭제 중 오류가 발생했습니다.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tracks</h1>
          <p className="text-muted-foreground">
            Manage your music tracks and lyrics
          </p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Track
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Track</DialogTitle>
              <DialogDescription>
                Describe your song and let AI create the details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* AI Assist Section */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-700">AI Assist</span>
                </div>
                <Textarea 
                  placeholder="곡을 자유롭게 설명하세요 (여러 줄 가능)&#10;&#10;예시:&#10;여름밤 드라이브에 어울리는 시티팝&#10;80년대 레트로 신스&#10;여성 보컬, 120 BPM"
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    placeholder="Track title..." 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Genre <span className="text-red-500">*</span>
                  </label>
                  <Select value={genre} onValueChange={setGenre}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((g) => (
                        <SelectItem key={g} value={g.toLowerCase()}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Lyrics <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <Textarea 
                  placeholder="Enter song lyrics..."
                  className="min-h-[120px] font-mono"
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Generation Prompt <span className="text-red-500">*</span>
                </label>
                <Textarea 
                  placeholder="Style/mood description for AI music generation..."
                  value={generationPrompt}
                  onChange={(e) => setGenerationPrompt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Audio URL <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <Input 
                  placeholder="Link to existing audio file..." 
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTrack}
                disabled={!title.trim() || !genre || !generationPrompt.trim() || creating}
              >
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Track'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {tracks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Music className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No tracks yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first music track
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Track
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tracks.map((track) => (
            <Card 
              key={track.id} 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setSelectedTrack(track)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    {track.title}
                  </CardTitle>
                  <Badge>{track.genre}</Badge>
                </div>
                <CardDescription>
                  {track.duration_seconds ? `${Math.floor(track.duration_seconds / 60)}:${(track.duration_seconds % 60).toString().padStart(2, '0')}` : 'No audio'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 font-mono">
                  {track.lyrics || 'No lyrics'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Track Detail Dialog */}
      <Dialog open={!!selectedTrack} onOpenChange={(open) => { if (!open) { setSelectedTrack(null); cancelEditing(); } }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedTrack && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                      <Music className="h-6 w-6" />
                      {isEditing ? '트랙 수정' : selectedTrack.title}
                    </DialogTitle>
                    <DialogDescription>
                      {isEditing ? '트랙 정보를 수정합니다' : selectedTrack.genre}
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
                        onClick={handleDeleteTrack}
                        disabled={deleting}
                        className="text-destructive hover:text-destructive"
                      >
                        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  )}
                </div>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input 
                          value={editForm.title}
                          onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Genre</label>
                        <Select value={editForm.genre} onValueChange={(v) => setEditForm(prev => ({ ...prev, genre: v }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {genres.map((g) => (
                              <SelectItem key={g} value={g.toLowerCase()}>{g}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Lyrics</label>
                      <Textarea 
                        className="min-h-[200px] font-mono"
                        value={editForm.lyrics}
                        onChange={(e) => setEditForm(prev => ({ ...prev, lyrics: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Generation Prompt</label>
                      <Textarea 
                        className="min-h-[100px]"
                        value={editForm.prompt}
                        onChange={(e) => setEditForm(prev => ({ ...prev, prompt: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Audio URL</label>
                      <Input 
                        value={editForm.audio_url}
                        onChange={(e) => setEditForm(prev => ({ ...prev, audio_url: e.target.value }))}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {selectedTrack.lyrics && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Lyrics</h4>
                        <div className="bg-muted rounded-md p-4 max-h-[300px] overflow-y-auto">
                          <pre className="text-sm whitespace-pre-wrap font-mono">{selectedTrack.lyrics}</pre>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Generation Prompt</h4>
                      <div className="bg-muted rounded-md p-3">
                        <p className="text-sm text-muted-foreground">{selectedTrack.prompt}</p>
                      </div>
                    </div>
                    
                    {selectedTrack.audio_url && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Audio</h4>
                        <audio controls className="w-full">
                          <source src={selectedTrack.audio_url} />
                        </audio>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      생성일: {new Date(selectedTrack.created_at).toLocaleString('ko-KR')}
                    </div>
                  </>
                )}
              </div>
              
              <DialogFooter>
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={cancelEditing}>취소</Button>
                    <Button onClick={handleUpdateTrack} disabled={saving || !editForm.title.trim()}>
                      {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />저장 중...</> : '저장'}
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setSelectedTrack(null)}>닫기</Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
