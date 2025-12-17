import {
  access,
  mkdir,
  cp,
  copyFile,
  readFile,
  writeFile,
  stat,
  unlink,
  readdir
} from 'node:fs/promises';
import { accessSync, constants, createWriteStream, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fetch } from 'undici';
import { Readable } from 'node:stream';
import { pathToFileURL } from 'node:url';

export async function pathExists(pathToCheck: string): Promise<boolean> {
  try {
    await access(pathToCheck, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export function pathExistsSync(pathToCheck: string): boolean {
  try {
    accessSync(pathToCheck, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export function makeDirs(path: string) {
  mkdirSync(path, { recursive: true });
}

export async function copyFileToFolder(filePath: string, destinationFolder: string) {
  try {
    const fileName = path.basename(filePath);
    const destinationPath = path.join(destinationFolder, fileName);

    makeDirs(destinationFolder);

    await copyFile(filePath, destinationPath);

    return { success: true, destinationPath };
  } catch (error) {
    return { success: false, error: error };
  }
}

export async function copyFolder(srcDir: string, destDir: string) {
  try {
    await mkdir(destDir, { recursive: true });

    await cp(srcDir, destDir, { recursive: true });

    console.log(`Copied ${srcDir} → ${destDir}`);
  } catch (err) {
    console.error('Error copying folder:', err);
  }
}

export async function readJson<T = unknown>(path: string): Promise<T> {
  const raw = await readFile(path, 'utf-8');
  return JSON.parse(raw) as T;
}

export async function writeJson(path: string, data: unknown): Promise<void> {
  const formatted = JSON.stringify(data, null, 2);
  await writeFile(path, formatted, 'utf-8');
}

export async function downloadFile(params: {
  url: string;
  destinationPath: string;
}): Promise<void> {
  const { url, destinationPath } = params;

  try {
    const dir = path.dirname(destinationPath);
    await mkdir(dir, { recursive: true });

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download. HTTP ${response.status}`);
    }

    const body = response.body;
    if (!body) {
      throw new Error('Response body is null');
    }

    const nodeReadable = Readable.fromWeb(body);
    const fileStream = createWriteStream(destinationPath);

    await new Promise<void>((resolve, reject) => {
      nodeReadable.pipe(fileStream);
      nodeReadable.on('error', reject);
      fileStream.on('finish', resolve);
      fileStream.on('error', reject);
    });
  } catch (err) {
    throw new Error(`Failed to download file: ${(err as Error).message}`);
  }
}

export function sanitizeFileName(name: string, replace: string = ''): string {
  let sanitized = name.normalize('NFKD');
  sanitized = sanitized.replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, '-');
  sanitized = sanitized.replace(/\u2019/g, "'");
  sanitized = sanitized.replace(/[\u201C\u201D]/g, '"');
  sanitized = sanitized.replace(/[<>:"/\\|?*]/g, replace).trim();
  return sanitized;
}

export function removeEmoji(name: string, replace: string = ''): string {
  return name.replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, replace);
}

export function filePathToFileUrl(inputPath: string): string {
  try {
    const platformNormalized = path.normalize(inputPath);

    const fileUrl = pathToFileURL(platformNormalized).toString();

    return fileUrl;
  } catch (error) {
    throw new Error(`Failed to convert file path to file URL: ${(error as Error).message}`);
  }
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid file path');
    }

    const normalized = path.normalize(filePath);

    await stat(normalized);

    await unlink(normalized);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return;
    }

    throw new Error(`Failed to remove file "${filePath}": ${(error as Error).message}`);
  }
}

export function getFileExtension(filePath: string | undefined): string {
  if (!filePath) return '';
  const ext = path.extname(filePath).trim();
  return ext.startsWith('.') ? ext.slice(1) : ext;
}

export async function listFolderItems(dirPath: string): Promise<string[]> {
  return await readdir(dirPath);
}
