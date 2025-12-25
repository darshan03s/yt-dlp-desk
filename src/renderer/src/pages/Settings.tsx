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
import {
  IconFile,
  IconFileDownload,
  IconFolder,
  IconInfoCircle,
  IconMinus,
  IconPlus,
  IconTrash
} from '@tabler/icons-react';
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react';
import equal from 'fast-deep-equal';
import { cn } from '@renderer/lib/utils';
import { ButtonGroup } from '@renderer/components/ui/button-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select';
import {
  ReleaseChannel,
  SUPPORTED_COOKIE_BROWSERS,
  SupportedCookieBrowser
} from 'yt-dlp-command-builder';
import { useYtdlpVersionsStore } from '@renderer/stores/yt-dlp-versions-store';

const SettingsHeader = () => {
  return (
    <div className="px-3 py-2 h-12 text-sm flex items-center justify-between sticky top-0 left-0 bg-background/60 backdrop-blur-md text-foreground z-49">
      <span className="text-xs font-main font-semibold">Settings</span>
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
      maxConcurrentDownloads: settingsChange.maxConcurrentDownloads!,
      cookiesBrowser: settingsChange.cookiesBrowser!,
      cookiesBrowserProfile: settingsChange.cookiesBrowserProfile!
    };

    const currentSettingsState: AppSettingsChange = {
      downloadsFolder: currentSettings.downloadsFolder!,
      rememberPreviousDownloadsFolder: currentSettings.rememberPreviousDownloadsFolder!,
      cookiesFilePath: currentSettings.cookiesFilePath!,
      maxConcurrentDownloads: currentSettings.maxConcurrentDownloads!,
      cookiesBrowser: currentSettings.cookiesBrowser!,
      cookiesBrowserProfile: currentSettings.cookiesBrowserProfile!
    };

    if (equal(currentSettingsState, changedSettings)) return;

    window.api.saveSettings(changedSettings);
  }

  return (
    <Button
      onClick={handleSaveSettings}
      size={'sm'}
      className="text-[10px] h-6 bg-primary text-primary-foreground font-main font-semibold"
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
      <div className="space-y-4">{children}</div>
    </div>
  );
};

const SettingsItem = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <div className={cn('flex items-center justify-between', className)}>{children}</div>;
};

const SettingName = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <span className={cn('setting-name text-[12px] text-nowrap font-semibold font-main', className)}>
      {children}
    </span>
  );
};

