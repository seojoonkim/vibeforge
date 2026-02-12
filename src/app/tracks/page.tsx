'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Music, Play, Sparkles, Loader2 } from 'lucide-react'

const genres = ['City Pop', 'K-Pop', 'Pop', 'Rock', 'Hip-Hop', 'Electronic', 'R&B', 'Jazz', 'Lo-Fi', 'Indie']

export default function TracksPage() {
  const [open, setOpen] = useState(false)
  const [tracks, setTracks] = useState<any[]>([])
  const [generating, setGenerating] = useState(false)
  const [creating, setCreating] = useState(false)

  // Fetch tracks on mount
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
          generation_prompt: generationPrompt.trim(),
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
                  Lyrics <span className="text-muted-foreground text-xs">(optional - leave empty for instrumental)</span>
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
                  placeholder="Style/mood description for AI music generation... e.g., upbeat city pop with 80s synth, female vocals, 120 BPM"
                  value={generationPrompt}
                  onChange={(e) => setGenerationPrompt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Audio URL <span className="text-muted-foreground text-xs">(optional - if you have existing audio)</span>
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
            <Card key={track.id} className="cursor-pointer hover:border-primary transition-colors">
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
    </div>
  )
}
