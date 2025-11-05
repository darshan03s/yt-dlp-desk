import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fetch } from 'undici'

const DOWNLOAD_URL = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe'

export async function downloadYtDlpLatestRelease(targetDir: string): Promise<string> {
  await mkdir(targetDir, { recursive: true })
  const outputPath = path.join(targetDir, 'yt-dlp.exe')

  const res = await fetch(DOWNLOAD_URL)
  if (!res.ok) throw new Error(`Failed to download: ${res.status}`)

  const buffer = Buffer.from(await res.arrayBuffer())
  await writeFile(outputPath, buffer)

  return outputPath
}
