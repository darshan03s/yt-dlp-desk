import { create } from 'zustand';
import { type AppSettings } from '@shared/types';
import { DEFAULT_MAX_CONCURRENT_DOWNLOADS } from '@shared/data';

interface SettingsStore {
  settings: AppSettings;
  settingsChange: Partial<AppSettings>;
  setSettings: (settings: Partial<AppSettings>) => void;
  setSettingsChange: (settings: Partial<AppSettings>) => void;
}

const initialSettingsState: AppSettings = {
  appVersion: '',
  downloadsFolder: '',
  ffmpegPath: '',
  ffmpegVersion: '',
  mediaDataFolder: '',
  platform: 'win32',
  userDownloadsFolder: '',
  ytdlpPath: '',
  ytdlpVersion: '',
  jsRuntimePath: '',
  downloadTemplate: '',
  rememberPreviousDownloadsFolder: false,
  cookiesFilePath: '',
  maxConcurrentDownloads: DEFAULT_MAX_CONCURRENT_DOWNLOADS,
  cookiesBrowser: '',
  cookiesBrowserProfile: ''
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: initialSettingsState,
  settingsChange: initialSettingsState,
  setSettings: (settings) =>
    set((state) => ({
      settings: {
        ...state.settings,
        ...settings
      }
    })),
  setSettingsChange: (settings) =>
    set((state) => ({
      settingsChange: {
        ...state.settingsChange,
        ...settings
      }
    }))
}));
