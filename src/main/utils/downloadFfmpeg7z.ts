import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fetch } from 'undici';

const DOWNLOAD_URL =
  'https://github.com/darshan03s/ffmpeg-8.0/releases/download/1.0.0/ffmpeg-8.0-full_build.7z';

export async function downloadFfmpeg7z(targetDir: string): Promise<string> {
  await mkdir(targetDir, { recursive: true });
  const outputPath = path.join(targetDir, 'ffmpeg.7z');

  const res = await fetch(DOWNLOAD_URL);
  if (!res.ok) throw new Error(`Failed to download: ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(outputPath, buffer);

  return outputPath;
}
