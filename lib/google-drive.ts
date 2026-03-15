import { google } from 'googleapis';

// ─── Auth ────────────────────────────────────────────────────────────────────

function getAuthClient() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const rawKey = process.env.GOOGLE_PRIVATE_KEY;
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!email || !rawKey || !folderId) {
        throw new Error(
            'Missing required environment variables: ' +
            'GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_DRIVE_FOLDER_ID'
        );
    }

    const privateKey = rawKey.replace(/\\n/g, '\n');

    const auth = new google.auth.JWT({
        email,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    return auth;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DriveFile {
    id: string;
    name: string;
    modifiedTime: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Exponential backoff retry wrapper */
async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries = 4
): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err: unknown) {
            const error = err as { code?: number; status?: number };
            const isRateLimit = error.code === 429 || error.status === 429;
            if (isRateLimit && attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
                await new Promise((r) => setTimeout(r, delay));
                continue;
            }
            throw err;
        }
    }
    throw new Error('Max retries exceeded');
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Lists all .docx files in the configured Drive folder.
 * Handles pagination automatically for repos with >100 documents.
 */
export async function listDocFiles(): Promise<DriveFile[]> {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID!;
    const auth = getAuthClient();
    const drive = google.drive({ version: 'v3', auth });

    const files: DriveFile[] = [];
    let pageToken: string | undefined;

    do {
        const res = await withRetry(() =>
            drive.files.list({
                q: `'${folderId}' in parents and mimeType != 'application/vnd.google-apps.folder' and name contains '.docx' and trashed = false`,
                fields: 'nextPageToken, files(id, name, modifiedTime)',
                pageSize: 100,
                pageToken,
                orderBy: 'modifiedTime desc',
            })
        );

        const batch = res.data.files as DriveFile[] | undefined;
        if (batch) files.push(...batch);
        pageToken = res.data.nextPageToken ?? undefined;
    } while (pageToken);

    return files;
}

/**
 * Downloads a Drive file and returns it as a Node.js Buffer.
 * Uses stream-based processing to maintain a stable memory footprint.
 */
export async function downloadDocBuffer(fileId: string): Promise<Buffer> {
    const auth = getAuthClient();
    const drive = google.drive({ version: 'v3', auth });

    const response = await withRetry(() =>
        drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'stream' }
        )
    );

    return new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stream = response.data as any;
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}
