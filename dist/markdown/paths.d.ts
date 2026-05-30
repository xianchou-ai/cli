export interface MarkdownPathOptions {
    articlePath: string;
    assetsDir?: string;
    publicUrlPrefix?: string;
}
export declare function resolveAssetsDir(options: MarkdownPathOptions): string;
export declare function resolvePublicUrlPrefix(options: MarkdownPathOptions, assetsDir: string): string;
export declare function toMarkdownUrl(prefix: string, fileName: string): string;
