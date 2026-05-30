import { z } from 'zod';
declare const configSchema: z.ZodObject<{
    accessKey: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
    apiUrl: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type XianchouConfig = z.infer<typeof configSchema>;
export declare const DEFAULT_API_URL = "https://api.xianchou.com";
export declare function getConfigDir(): string;
export declare function getConfigPath(): string;
export declare function readStoredConfig(): Promise<XianchouConfig>;
export declare function writeStoredConfig(config: XianchouConfig): Promise<void>;
export declare function resolveConfig(): Promise<Required<XianchouConfig>>;
export declare function saveAuthConfig(options: {
    key: string;
    projectId?: string;
    apiUrl?: string;
}): Promise<XianchouConfig>;
export {};
