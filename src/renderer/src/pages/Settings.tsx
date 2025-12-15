import { MAX_ALLOWED_CONCURRENT_DOWNLOADS } from '@shared/data';
import { AppSettingsChange } from '@shared/types';
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
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react';
import equal from 'fast-deep-equal';
import { cn } from '@renderer/lib/utils';
import { ButtonGroup } from '@renderer/components/ui/button-group';

const SettingsHeader = () => {
  return (
    <div className="px-3 py-2 h-12 text-sm flex items-center justify-between sticky top-0 left-0 bg-background/60 backdrop-blur-md text-foreground z-49">
      <span className="text-xs">Settings</span>
      <SaveSettingsButton />
    </div>
  );
};

const SaveSettingsButton = () => {
  const currentSettings = useSettingsStore((state) => state.settings);
  const settingsChange = useSettingsStore((state) => state.settingsChange);
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

  return (
    <Button
      onClick={handleSaveSettings}
      className="text-[11px] h-7 bg-primary text-primary-foreground"
    >
      Save Settings
    </Button>
  );
};

const SettingsBlock = ({
  children,
  className,
  name
}: {
  children: ReactNode;
  className?: string;
  name?: string;
}) => {
  return (
    <div className={cn('settings-block w-full flex flex-col gap-1 m-0', className)}>
      {name && <h1 className="text-sm font-bold">{name}</h1>}
      <div className="space-y-5">{children}</div>
    </div>
  );
};

const SettingsItem = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <div
      className={cn('flex items-center justify-between [&_.setting-name]:font-semibold', className)}
    >
      {children}
    </div>
  );
};

const SettingsBlocks = () => {
  const currentSettings = useSettingsStore((state) => state.settings);
  const settingsChange = useSettingsStore((state) => state.settingsChange);
  const [isConfirmClearAllMetadataVisible, setIsConfirmClearAllMetadataVisible] = useState(false);

  function handleSettingsChange(key: keyof AppSettingsChange, value: string | boolean) {
    if (key === 'rememberPreviousDownloadsFolder') {
      useSettingsStore
        .getState()
        .setSettingsChange({ rememberPreviousDownloadsFolder: value as boolean });
    }
  }

  async function pickFolder() {
    const path = await window.api.selectFolder();
    if (path) {
      useSettingsStore.getState().setSettingsChange({ downloadsFolder: path });
    }
  }

  async function pickFile() {
    const path = await window.api.selectFile();
    if (path) {
      useSettingsStore.getState().setSettingsChange({ cookiesFilePath: path });
    }
  }

  function handleClearAllMetadata() {
    setIsConfirmClearAllMetadataVisible(true);
  }

  function handleMaxConcurrentDownloads(val: number) {
    if (val < 1 || val > MAX_ALLOWED_CONCURRENT_DOWNLOADS) return;
    useSettingsStore.getState().setSettingsChange({ maxConcurrentDownloads: val });
  }

  return (
    <div className="settings-blocks divide-y px-12 [&_div.settings-block]:p-2 [&_div.settings-block]:py-3.5 [&_div.settings-block]:first:pt-0 [&_div.settings-block]:last:pb-0">
      <SettingsBlock>
        <SettingsItem>
          <span className="setting-name text-[12px] text-nowrap">App Version</span>
          <span className="h-8 w-[400px] text-[12px] flex items-center">
            {currentSettings?.appVersion}
          </span>
        </SettingsItem>
        <SettingsItem>
          <span className="setting-name text-[12px] text-nowrap">yt-dlp Version</span>
          <span className="h-8 w-[400px] text-[12px] flex items-center">
            {currentSettings?.ytdlpVersion}
          </span>
        </SettingsItem>
        <SettingsItem>
          <span className="setting-name text-[12px] text-nowrap">Downloads Folder</span>
          <div className="h-8 w-[400px] flex items-center gap-2">
            <ButtonGroup className="w-full">
              <Input className="text-[10px] h-8" value={settingsChange?.downloadsFolder} disabled />
              <TooltipWrapper message="Select folder">
                <Button
                  variant={'outline'}
                  size={'icon-sm'}
                  className="size-8"
                  onClick={pickFolder}
                >
                  <IconFolder className="size-4" />
                </Button>
              </TooltipWrapper>
            </ButtonGroup>
          </div>
        </SettingsItem>
        <SettingsItem>
          <span className="setting-name text-[12px] text-nowrap">
            Remember previous downloads folder
          </span>
          <Switch
            checked={settingsChange?.rememberPreviousDownloadsFolder}
            onCheckedChange={(value) =>
              handleSettingsChange('rememberPreviousDownloadsFolder', value)
            }
          />
        </SettingsItem>
        <SettingsItem>
          <span className="setting-name text-[12px] text-nowrap">Max concurrent downloads</span>
          <Input
            className="w-14 h-8 text-xs"
            type="number"
            step={1}
            min={1}
            max={MAX_ALLOWED_CONCURRENT_DOWNLOADS}
            value={settingsChange.maxConcurrentDownloads}
            onChange={(e) => handleMaxConcurrentDownloads(Number(e.target.value))}
          />
        </SettingsItem>
      </SettingsBlock>

      <SettingsBlock name="Cookies">
        <SettingsItem>
          <span className="setting-name text-[12px] text-nowrap flex items-center gap-1">
            Cookies file path
            <TooltipWrapper message="Choose cookies.txt (Netscape format)">
              <IconInfoCircle className="size-3" />
            </TooltipWrapper>
          </span>
          <div className="h-8 w-[400px] flex items-center gap-2">
            <ButtonGroup className="w-full">
              <Input className="text-[10px] h-8" value={settingsChange?.cookiesFilePath} disabled />
              <TooltipWrapper message="Select file">
                <Button variant={'outline'} size={'icon-sm'} onClick={pickFile} className="size-8">
                  <IconFile className="size-4" />
                </Button>
              </TooltipWrapper>
            </ButtonGroup>
          </div>
        </SettingsItem>
      </SettingsBlock>

      <SettingsBlock name="App data">
        <SettingsItem>
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
              Clear Metadata
              <IconTrash className="size-4" />
            </Button>
          </div>
          <ConfirmDeleteAllMetadataModal
            open={isConfirmClearAllMetadataVisible}
            setOpen={setIsConfirmClearAllMetadataVisible}
          />
        </SettingsItem>
      </SettingsBlock>
    </div>
  );
};

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

const Settings = () => {
  const currentSettings = useSettingsStore((state) => state.settings);

  useEffect(() => {
    useSettingsStore.getState().setSettingsChange(currentSettings);
  }, [currentSettings]);

  return (
    <div className="w-full flex flex-col gap-1">
      <SettingsHeader />
      <SettingsBlocks />
    </div>
  );
};

export default Settings;
