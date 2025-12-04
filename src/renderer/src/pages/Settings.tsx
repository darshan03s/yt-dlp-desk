import { Button } from '@renderer/components/ui/button';
import { Input } from '@renderer/components/ui/input';
import { useSettingsStore } from '@renderer/stores/settings-store';

const Settings = () => {
  const downloadsFolder = useSettingsStore((state) => state.downloadsFolder);
  const ytdlpVersion = useSettingsStore((state) => state.ytdlpVersion);
  const ffmpegVersion = useSettingsStore((state) => state.ffmpegVersion);

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="px-3 py-2 h-10 text-sm flex items-center justify-between sticky top-0 left-0 bg-background/60 backdrop-blur-md text-foreground z-49">
        <span className="text-xs">Settings</span>
        <Button className="text-[11px] h-7 bg-primary text-primary-foreground">
          Save Settings
        </Button>
      </div>

      <div className="space-y-4 [&_.setting-name]:font-semibold">
        <div className="flex items-center justify-between w-full px-18">
          <span className="setting-name text-[12px] text-nowrap">Downloads Folder</span>
          <Input className="h-8 w-[400px] text-[10px]" value={downloadsFolder} />
        </div>
        <div className="flex items-center justify-between w-full px-18">
          <span className="setting-name text-[12px] text-nowrap">yt-dlp Version</span>
          <Input disabled className="h-8 w-[400px] text-[10px]" value={ytdlpVersion} />
        </div>
        <div className="flex items-center justify-between w-full px-18">
          <span className="setting-name text-[12px] text-nowrap">ffmpeg Version</span>
          <Input disabled className="h-8 w-[400px] text-[10px]" value={ffmpegVersion} />
        </div>
      </div>
    </div>
  );
};

export default Settings;
