export interface ImageModel {
  provider_id: string
  provider_name: string
  model_id: string
  model_name: string
  icon_url: string
  description: string
  credits: string
  tags: string[]
  channels: string[]
  ratios_text: string[]
  ratios_image: string[]
  resolutions: string[]
  output_formats: string[]
  qualities: string[]
  nijis: string[]
  styles: string[]
  default_ratio: string
  default_resolution: string
  default_output_format: string
}

export interface ImageModelsResponse {
  success: boolean
  project_id: string
  models: ImageModel[]
  defaults: {
    provider_id: string
    model_id: string
    ratio: string
    resolution: string
    output_format: string
    number: number
  }
}

export type VideoMode = 'text' | 'first' | 'first-last' | 'reference'

export interface VideoModel {
  mode: VideoMode | string
  run_type: string
  provider_id: string
  provider_name: string
  model_id: string
  model_name: string
  icon_url: string
  description: string
  credits: string
  tags: string[]
  channels: string[]
  durations: number[]
  ratios_text: string[]
  ratios_image: string[]
  resolutions: string[]
  audio: boolean
  multi_shot: boolean
  accept_video: boolean
  motions: string[]
  qualities: string[]
  default_duration: string
  default_ratio: string
  default_resolution: string
}

export interface VideoModelsResponse {
  success: boolean
  project_id: string
  modes: string[]
  models: VideoModel[]
  defaults: {
    mode: string
    run_type: string
    provider_id: string
    model_id: string
    ratio: string
    duration: string
    resolution: string
    audio: boolean
  }
}

export interface GenerateImageRequest {
  project_id: string
  prompt: string
  provider_id: string
  model_id: string
  ratio?: string
  resolution?: string
  output_format?: string
  number?: number
  channel?: string
  quality?: string
  niji?: string
  style?: string
  image_urls?: string[]
}

export interface GenerateImageResponse {
  success: boolean
  task_id?: string
  error_message?: string
  error_code?: number | null
  estimated_duration?: number
  is_remote?: boolean
}

export interface GenerateVideoRequest {
  project_id: string
  prompt?: string
  mode?: string
  provider_id: string
  model_id: string
  ratio?: string
  duration?: string
  resolution?: string
  channel?: string
  audio?: boolean
  first_image_url?: string
  last_image_url?: string
  image_urls?: string[]
  video_urls?: string[]
  audio_urls?: string[]
  audio_url?: string
  motion?: string
  quality?: string
  mj_advanced?: boolean
  stylize?: number
  chaos?: number
  weird?: number
}

export interface GenerateVideoResponse {
  success: boolean
  task_id?: string
  error_message?: string
  error_code?: number | null
  estimated_duration?: number
  is_remote?: boolean
}

export interface TaskResponse {
  success: boolean
  task_id: string
  state: 'PENDING' | 'PROGRESS' | 'SUCCESS' | 'FAILURE' | 'REVOKED' | 'EXPIRED' | string
  detail: string
  error_code?: number | null
  poll_interval?: number | null
  is_remote?: boolean
  image_urls: string[]
  video_urls: string[]
  audio_urls: string[]
  raw_result?: Record<string, unknown> | null
}

export interface SettleResponse {
  success: boolean
  value: number
  workspace_quota_remaining?: number | null
}

export interface MarkdownImagePlanRequest {
  title?: string
  description?: string
  headings: string[]
  count: number
  include_cover?: boolean
  audience?: string[]
  keywords?: string[]
}

export interface MarkdownImagePlanItem {
  kind: 'cover' | 'section'
  title: string
  anchor?: string
  prompt: string
  alt: string
}

export interface MarkdownImagePlanResponse {
  success: boolean
  items: MarkdownImagePlanItem[]
}

export interface UploadResponse {
  success: boolean
  url: string
  error_message?: string
}
