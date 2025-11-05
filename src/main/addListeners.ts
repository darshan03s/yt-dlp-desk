import { ipcMain } from 'electron'
import { getStoreManager } from './store'
import log from 'electron-log'
import {
  getFfmpegFromPc,
  getFfmpegFromSettings,
  getYtdlpFromPc,
  getYtdlpFromSettings
} from './utils/appUtils'
import { FFMPEG_FOLDER_PATH, YTDLP_EXE_PATH, YTDLP_FOLDER_PATH } from '.'
import { copyFileToFolder, copyFolder } from './utils/fsUtils'
import path from 'node:path'

export async function addListeners() {
  const store = await getStoreManager()
  ipcMain.handle('renderer:init', async () => {
    try {
      log.info('Renderer initialized')

      const { ytdlpVersion, ytdlpPath } = await getYtdlpFromSettings()
      const { ffmpegVersion, ffmpegPath } = await getFfmpegFromSettings()

      return { ytdlpPath, ytdlpVersion, ffmpegPath, ffmpegVersion }
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
}
