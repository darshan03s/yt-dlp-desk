import { AppSettings, AppSettingsChange } from '@/shared/types';
import { Button } from '@renderer/components/ui/button';
import { Input } from '@renderer/components/ui/input';
import { Switch } from '@renderer/components/ui/switch';
import { TooltipWrapper } from '@renderer/components/wrappers';
import { useSettingsStore } from '@renderer/stores/settings-store';
import { IconFile, IconFolder, IconInfoCircle } from '@tabler/icons-react';
import { useState } from 'react';

const Settings = () => {
  const initial = useSettingsStore.getState();
  const [settings, setSettings] = useState<Partial<AppSettings>>({
    appVersion: initial.appVersion,
    ytdlpVersion: initial.ytdlpVersion,
    ffmpegVersion: initial.ffmpegVersion,
    downloadsFolder: initial.downloadsFolder,
    rememberPreviousDownloadsFolder: initial.rememberPreviousDownloadsFolder,
    cookiesFilePath: initial.cookiesFilePath
  });

  function handleSettingsChange(key: keyof AppSettingsChange, value: string | boolean) {
    if (key === 'rememberPreviousDownloadsFolder') {
      setSettings((prev) => ({
        ...prev,
        rememberPreviousDownloadsFolder: value as boolean
      }));
    }
  }

  function handleSaveSettings() {
    const changedSettings: AppSettingsChange = {
      downloadsFolder: settings.downloadsFolder!,
      rememberPreviousDownloadsFolder: settings.rememberPreviousDownloadsFolder!,
      cookiesFilePath: settings.cookiesFilePath!
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

  async function pickFile() {
    const path = await window.api.selectFile();
    if (path) {
      setSettings((prev) => ({
        ...prev,
        cookiesFilePath: path
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
            <TooltipWrapper message="Select folder">
              <Button variant={'outline'} size={'icon-sm'} onClick={pickFolder}>
                <IconFolder />
              </Button>
            </TooltipWrapper>
          </div>
        </div>
        <div className="flex items-center justify-between w-full px-18">
          <span className="setting-name text-[12px] text-nowrap">
            Remember previous downloads folder
          </span>
          <Switch
            checked={settings?.rememberPreviousDownloadsFolder}
            onCheckedChange={(value) =>
              handleSettingsChange('rememberPreviousDownloadsFolder', value)
            }
          />
        </div>
        <div className="px-18 flex flex-col gap-2">
          <h1 className="text-sm border-b pb-1 font-bold">Cookies</h1>
          <div className="flex items-center justify-between w-full">
            <span className="setting-name text-[12px] text-nowrap flex items-center gap-1">
              Cookies file path
              <TooltipWrapper message="Choose cookies.txt (Netscape format)">
                <IconInfoCircle className="size-3" />
              </TooltipWrapper>
            </span>
            <div className="h-8 w-[400px] flex items-center gap-2">
              <Input className="text-[10px]" value={settings?.cookiesFilePath} disabled />
              <TooltipWrapper message="Select file">
                <Button variant={'outline'} size={'icon-sm'} onClick={pickFile}>
                  <IconFile />
                </Button>
              </TooltipWrapper>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
