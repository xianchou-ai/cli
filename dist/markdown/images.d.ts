import { XianchouClient } from '../api/client.js';
import type { ImageInsertion } from './types.js';
export interface MarkdownImagesOptions {
    file: string;
    count: number;
    includeCover: boolean;
    assetsDir?: string;
    publicUrlPrefix?: string;
    projectId: string;
    providerId?: string;
    modelId?: string;
    channel?: string;
    ratio?: string;
    resolution?: string;
    outputFormat?: string;
}
export interface MarkdownImagesResult {
    file: string;
    assets_dir: string;
    public_url_prefix: string;
    insertions: ImageInsertion[];
}
export declare function runMarkdownImages(client: XianchouClient, options: MarkdownImagesOptions): Promise<MarkdownImagesResult>;
