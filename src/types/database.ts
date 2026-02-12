export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      characters: {
        Row: {
          id: string
          name: string
          description: string | null
          style_prompt: string
          reference_images: string[]
          generated_image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          style_prompt: string
          reference_images?: string[]
          generated_image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          style_prompt?: string
          reference_images?: string[]
          generated_image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          character_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          character_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          character_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tracks: {
        Row: {
          id: string
          title: string
          genre: string | null
          lyrics: string | null
          prompt: string | null
          audio_url: string | null
          duration_seconds: number | null
          bpm: number | null
          character_id: string | null
          project_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          genre?: string | null
          lyrics?: string | null
          prompt?: string | null
          audio_url?: string | null
          duration_seconds?: number | null
          bpm?: number | null
          character_id?: string | null
          project_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          genre?: string | null
          lyrics?: string | null
          prompt?: string | null
          audio_url?: string | null
          duration_seconds?: number | null
          bpm?: number | null
          character_id?: string | null
          project_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      videos: {
        Row: {
          id: string
          title: string
          track_id: string | null
          character_id: string | null
          project_id: string | null
          storyboard: Json
          clips: Json
          final_url: string | null
          thumbnail_url: string | null
          status: 'draft' | 'processing' | 'completed' | 'failed'
          duration_seconds: number | null
          resolution: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          track_id?: string | null
          character_id?: string | null
          project_id?: string | null
          storyboard?: Json
          clips?: Json
          final_url?: string | null
          thumbnail_url?: string | null
          status?: 'draft' | 'processing' | 'completed' | 'failed'
          duration_seconds?: number | null
          resolution?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          track_id?: string | null
          character_id?: string | null
          project_id?: string | null
          storyboard?: Json
          clips?: Json
          final_url?: string | null
          thumbnail_url?: string | null
          status?: 'draft' | 'processing' | 'completed' | 'failed'
          duration_seconds?: number | null
          resolution?: string
          created_at?: string
          updated_at?: string
        }
      }
      generations: {
        Row: {
          id: string
          type: 'image' | 'video' | 'audio' | 'lipsync'
          model: string
          prompt: string | null
          input_params: Json
          output_url: string | null
          replicate_id: string | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          error_message: string | null
          video_id: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          type: 'image' | 'video' | 'audio' | 'lipsync'
          model: string
          prompt?: string | null
          input_params?: Json
          output_url?: string | null
          replicate_id?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          video_id?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          type?: 'image' | 'video' | 'audio' | 'lipsync'
          model?: string
          prompt?: string | null
          input_params?: Json
          output_url?: string | null
          replicate_id?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          video_id?: string | null
          created_at?: string
          completed_at?: string | null
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

// Helper types
export type Character = Database['public']['Tables']['characters']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type Track = Database['public']['Tables']['tracks']['Row']
export type Video = Database['public']['Tables']['videos']['Row']
export type Generation = Database['public']['Tables']['generations']['Row']
