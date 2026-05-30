import type { GenerateImageRequest, GenerateImageResponse, GenerateVideoRequest, GenerateVideoResponse, ImageModelsResponse, MarkdownImagePlanRequest, MarkdownImagePlanResponse, SettleResponse, TaskResponse, VideoModelsResponse } from './types.js';
export interface XianchouClientOptions {
    apiUrl: string;
    accessKey: string;
}
export declare class XianchouClient {
    private readonly apiUrl;
    private readonly accessKey;
    constructor(options: XianchouClientOptions);
    getImageModels(projectId: string): Promise<ImageModelsResponse>;
    getVideoModels(projectId: string): Promise<VideoModelsResponse>;
    generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse>;
    generateVideo(request: GenerateVideoRequest): Promise<GenerateVideoResponse>;
    getTask(taskId: string): Promise<TaskResponse>;
    settleTask(taskId: string): Promise<SettleResponse>;
    planMarkdownImages(request: MarkdownImagePlanRequest): Promise<MarkdownImagePlanResponse>;
    private request;
}
export declare function downloadFile(url: string): Promise<Uint8Array>;
