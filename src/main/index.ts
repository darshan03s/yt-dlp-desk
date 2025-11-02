import { app, shell, BrowserWindow } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { makeDirs, pathExistsSync } from './utils/fsUtils'
import { initStoreManager } from './store'
import { initDatabase, runMigrations } from './db'
import { defaultSettings } from './defaultSettings'
import log from 'electron-log'

log.transports.file.level = 'info'

const APP_USER_MODEL_ID = 'com.ytdlpui'
export const APP_PATH = app.getAppPath()
export const APP_DATA_PATH = is.dev ? path.join(APP_PATH, 'app-data') : app.getPath('userData')
app.setPath('userData', APP_DATA_PATH)
export const DATA_DIR = path.join(APP_DATA_PATH, 'data')
export const DB_PATH = path.join(DATA_DIR, 'app.db')
export const SETTINGS_PATH = path.join(DATA_DIR, 'settings.json')
export const MEDIA_DATA_FOLDER_PATH = path.join(DATA_DIR, 'media-data')
export const MIGRATIONS_FOLDER = is.dev
  ? path.join(APP_PATH, 'drizzle')
  : path.join(process.resourcesPath, 'app.asar.unpacked', 'drizzle')

log.info(`is.dev: ${is.dev}`)
log.info(`APP_DATA_PATH: ${APP_DATA_PATH}`)
log.info(`DATA_DIR: ${DATA_DIR}`)
log.info(`DB_PATH: ${DB_PATH}`)
log.info(`SETTINGS_PATH: ${SETTINGS_PATH}`)

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    minWidth: 500,
    width: 500,
    maxWidth: 700,
    height: 670,
    show: false,
    maximizable: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

async function init() {
  if (!pathExistsSync(DATA_DIR)) {
    makeDirs(DATA_DIR)
    log.info('Created DATA_DIR')
  } else {
    log.info('DATA_DIR exists')
  }

  if (!pathExistsSync(MEDIA_DATA_FOLDER_PATH)) {
    makeDirs(MEDIA_DATA_FOLDER_PATH)
    log.info('Created MEDIA_DATA_FOLDER')
  } else {
    log.info('MEDIA_DATA_FOLDER exists')
  }

  if (!pathExistsSync(SETTINGS_PATH)) {
    const store = await initStoreManager()
    store.set('settings', defaultSettings)
    log.info('Created settings.json')
  } else {
    log.info('settings.json exists')
  }

  if (!pathExistsSync(DB_PATH)) {
    initDatabase()
    log.info('Created app.db')
    try {
      runMigrations()
      log.info('Migrations applied')
    } catch (error) {
      log.error('Migrations failed: ' + error)
    }
  } else {
    log.info('app.db exists')
    initDatabase()
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  electronApp.setAppUserModelId(APP_USER_MODEL_ID)

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  await init()

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
