import { CliError } from '../errors.js'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type {
  GenerateImageRequest,
  GenerateImageResponse,
  GenerateVideoRequest,
  GenerateVideoResponse,
  ImageModelsResponse,
  MarkdownImagePlanRequest,
  MarkdownImagePlanResponse,
  SettleResponse,
  TaskResponse,
  UploadResponse,
  VideoModelsResponse,
} from './types.js'

export interface XianchouClientOptions {
  apiUrl: string
  accessKey: string
}

export class XianchouClient {
  private readonly apiUrl: string
  private readonly accessKey: string

  constructor(options: XianchouClientOptions) {
    this.apiUrl = options.apiUrl.replace(/\/+$/, '')
    this.accessKey = options.accessKey
  }

  async getImageModels(projectId: string): Promise<ImageModelsResponse> {
    return this.request<ImageModelsResponse>(
      `/api/cli/models/image?project_id=${encodeURIComponent(projectId)}`
    )
  }

  async getVideoModels(projectId: string): Promise<VideoModelsResponse> {
    return this.request<VideoModelsResponse>(
      `/api/cli/models/video?project_id=${encodeURIComponent(projectId)}`
    )
  }

  async generateImage(
    request: GenerateImageRequest
  ): Promise<GenerateImageResponse> {
    return this.request<GenerateImageResponse>('/api/cli/images/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async generateVideo(
    request: GenerateVideoRequest
  ): Promise<GenerateVideoResponse> {
    return this.request<GenerateVideoResponse>('/api/cli/videos/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async getTask(taskId: string): Promise<TaskResponse> {
    return this.request<TaskResponse>(
      `/api/cli/tasks/${encodeURIComponent(taskId)}`
    )
  }

  async settleTask(taskId: string): Promise<SettleResponse> {
    return this.request<SettleResponse>(
      `/api/cli/tasks/${encodeURIComponent(taskId)}/settle`,
      { method: 'POST' }
    )
  }

  async planMarkdownImages(
    request: MarkdownImagePlanRequest
  ): Promise<MarkdownImagePlanResponse> {
    return this.request<MarkdownImagePlanResponse>(
      '/api/cli/markdown/images/plan',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    )
  }

  async uploadFile(filePath: string): Promise<UploadResponse> {
    if (!this.accessKey) {
      throw new CliError(
        'Missing Access Key. Run `xianchou auth login --key <key>` or set XIANCHOU_ACCESS_KEY.'
      )
    }

    const fileData = await readFile(filePath)
    const fileName = path.basename(filePath)

    const formData = new FormData()
    formData.append('file', new Blob([fileData]), fileName)

    const response = await fetch(`${this.apiUrl}/api/cli/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessKey}`,
      },
      body: formData,
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : {}
    if (!response.ok) {
      const message =
        data?.message || data?.detail || `HTTP ${response.status} ${response.statusText}`
      throw new CliError(String(message))
    }
    return data as UploadResponse
  }

  private async request<T>(pathname: string, init: RequestInit = {}): Promise<T> {
    if (!this.accessKey) {
      throw new CliError(
        'Missing Access Key. Run `xianchou auth login --key <key>` or set XIANCHOU_ACCESS_KEY.'
      )
    }

    const response = await fetch(`${this.apiUrl}${pathname}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessKey}`,
        ...(init.headers || {}),
      },
    })

    const text = await response.text()
    const data = text ? JSON.parse(text) : {}
    if (!response.ok) {
      const message =
        data?.message || data?.detail || `HTTP ${response.status} ${response.statusText}`
      throw new CliError(String(message))
    }
    return data as T
  }
}

export async function downloadFile(url: string): Promise<Uint8Array> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new CliError(`Failed to download ${url}: HTTP ${response.status}`)
  }
  return new Uint8Array(await response.arrayBuffer())
}
