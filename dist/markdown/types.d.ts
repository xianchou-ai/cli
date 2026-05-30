export interface MarkdownDocument {
    filePath: string;
    data: Record<string, unknown>;
    content: string;
    raw: string;
}
export interface Heading {
    depth: number;
    text: string;
    lineIndex: number;
}
export interface ImageInsertion {
    kind: 'cover' | 'section';
    title: string;
    anchor?: string;
    prompt: string;
    alt: string;
    filePath: string;
    markdownUrl: string;
    frontmatterUrl?: string;
}
export interface ApplyMarkdownImagesOptions {
    includeCover: boolean;
}
