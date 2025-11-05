import { ipcMain } from 'electron'
import { getStoreManager } from './store'
import log from 'electron-log'
import {
  getFfmpegFromPc,
  getSettings,
  getYtdlpFromPc,
  getYtdlpVersionFromPc
} from './utils/appUtils'
import { FFMPEG_FOLDER_PATH, YTDLP_EXE_PATH, YTDLP_FOLDER_PATH } from '.'
import { copyFileToFolder, copyFolder } from './utils/fsUtils'
import path from 'node:path'
import { downloadYtDlpLatestRelease } from './utils/downloadYtdlp'

export async function addListeners() {
  const store = await getStoreManager()
  ipcMain.handle('renderer:init', async () => {
    try {
      log.info('Renderer initialized')

      const settings = await getSettings()

      return settings
    } catch (err) {
      log.error('Failed to initialize renderer:', err)
      return { ytdlpPath: null, ytdlpVersion: null, ffmpegPath: null, ffmpegVersion: null }
    }
  })

  ipcMain.handle('yt-dlp:confirm', async () => {
    try {
      log.info('Checking yt-dlp in PC...')

      const { ytdlpVersionInPc, ytdlpPathInPc } = await getYtdlpFromPc()

      if (ytdlpPathInPc) {
        await copyFileToFolder(ytdlpPathInPc, YTDLP_FOLDER_PATH)
        store.set('settings.ytdlpPath', YTDLP_EXE_PATH)
        store.set('settings.ytdlpVersion', ytdlpVersionInPc)
      }

      log.info(`yt-dlp path in PC: ${ytdlpPathInPc}`)
      log.info(`yt-dlp version in PC: ${ytdlpVersionInPc}`)

      return { ytdlpVersionInPc, ytdlpPathInPc }
    } catch (err) {
      log.error(err)
      return { ytdlpPathInPc: null, ytdlpVersionInPc: null }
    }
  })

  ipcMain.handle('ffmpeg:confirm', async () => {
    try {
      log.info('Checking ffmpeg in PC...')

      const { ffmpegVersionInPc, ffmpegPathInPc } = await getFfmpegFromPc()

      if (ffmpegPathInPc) {
        const ffmpegFolderInPc = path.dirname(ffmpegPathInPc)
        copyFolder(ffmpegFolderInPc, FFMPEG_FOLDER_PATH)
        store.set('settings.ffmpegPath', FFMPEG_FOLDER_PATH)
        store.set('settings.ffmpegVersion', ffmpegVersionInPc)
      }

      log.info(`ffmpeg path in PC: ${ffmpegPathInPc}`)
      log.info(`ffmpeg version in PC: ${ffmpegVersionInPc}`)

      return { ffmpegVersionInPc, ffmpegPathInPc }
    } catch (err) {
      log.error(err)
      return { ffmpegPathInPc: null, ffmpegVersionInPc: null }
    }
  })

  ipcMain.handle('yt-dlp:download', async () => {
    try {
      log.info('Downloading yt-dlp...')

      const outputPath = await downloadYtDlpLatestRelease(YTDLP_FOLDER_PATH)
      log.info('Downloaded yt-dlp latest release')

      const ytdlpVersionInPc = await getYtdlpVersionFromPc(outputPath)

      store.set('settings.ytdlpPath', outputPath)
      store.set('settings.ytdlpVersion', ytdlpVersionInPc)

      log.info(`yt-dlp downloaded: ${outputPath}`)
      log.info(`yt-dlp downloaded version: ${ytdlpVersionInPc}`)

      return { ytdlpVersionInPc, ytdlpPathInPc: outputPath }
    } catch (err) {
      log.error('Failed to download yt-dlp:', err)
      return { ytdlpVersionInPc: null, ytdlpPathInPc: null }
    }
  })
}