const SettingsStaticValue = ({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <span className={cn('h-8 w-[400px] text-[12px] flex items-center', className)}>{children}</span>
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
      <DialogContent className="font-main">
        <DialogHeader>
          <DialogTitle className="font-main">Delete all metadata?</DialogTitle>
          <DialogDescription className="font-main">
            This action will delete all media metadata
          </DialogDescription>
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

const YtdlpUpdateModal = ({
  open,
  setOpen
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const versions = useYtdlpVersionsStore((state) => state.versions);

  function handleUpdate(channel: ReleaseChannel, version: string) {
    window.api.updateYtdlp(channel, version);
  }

  const UpdateToStable = () => {
    const [selectedVersion, setSelectedVersion] = useState<string>(versions.stable[0]);
    return (
      <div className="flex items-center justify-between">
        <span>Stable</span>
        <div className="w-[300px] flex items-center gap-2">
          <Select value={selectedVersion} onValueChange={(val) => setSelectedVersion(val)}>
            <SelectTrigger size="sm" className="w-full text-[10px]">
              <SelectValue placeholder="Select a version" />
            </SelectTrigger>
            <SelectContent position="popper" className="text-sm max-h-60 overflow-y-auto">
              <SelectGroup>
                <SelectLabel>Versions</SelectLabel>
                {versions.stable.map((version) => (
                  <SelectItem key={version} value={version}>
                    {version}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            size={'sm'}
            className="text-xs"
            onClick={() => handleUpdate('stable', selectedVersion)}
          >
            Update
          </Button>
        </div>
      </div>
    );
  };

  const UpdateToMaster = () => {
    const [selectedVersion, setSelectedVersion] = useState<string>(versions.master[0]);
    return (
      <div className="flex items-center justify-between">
        <span>Master</span>
        <div className="w-[300px] flex items-center gap-2">
          <Select value={selectedVersion} onValueChange={(val) => setSelectedVersion(val)}>
            <SelectTrigger size="sm" className="w-full text-[10px]">
              <SelectValue placeholder="Select a version" />
            </SelectTrigger>
            <SelectContent className="text-sm">
              <SelectGroup>
                <SelectLabel>Versions</SelectLabel>
                {versions.master.map((version) => (
                  <SelectItem key={version} value={version} className="capitalize">
                    {version}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            size={'sm'}
            className="text-xs"
            onClick={() => handleUpdate('master', selectedVersion)}
          >
            Update
          </Button>
        </div>
      </div>
    );
  };

  const UpdateToNightly = () => {
    const [selectedVersion, setSelectedVersion] = useState<string>(versions.nightly[0]);
    return (
      <div className="flex items-center justify-between">
        <span>Nightly</span>
        <div className="w-[300px] flex items-center gap-2">
          <Select value={selectedVersion} onValueChange={(val) => setSelectedVersion(val)}>
            <SelectTrigger size="sm" className="w-full text-[10px]">
              <SelectValue placeholder="Select a version" />
            </SelectTrigger>
            <SelectContent className="text-sm">
              <SelectGroup>
                <SelectLabel>Versions</SelectLabel>
                {versions.nightly.map((version) => (
                  <SelectItem key={version} value={version} className="capitalize">
                    {version}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button
            size={'sm'}
            className="text-xs"
            onClick={() => handleUpdate('nightly', selectedVersion)}
          >
            Update
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="font-main">
        <DialogHeader>
          <DialogTitle className="font-main">Update yt-dlp</DialogTitle>
          <DialogDescription className="font-main"></DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <UpdateToStable />
          <UpdateToMaster />
          <UpdateToNightly />
        </div>
        <DialogFooter className="flex ">
          <DialogClose asChild>
            <Button variant={'outline'}>Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const SettingsBlocks = () => {
  const currentSettings = useSettingsStore((state) => state.settings);
  const settingsChange = useSettingsStore((state) => state.settingsChange);
  const [isConfirmClearAllMetadataVisible, setIsConfirmClearAllMetadataVisible] = useState(false);
  const [isYtdlpUpdateModalVisible, setIsYtdlpUpdateModalVisible] = useState(false);
  const [browserProfiles, setBrowserProfiles] = useState<string[]>([]);

  function updateBrowserProfiles(browser: SupportedCookieBrowser) {
    window.api.getBrowserProfiles(browser).then((data) => {
      setBrowserProfiles(data);
    });
  }

  useEffect(() => {
    if (currentSettings.cookiesBrowser.length === 0) return;
    updateBrowserProfiles(currentSettings.cookiesBrowser as SupportedCookieBrowser);
  }, []);

  useEffect(() => {
    if (settingsChange.cookiesBrowser!.length === 0) return;
    updateBrowserProfiles(settingsChange.cookiesBrowser as SupportedCookieBrowser);
  }, [settingsChange.cookiesBrowser]);

  function handleSettingsChange(key: keyof AppSettingsChange, value: string | boolean | number) {
    if (key === 'rememberPreviousDownloadsFolder') {
      useSettingsStore
        .getState()
        .setSettingsChange({ rememberPreviousDownloadsFolder: value as boolean });
    }

    if (key === 'downloadsFolder') {
      useSettingsStore.getState().setSettingsChange({ downloadsFolder: value as string });
    }

    if (key === 'cookiesFilePath') {
      useSettingsStore.getState().setSettingsChange({ cookiesFilePath: value as string });
    }

    if (key === 'maxConcurrentDownloads') {
      if (!Number.isInteger(value)) return;
      const v = value as number;
      if (v === -1 && settingsChange.maxConcurrentDownloads! === 1) return;
      if (v === 1 && settingsChange.maxConcurrentDownloads! === MAX_ALLOWED_CONCURRENT_DOWNLOADS)
        return;
      useSettingsStore.getState().setSettingsChange({
        maxConcurrentDownloads: settingsChange.maxConcurrentDownloads! + (value as number)
      });
    }

    if (key === 'cookiesBrowser') {
      const selectedBrowser = value as SupportedCookieBrowser;
      if (selectedBrowser !== settingsChange.cookiesBrowser) {
        useSettingsStore.getState().setSettingsChange({ cookiesBrowserProfile: '' });
        setBrowserProfiles([]);
      }
      if (selectedBrowser === currentSettings.cookiesBrowser) {
        useSettingsStore
          .getState()
          .setSettingsChange({ cookiesBrowserProfile: currentSettings.cookiesBrowserProfile });
      }
      useSettingsStore.getState().setSettingsChange({ cookiesBrowser: selectedBrowser });
    }

    if (key === 'cookiesBrowserProfile') {
      const profile = (value as string).trim();
      if (profile.length === 0) return;
      useSettingsStore.getState().setSettingsChange({ cookiesBrowserProfile: profile as string });
    }
  }

  async function pickFolder() {
    const path = await window.api.selectFolder();
    if (path) {
      handleSettingsChange('downloadsFolder', path);
    }
  }

  async function pickFile() {
    const path = await window.api.selectFile();
    if (path) {
      handleSettingsChange('cookiesFilePath', path);
    }
  }

  function handleClearAllMetadata() {
    setIsConfirmClearAllMetadataVisible(true);
  }

  function handleYtdlpUpdate() {
    setIsYtdlpUpdateModalVisible(true);
  }

  return (
    <div className="settings-blocks divide-y px-12 [&_div.settings-block]:p-2 [&_div.settings-block]:py-3.5 [&_div.settings-block]:first:pt-0 font-main">
      <SettingsBlock>
        <SettingsItem>
          <SettingName>App Version</SettingName>
          <SettingsStaticValue>{currentSettings?.appVersion}</SettingsStaticValue>
        </SettingsItem>
        <SettingsItem>
          <SettingName>yt-dlp Version</SettingName>
          <SettingsStaticValue>{currentSettings?.ytdlpVersion}</SettingsStaticValue>
        </SettingsItem>
        <SettingsItem>
          <SettingName>Downloads Folder</SettingName>
          <div className="h-8 w-[400px] flex items-center">
            <ButtonGroup className="w-full">
              <Input
                className="text-[10px] h-8"
                value={settingsChange?.downloadsFolder}
                onChange={() => {}}
                placeholder="Select downloads folder"
              />
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
          <SettingName>Remember previous downloads folder</SettingName>
          <Switch
            checked={settingsChange?.rememberPreviousDownloadsFolder}
            onCheckedChange={(value) =>
              handleSettingsChange('rememberPreviousDownloadsFolder', value)
            }
          />
        </SettingsItem>
        <SettingsItem>
          <SettingName>Max concurrent downloads</SettingName>
          <ButtonGroup>
            <Input value={settingsChange.maxConcurrentDownloads} className="h-7 w-12 text-xs" />
            <Button
              variant={'outline'}
              className="h-7 w-3"
              onClick={() => handleSettingsChange('maxConcurrentDownloads', 1)}
            >
              <IconPlus className="size-3" />
            </Button>
            <Button
              variant={'outline'}
              className="h-7 w-3"
              onClick={() => handleSettingsChange('maxConcurrentDownloads', -1)}
            >
              <IconMinus className="size-3" />
            </Button>
          </ButtonGroup>
        </SettingsItem>
      </SettingsBlock>

      <SettingsBlock name="Cookies">
        <SettingsItem>
          <SettingName className="flex items-center gap-1">
            Cookies file path
            <TooltipWrapper message="Choose cookies.txt (Netscape format)">
              <IconInfoCircle className="size-3" />
            </TooltipWrapper>
          </SettingName>
          <div className="h-8 w-[400px] flex items-center gap-2">
            <ButtonGroup className="w-full">
              <Input
                className="text-[10px] h-8"
                value={settingsChange?.cookiesFilePath}
                placeholder="cookies.txt"
                onChange={() => {}}
              />
              <TooltipWrapper message="Select file">
                <Button variant={'outline'} size={'icon-sm'} onClick={pickFile} className="size-8">
                  <IconFile className="size-4" />
                </Button>
              </TooltipWrapper>
            </ButtonGroup>
          </div>
        </SettingsItem>
        <SettingsItem>
          <SettingName className="flex items-center gap-1">
            Cookies from browser
            <TooltipWrapper
              className="w-[200px]"
              side="top"
              message="Choose browser to read cookies. Only choose the one already present in your PC"
            >
              <IconInfoCircle className="size-3" />
            </TooltipWrapper>
          </SettingName>
          <div className="h-8 w-[400px] flex items-center gap-2">
            <Select
              value={settingsChange.cookiesBrowser}
              onValueChange={(val) => handleSettingsChange('cookiesBrowser', val)}
            >
              <SelectTrigger className="w-full text-[10px] h-8 capitalize">
                <SelectValue placeholder="Select a browser (e.g Firefox)" />
              </SelectTrigger>
              <SelectContent position="popper" className="text-sm h-[200px]">
                <SelectGroup>
                  <SelectLabel>Browsers</SelectLabel>
                  {SUPPORTED_COOKIE_BROWSERS.map((browser) => (
                    <SelectItem value={browser} key={browser} className="capitalize text-xs">
                      {browser}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </SettingsItem>
        <SettingsItem>
          <SettingName className="flex items-center gap-1">
            Cookies browser profile
            <TooltipWrapper
              className="w-full"
              side="top"
              message="Enter browser profile to read cookies (optional)"
            >
              <IconInfoCircle className="size-3" />
            </TooltipWrapper>
          </SettingName>
          {browserProfiles.length > 0 ? (
            <div className="h-8 w-[400px] flex items-center">
              <Select
                value={settingsChange.cookiesBrowserProfile}
                onValueChange={(val) => handleSettingsChange('cookiesBrowserProfile', val)}
              >
                <SelectTrigger className="w-full text-[10px] h-8">
                  <SelectValue placeholder="Select browser profile" />
                </SelectTrigger>
                <SelectContent className="text-sm">
                  <SelectGroup>
                    <SelectLabel>Browser Profiles</SelectLabel>
                    {browserProfiles.map((profile) => (
                      <SelectItem value={profile} key={profile} className="text-xs">
                        {profile}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="h-8 w-[400px] flex items-center gap-2">
              <Input
                placeholder="Enter profile name"
                className="text-[10px] h-8"
                value={settingsChange?.cookiesBrowserProfile}
                onChange={(e) => handleSettingsChange('cookiesBrowserProfile', e.target.value)}
              />
            </div>
          )}
        </SettingsItem>
      </SettingsBlock>

      <SettingsBlock name="yt-dlp">
        <SettingsItem>
          <SettingName>Update yt-dlp</SettingName>
          <div className="h-8 flex items-center gap-2">
            <Button variant={'default'} className="text-xs" size={'sm'} onClick={handleYtdlpUpdate}>
              See options
              <IconFileDownload className="size-4" />
            </Button>
          </div>
          <YtdlpUpdateModal
            open={isYtdlpUpdateModalVisible}
            setOpen={setIsYtdlpUpdateModalVisible}
          />
        </SettingsItem>
      </SettingsBlock>

      <SettingsBlock name="App data">
        <SettingsItem>
          <SettingName className="flex items-center gap-1 text-destructive">
            Clear metadata for all media
          </SettingName>
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
