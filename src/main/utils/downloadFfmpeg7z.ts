import { LINKS } from '@main/data';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fetch } from 'undici';

export async function downloadFfmpeg7z(targetDir: string): Promise<string> {
  await mkdir(targetDir, { recursive: true });
  const outputPath = path.join(targetDir, 'ffmpeg.7z');

  const res = await fetch(LINKS.ffmpeg8);
  if (!res.ok) throw new Error(`Failed to download: ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(outputPath, buffer);

  return outputPath;
}
