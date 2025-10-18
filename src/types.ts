// Common types for the application

export interface Provider {
  id: number
  name: string
  description?: string
  website?: string
  whatsapp?: string
  phone?: string
  category?: string
  type?: string
  city?: string
  area?: string
  address?: string
  map_url?: string
  lat?: number
  lng?: number
  created_at?: string
  updated_at?: string
  subscription_start?: string
  subscription_end?: string
  package_id?: number
  activity_id?: number
  image_url?: string
  online_service?: boolean
  show_on_map?: boolean
  delivery?: boolean
  user_id?: string
  status?: string
}

export interface Service {
  id: number
  provider_id: number
  name: string
  description?: string
  price?: number
  image_url?: string
  delivery?: boolean
  online?: boolean
  created_at?: string
  providers?: { name: string; city?: string }
}

export interface Ad {
  id: number
  provider_id: number
  service_id?: number
  title: string
  description?: string
  start_date?: string
  end_date?: string
  created_at?: string
  status?: string
  providers?: { name: string; city?: string }
  ads_images: { image_url: string }[]
}

export interface AuthUser {
  id: string
  email?: string
  full_name?: string | null
}

export interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
}

export interface Activity {
  id: number
  name: string
  description?: string
  created_at?: string
}

export interface Area {
  id: number
  name: string
  city_id: number
}

export interface City {
  id: number
  name: string
}

// Supabase error type
export interface SupabaseError {
  message: string
  code?: string
  details?: string
  hint?: string
}
