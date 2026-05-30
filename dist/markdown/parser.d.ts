import type { Heading, MarkdownDocument } from './types.js';
export declare function readMarkdownDocument(filePath: string): Promise<MarkdownDocument>;
export declare function getTitle(document: MarkdownDocument): string;
export declare function getDescription(document: MarkdownDocument): string;
export declare function getStringArrayField(document: MarkdownDocument, field: string): string[];
export declare function extractHeadings(content: string): Heading[];
export declare function slugFromDocument(document: MarkdownDocument): string;
