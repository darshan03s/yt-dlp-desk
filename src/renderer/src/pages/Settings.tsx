import { AppSettings, AppSettingsChange } from '@/shared/types';
import { Button } from '@renderer/components/ui/button';
import { Input } from '@renderer/components/ui/input';
import { Switch } from '@renderer/components/ui/switch';
import { useSettingsStore } from '@renderer/stores/settings-store';
import { IconFolder } from '@tabler/icons-react';
import { useState } from 'react';

const Settings = () => {
  const initial = useSettingsStore.getState();
  const [settings, setSettings] = useState<Partial<AppSettings>>({
    appVersion: initial.appVersion,
    ytdlpVersion: initial.ytdlpVersion,
    ffmpegVersion: initial.ffmpegVersion,
    downloadsFolder: initial.downloadsFolder,
    alwaysUsePreviousDownloadsFolder: initial.alwaysUsePreviousDownloadsFolder
  });

  function handleSettingsChange(key: keyof AppSettingsChange, value: string | boolean) {
    if (key === 'alwaysUsePreviousDownloadsFolder') {
      setSettings((prev) => ({
        ...prev,
        alwaysUsePreviousDownloadsFolder: value as boolean
      }));
    }
  }

  function handleSaveSettings() {
    const changedSettings: AppSettingsChange = {
      downloadsFolder: settings.downloadsFolder!,
      alwaysUsePreviousDownloadsFolder: settings.alwaysUsePreviousDownloadsFolder!
    };

    window.api.saveSettings(changedSettings);
  }

  async function pickFolder() {
    const path = await window.api.selectFolder();
    if (path) {
      setSettings((prev) => ({
        ...prev,
        downloadsFolder: path
      }));
    }
  }

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="px-3 py-2 h-12 text-sm flex items-center justify-between sticky top-0 left-0 bg-background/60 backdrop-blur-md text-foreground z-49">
        <span className="text-xs">Settings</span>
        <Button
          onClick={handleSaveSettings}
          className="text-[11px] h-7 bg-primary text-primary-foreground"
        >
          Save Settings
        </Button>
      </div>

      <div className="py-3 space-y-6 [&_.setting-name]:font-semibold">
        <div className="flex items-center justify-between w-full px-18">
          <span className="setting-name text-[12px] text-nowrap">App Version</span>
          <span className="h-8 w-[400px] text-[12px] flex items-center">
            {settings?.appVersion}
          </span>
        </div>
        <div className="flex items-center justify-between w-full px-18">
          <span className="setting-name text-[12px] text-nowrap">yt-dlp Version</span>
          <span className="h-8 w-[400px] text-[12px] flex items-center">
            {settings?.ytdlpVersion}
          </span>
        </div>
        <div className="flex items-center justify-between w-full px-18">
          <span className="setting-name text-[12px] text-nowrap">ffmpeg Version</span>
          <span className="h-8 w-[400px] text-[12px] flex items-center">
            {settings?.ffmpegVersion}
          </span>
        </div>
        <div className="flex items-center justify-between w-full px-18">
          <span className="setting-name text-[12px] text-nowrap">Downloads Folder</span>
          <div className="h-8 w-[400px] flex items-center gap-2">
            <Input className="text-[10px]" value={settings?.downloadsFolder} disabled />
            <Button variant={'outline'} size={'icon-sm'} onClick={pickFolder}>
              <IconFolder />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between w-full px-18">
          <span className="setting-name text-[12px] text-nowrap">
            Always use previous downloads folder
          </span>
          <Switch
            checked={settings?.alwaysUsePreviousDownloadsFolder}
            onCheckedChange={(value) =>
              handleSettingsChange('alwaysUsePreviousDownloadsFolder', value)
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;
