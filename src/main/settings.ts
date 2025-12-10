import ElectronStore from 'electron-store';
import { DATA_DIR } from '.';
import { AppSettings, AppSettingsChange } from '@shared/types';

class Settings {
  private static instance: Settings | null = null;
  private store: ElectronStore<AppSettings> | null;

  private constructor(store: ElectronStore<AppSettings>) {
    this.store = store;
  }

  static async initSettings() {
    if (Settings.instance) return Settings.instance;

    const electronStoreModule = await import('electron-store');
    const StoreConstructor = electronStoreModule.default;

    const store = new StoreConstructor<AppSettings>({
      name: 'settings',
      cwd: DATA_DIR
    });

    Settings.instance = new Settings(store);
    return Settings.instance;
  }

  static getInstance() {
    if (!Settings.instance) {
      throw new Error('Initialize the Settings first using initSettings()');
    }
    return Settings.instance;
  }

  get<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.store!.get(key);
  }

  getAll(): AppSettings {
    return this.store!.store as AppSettings;
  }

  set<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    this.store!.set(key, value);
  }

  setAll(values: AppSettings) {
    this.store!.set(values);
  }

  update(values: AppSettingsChange) {
    this.store!.set(values);
  }
}

export default Settings;
