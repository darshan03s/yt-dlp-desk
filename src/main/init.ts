import { DATA_DIR, DB_PATH, MEDIA_DATA_FOLDER_PATH, SETTINGS_PATH } from '.';
import { initDatabase, runMigrations } from './db';
import { getDefaultAppSettings } from './defaultSettings';
import { initStoreManager } from './store';
import { makeDirs, pathExistsSync } from './utils/fsUtils';
import logger from '../shared/logger';

export async function init() {
  if (!pathExistsSync(DATA_DIR)) {
    makeDirs(DATA_DIR);
    logger.info('Created DATA_DIR');
  } else {
    logger.info('DATA_DIR exists');
  }

  if (!pathExistsSync(MEDIA_DATA_FOLDER_PATH)) {
    makeDirs(MEDIA_DATA_FOLDER_PATH);
    logger.info('Created MEDIA_DATA_FOLDER');
  } else {
    logger.info('MEDIA_DATA_FOLDER exists');
  }

  const store = await initStoreManager();

  if (!pathExistsSync(SETTINGS_PATH)) {
    store.set('settings', getDefaultAppSettings());
    logger.info('Created settings.json');
  } else {
    logger.info('settings.json exists');
  }

  if (!pathExistsSync(DB_PATH)) {
    initDatabase();
    logger.info('Created app.db');
    try {
      runMigrations();
      logger.info('Migrations applied');
    } catch (error) {
      logger.error('Migrations failed: ' + error);
    }
  } else {
    logger.info('app.db exists');
    initDatabase();
  }
}
