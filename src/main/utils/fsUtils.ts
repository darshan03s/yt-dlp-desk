import { access, mkdir, cp, copyFile, readFile, writeFile } from 'node:fs/promises';
import { accessSync, constants, mkdirSync } from 'node:fs';
import path from 'node:path';

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
