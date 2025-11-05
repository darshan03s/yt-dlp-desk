import { DATA_DIR, DB_PATH, MEDIA_DATA_FOLDER_PATH, SETTINGS_PATH } from '.'
import { initDatabase, runMigrations } from './db'
import { getDefaultAppSettings } from './defaultSettings'
import { initStoreManager } from './store'
import { makeDirs, pathExistsSync } from './utils/fsUtils'
import log from 'electron-log'

export async function init() {
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

  const store = await initStoreManager()

  if (!pathExistsSync(SETTINGS_PATH)) {
    store.set('settings', getDefaultAppSettings())
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
