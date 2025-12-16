import { app, shell, BrowserWindow } from 'electron';
import path, { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import log from 'electron-log';
import logger from '@shared/logger';
import { init } from './init';
import registerHanlders from './ipc/registerHandlers';
import registerProtocolHandlers from './protocolHanlders';
import runServer from './server';
import { initAutoUpdater } from './updater';

const logsFolderName = new Date().toISOString().split('T')[0];

log.transports.file.resolvePathFn = () => {
  return path.join(app.getPath('userData'), 'logs', logsFolderName, 'main.log');
};
log.transports.file.level = 'info';

const APP_USER_MODEL_ID = 'com.vidarchive.app';
export const APP_PATH = app.getAppPath();
export const APP_DATA_PATH = is.dev ? path.join(APP_PATH, 'app-data') : app.getPath('userData');
app.setPath('userData', APP_DATA_PATH);
export const DATA_DIR = path.join(APP_DATA_PATH, 'User');
export const DB_PATH = path.join(DATA_DIR, 'app.db');
export const SETTINGS_PATH = path.join(DATA_DIR, 'settings.json');
export const MEDIA_DATA_FOLDER_PATH = path.join(DATA_DIR, 'media-data');
export const MIGRATIONS_FOLDER = is.dev
  ? path.join(APP_PATH, 'drizzle')
  : path.join(process.resourcesPath, 'app.asar.unpacked', 'drizzle');
export const YTDLP_FOLDER_PATH = path.join(DATA_DIR, 'yt-dlp');
export const YTDLP_EXE_PATH = path.join(DATA_DIR, 'yt-dlp', 'yt-dlp.exe');
export const FFMPEG_FOLDER_PATH = path.join(DATA_DIR, 'ffmpeg');
const SPLASH_HTML_PATH = is.dev
  ? path.join(APP_PATH, 'resources', 'splash.html')
  : path.join(process.resourcesPath, 'app.asar.unpacked', 'resources', 'splash.html');

logger.info(`${app.name}, version ${app.getVersion()}`);
logger.info(`is.dev: ${is.dev}`);
logger.info(`APP_DATA_PATH: ${APP_DATA_PATH}`);
logger.info(`DATA_DIR: ${DATA_DIR}`);
logger.info(`DB_PATH: ${DB_PATH}`);
logger.info(`SETTINGS_PATH: ${SETTINGS_PATH}`);
logger.info(
  `ELECTRON_RENDERER_URL: ${is.dev ? process.env['ELECTRON_RENDERER_URL'] : join(__dirname, '../renderer/index.html')}`
);

export let mainWindow: BrowserWindow;
let splashWindow: BrowserWindow;

export function createSplash() {
  splashWindow = new BrowserWindow({
    width: 750,
    height: 670,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    show: true,
    icon
  });
  splashWindow.loadFile(SPLASH_HTML_PATH);
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    minWidth: 750,
    width: 750,
    maxWidth: 750,
    height: 670,
    minHeight: 670,
    show: false,
    maximizable: true,
    autoHideMenuBar: true,
    frame: false,
    ...(process.platform === 'linux' ? { icon } : { icon }),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
    if (splashWindow) {
      splashWindow.close();
    }
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

const gotLock = app.requestSingleInstanceLock();
const isPrimaryInstance = gotLock;

if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  if (!isPrimaryInstance) {
    return;
  }

  electronApp.setAppUserModelId(APP_USER_MODEL_ID);

  createSplash();

  initAutoUpdater();

  await registerProtocolHandlers();

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  await init();

  await registerHanlders();

  runServer();

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
