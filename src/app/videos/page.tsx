'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Video, Film, Sparkles, Loader2 } from 'lucide-react'

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  processing: 'default',
  completed: 'outline',
  failed: 'destructive',
}

export default function VideosPage() {
  const [open, setOpen] = useState(false)
  const [videos] = useState<any[]>([])
  const [generating, setGenerating] = useState(false)

  // Form state
  const [quickPrompt, setQuickPrompt] = useState('')
  const [title, setTitle] = useState('')
  const [character, setCharacter] = useState('')
  const [track, setTrack] = useState('')
  const [resolution, setResolution] = useState('1080p')
  const [scenePrompt, setScenePrompt] = useState('')

  const handleAIAssist = async () => {
    if (!quickPrompt.trim()) return
    
    setGenerating(true)
    try {
      const res = await fetch('/api/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'video', prompt: quickPrompt })
      })
      
      if (res.ok) {
        const data = await res.json()
        setTitle(data.title || '')
        setScenePrompt(data.scenePrompt || '')
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
    setCharacter('')
    setTrack('')
    setResolution('1080p')
    setScenePrompt('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Videos</h1>
          <p className="text-muted-foreground">
            Create and manage AI-generated music videos
          </p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Video</DialogTitle>
              <DialogDescription>
                Describe your video and let AI plan the scenes
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* AI Assist Section */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-cyan-500" />
                  <span className="text-sm font-medium text-cyan-700">AI Assist</span>
                </div>
                <Textarea 
                  placeholder="뮤비를 자유롭게 설명하세요 (여러 줄 가능)&#10;&#10;예시:&#10;네온 도시 배경 사이버펑크&#10;댄스 퍼포먼스 중심&#10;밤거리 + 루프탑 씬"
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
                      Generate Video Plan
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
                  Title <span className="text-red-500">*</span>
                </label>
                <Input 
                  placeholder="Video title..." 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Character <span className="text-muted-foreground text-xs">(optional)</span>
                  </label>
                  <Select value={character} onValueChange={setCharacter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select character" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" disabled>Create a character first</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">캐릭터 없이도 생성 가능</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Track <span className="text-muted-foreground text-xs">(optional)</span>
                  </label>
                  <Select value={track} onValueChange={setTrack}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select track" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" disabled>Create a track first</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">트랙 없이도 생성 가능</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Scene Description <span className="text-red-500">*</span>
                </label>
                <Textarea 
                  placeholder="Describe the visual scenes... e.g., Character dancing in neon-lit streets, transitions to rooftop with city skyline, ending with close-up shot"
                  className="min-h-[100px]"
                  value={scenePrompt}
                  onChange={(e) => setScenePrompt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Resolution <span className="text-muted-foreground text-xs">(default: 1080p)</span>
                </label>
                <Select value={resolution} onValueChange={setResolution}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="720p">720p</SelectItem>
                    <SelectItem value="1080p">1080p (권장)</SelectItem>
                    <SelectItem value="4k">4K (비용 높음)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => setOpen(false)}
                disabled={!title.trim() || !scenePrompt.trim()}
              >
                Create Video
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {videos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Video className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No videos yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first AI music video
            </p>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Video
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <Card key={video.id} className="cursor-pointer hover:border-primary transition-colors overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                {video.thumbnail_url ? (
                  <img src={video.thumbnail_url} alt={video.title} className="object-cover w-full h-full" />
                ) : (
                  <Film className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{video.title}</CardTitle>
                  <Badge variant={statusColors[video.status]}>
                    {video.status}
                  </Badge>
                </div>
                <CardDescription>
                  {video.resolution} • {video.duration_seconds ? `${Math.floor(video.duration_seconds / 60)}:${(video.duration_seconds % 60).toString().padStart(2, '0')}` : 'Processing...'}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
