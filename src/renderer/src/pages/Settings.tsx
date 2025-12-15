import { MAX_ALLOWED_CONCURRENT_DOWNLOADS } from '@shared/data';
import { AppSettings, AppSettingsChange } from '@shared/types';
import { Button } from '@renderer/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog';
import { Input } from '@renderer/components/ui/input';
import { Switch } from '@renderer/components/ui/switch';
import { TooltipWrapper } from '@renderer/components/wrappers';
import { useSettingsStore } from '@renderer/stores/settings-store';
import { IconFile, IconFolder, IconInfoCircle, IconTrash } from '@tabler/icons-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import equal from 'fast-deep-equal';

const Settings = () => {
  const currentSettings = useSettingsStore((state) => state.settings);
  const [settingsChange, setSettingsChange] = useState<Partial<AppSettings>>(currentSettings);
  const [isConfirmClearAllMetadataVisible, setIsConfirmClearAllMetadataVisible] = useState(false);

  useEffect(() => {
    setSettingsChange(currentSettings);
  }, [currentSettings]);

  function handleSettingsChange(key: keyof AppSettingsChange, value: string | boolean) {
    if (key === 'rememberPreviousDownloadsFolder') {
      setSettingsChange((prev) => ({
        ...prev,
        rememberPreviousDownloadsFolder: value as boolean
      }));
    }
  }

  function handleSaveSettings() {
    const changedSettings: AppSettingsChange = {
      downloadsFolder: settingsChange.downloadsFolder!,
      rememberPreviousDownloadsFolder: settingsChange.rememberPreviousDownloadsFolder!,
      cookiesFilePath: settingsChange.cookiesFilePath!,
      maxConcurrentDownloads: settingsChange.maxConcurrentDownloads!
    };

    const currentSettingsState = {
      downloadsFolder: currentSettings.downloadsFolder!,
      rememberPreviousDownloadsFolder: currentSettings.rememberPreviousDownloadsFolder!,
      cookiesFilePath: currentSettings.cookiesFilePath!,
      maxConcurrentDownloads: currentSettings.maxConcurrentDownloads!
    };

    if (equal(currentSettingsState, changedSettings)) return;

    window.api.saveSettings(changedSettings);
  }

  async function pickFolder() {
    const path = await window.api.selectFolder();
    if (path) {
      setSettingsChange((prev) => ({
        ...prev,
        downloadsFolder: path
      }));
    }
  }

  async function pickFile() {
    const path = await window.api.selectFile();
    if (path) {
      setSettingsChange((prev) => ({
        ...prev,
        cookiesFilePath: path
      }));
    }
  }

  function handleClearAllMetadata() {
    setIsConfirmClearAllMetadataVisible(true);
  }

  function handleMaxConcurrentDownloads(val: number) {
    if (val < 1 || val > MAX_ALLOWED_CONCURRENT_DOWNLOADS) return;
    setSettingsChange((prev) => ({
      ...prev,
      maxConcurrentDownloads: val
    }));
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
            {currentSettings?.appVersion}
          </span>
        </div>
        <div className="flex items-center justify-between w-full px-18">
          <span className="setting-name text-[12px] text-nowrap">yt-dlp Version</span>
          <span className="h-8 w-[400px] text-[12px] flex items-center">
            {currentSettings?.ytdlpVersion}
          </span>
        </div>
        <div className="flex items-center justify-between w-full px-18">
          <span className="setting-name text-[12px] text-nowrap">ffmpeg Version</span>
          <span className="h-8 w-[400px] text-[12px] flex items-center">
            {currentSettings?.ffmpegVersion}
          </span>
        </div>
        <div className="flex items-center justify-between w-full px-18">
          <span className="setting-name text-[12px] text-nowrap">Downloads Folder</span>
          <div className="h-8 w-[400px] flex items-center gap-2">
            <Input className="text-[10px]" value={settingsChange?.downloadsFolder} disabled />
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
            checked={settingsChange?.rememberPreviousDownloadsFolder}
            onCheckedChange={(value) =>
              handleSettingsChange('rememberPreviousDownloadsFolder', value)
            }
          />
        </div>
        <div className="flex items-center justify-between w-full px-18">
          <span className="setting-name text-[12px] text-nowrap">Max concurrent downloads</span>
          <Input
            className="w-15"
            type="number"
            step={1}
            min={1}
            max={MAX_ALLOWED_CONCURRENT_DOWNLOADS}
            value={settingsChange.maxConcurrentDownloads}
            onChange={(e) => handleMaxConcurrentDownloads(Number(e.target.value))}
          />
        </div>
        <div className="px-18 flex flex-col gap-2 pt-2">
          <h1 className="text-sm border-b pb-1 font-bold">Cookies</h1>
          <div className="flex items-center justify-between w-full">
            <span className="setting-name text-[12px] text-nowrap flex items-center gap-1">
              Cookies file path
              <TooltipWrapper message="Choose cookies.txt (Netscape format)">
                <IconInfoCircle className="size-3" />
              </TooltipWrapper>
            </span>
            <div className="h-8 w-[400px] flex items-center gap-2">
              <Input className="text-[10px]" value={settingsChange?.cookiesFilePath} disabled />
              <TooltipWrapper message="Select file">
                <Button variant={'outline'} size={'icon-sm'} onClick={pickFile}>
                  <IconFile />
                </Button>
              </TooltipWrapper>
            </div>
          </div>
        </div>
        <div className="px-18 flex flex-col gap-2 pt-2">
          <h1 className="text-sm border-b pb-1 font-bold">App Data</h1>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="setting-name text-[12px] text-nowrap flex items-center gap-1 text-destructive">
                Clear metadata for all media
              </span>
              <div className="h-8 flex items-center gap-2">
                <Button
                  variant={'destructive'}
                  className="text-xs"
                  size={'sm'}
                  onClick={handleClearAllMetadata}
                >
                  Clear
                  <IconTrash className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDeleteAllMetadataModal
        open={isConfirmClearAllMetadataVisible}
        setOpen={setIsConfirmClearAllMetadataVisible}
      />
    </div>
  );
};

export default Settings;

const ConfirmDeleteAllMetadataModal = ({
  open,
  setOpen
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  function handleConfirmDeleteAllMetadata() {
    window.api.deleteAllMetadata();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete all metadata?</DialogTitle>
          <DialogDescription>This action will delete all media metadata</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex ">
          <DialogClose asChild>
            <Button variant={'outline'}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleConfirmDeleteAllMetadata} variant={'destructive'}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
