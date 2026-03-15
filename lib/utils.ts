import fs from 'fs';
import path from 'path';

export interface SearchEntry {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    modifiedTime: string;
}

/**
 * Strips HTML tags and truncates to a plain-text excerpt.
 */
export function excerptFromHtml(html: string, maxChars = 200): string {
    const plain = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return plain.length > maxChars ? plain.slice(0, maxChars) + '…' : plain;
}

/**
 * Converts a Google Drive filename (e.g. "My Report.docx") to a URL slug
 * (e.g. "my-report").
 */
export function slugify(filename: string): string {
    return filename
        .replace(/\.docx$/i, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Writes a static JSON search index to public/search-index.json.
 * Called once at build time after all documents are parsed.
 */
export function writeSearchIndex(entries: SearchEntry[]): void {
    const outputPath = path.join(process.cwd(), 'public', 'search-index.json');
    fs.writeFileSync(outputPath, JSON.stringify(entries, null, 2));
}
