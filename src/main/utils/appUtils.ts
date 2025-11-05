import { getStoreManager } from '../store'
import { exec } from 'child_process'
import { promisify } from 'util'
import log from 'electron-log'
const execPromise = promisify(exec)

export async function getYtdlpFromSettings() {
  const store = await getStoreManager()
  const ytdlpPath = store.get('settings.ytdlpPath') as string
  const ytdlpVersion = store.get('settings.ytdlpVersion') as string

  return {
    ytdlpPath,
    ytdlpVersion
  }
}

export async function getFfmpegFromSettings() {
  const store = await getStoreManager()
  const ffmpegPath = store.get('settings.ffmpegPath') as string
  const ffmpegVersion = store.get('settings.ffmpegVersion') as string

  return {
    ffmpegPath,
    ffmpegVersion
  }
}

export async function getSettings() {
  const store = await getStoreManager()
  return store.get('settings')
}

async function getAppPath(appName: string) {
  try {
    let command: string
    if (process.platform === 'win32') {
      command = `(Get-Command ${appName}).Source`
      const { stdout } = await execPromise(command, { shell: 'powershell.exe' })
      return { found: true, path: stdout.trim() }
    } else {
      command = `which ${appName}`
      const { stdout } = await execPromise(command)
      return { found: true, path: stdout.trim() }
    }
  } catch (error) {
    log.error(error)
    return { found: false, path: null }
  }
}

async function appExistsInPc(appName: string) {
  const { found } = await getAppPath(appName)
  return found
}

export async function getYtdlpVersionFromPc(ytdlpPath: string = 'yt-dlp') {
  const { stdout } = await execPromise(`${ytdlpPath} --version`)
  return stdout.trim()
}

async function getFfmpegVersionFromPc() {
  const { stdout } = await execPromise('ffmpeg -version')
  const match = stdout.match(/ffmpeg version\s+(\d+(?:\.\d+)?)/)
  const version = match ? match[1] : null
  return version
}

export async function getYtdlpFromPc() {
  if (await appExistsInPc('yt-dlp')) {
    return {
      ytdlpPathInPc: (await getAppPath('yt-dlp')).path,
      ytdlpVersionInPc: await getYtdlpVersionFromPc()
    }
  } else {
    return {
      ytdlpPathInPc: null,
      ytdlpVersionhInPc: null
    }
  }
}

export async function getFfmpegFromPc() {
  if (await appExistsInPc('ffmpeg')) {
    return {
      ffmpegPathInPc: (await getAppPath('ffmpeg')).path,
      ffmpegVersionInPc: await getFfmpegVersionFromPc()
    }
  } else {
    return {
      ffmpegPathInPc: null,
      ffmpegVersionhInPc: null
    }
  }
}
