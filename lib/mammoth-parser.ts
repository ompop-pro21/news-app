import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';

export interface ParseResult {
    html: string;
    warnings: string[];
}

/**
 * Parses a .docx Buffer into clean semantic HTML.
 * Embedded images are extracted to /public/images/<slug>/ and
 * replaced with relative URL paths — avoiding base64 bloat.
 */
export async function parseDocx(
    buffer: Buffer,
    slug: string
): Promise<ParseResult> {
    // Ensure the image output directory exists
    const imageDir = path.join(process.cwd(), 'public', 'images', slug);
    fs.mkdirSync(imageDir, { recursive: true });

    let imageIndex = 0;

    const result = await mammoth.convertToHtml(
        { buffer },
        {
            convertImage: mammoth.images.imgElement(async (image) => {
                const ext = image.contentType.split('/')[1] ?? 'png';
                const filename = `img-${++imageIndex}.${ext}`;
                const filePath = path.join(imageDir, filename);
                const imageBuffer = await image.read();
                fs.writeFileSync(filePath, imageBuffer);
                return { src: `/images/${slug}/${filename}` };
            }),
        }
    );

    return {
        html: result.value,
        warnings: result.messages
            .filter((m) => m.type === 'warning')
            .map((m) => m.message),
    };
}
