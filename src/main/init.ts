import { app } from 'electron';
import { DATA_DIR, DB_PATH, MEDIA_DATA_FOLDER_PATH, SETTINGS_PATH } from '.';
import { initDatabase, runMigrations } from './db';
import { getDefaultAppSettings } from './defaultSettings';
import { DownloadManager } from './downloadManager';
import { makeDirs, pathExistsSync } from './utils/fsUtils';
import logger from '@shared/logger';
import Settings from './settings';

async function applyUpdates() {
  runMigrations();
  logger.info('Applied updates');
}

export async function init() {
  const settings = await Settings.initSettings();
  DownloadManager.initDownloadManager();

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

  if (!pathExistsSync(SETTINGS_PATH)) {
    const defaults = getDefaultAppSettings();
    settings.setAll({ ...defaults });
    logger.info('Created settings.json');
  } else {
    logger.info('settings.json exists');
  }

  logger.info(
    `App version in settings: ${settings.get('appVersion')} | Current version: ${app.getVersion()}`
  );

  if (!pathExistsSync(DB_PATH)) {
    initDatabase();
    logger.info('Created app.db');
    try {
      runMigrations();
      logger.info('Migrations applied for new version');
    } catch (error) {
      logger.error('Migrations failed: ' + error);
    }
  } else {
    logger.info('app.db exists');
    initDatabase();
    if (app.getVersion() !== settings.get('appVersion')) {
      try {
        applyUpdates();
        settings.set('appVersion', app.getVersion());
      } catch (e) {
        logger.error('Could not apply updates');
        logger.error(e);
      }
    } else {
      logger.info('Skipping updates');
    }
  }
}
