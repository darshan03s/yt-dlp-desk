import { Source } from '@shared/types';
import { DownloadOptions } from '@/shared/types/download';
import { MediaInfoJson } from '@/shared/types/info-json';
import { Button } from '@renderer/components/ui/button';
import { useMediaInfoStore } from '@renderer/stores/media-info-store';
import { useSelectedOptionsStore } from '@renderer/stores/selected-options-store';
import { IconArrowDown } from '@tabler/icons-react';
import { toast } from 'sonner';

const DownloadButton = ({ loading }: { loading: boolean }) => {
  const selectedFormat = useSelectedOptionsStore((state) => state.selectedFormat);
  const downloadSections = useSelectedOptionsStore((state) => state.downloadSections);
  const selectedDownloadFolder = useSelectedOptionsStore((state) => state.selectedDownloadFolder);
  const extraOptions = useSelectedOptionsStore((state) => state.extraOptions);
  const url = useMediaInfoStore.getState().url;
  const source = useMediaInfoStore.getState().source as Source;
  const mediaInfo = useMediaInfoStore((state) => state.mediaInfo) as MediaInfoJson;

  function validTime(time: string) {
    const pattern = /^\d\d(?::\d\d?){0,2}$/;
    return pattern.test(time);
  }

  function handleDownload() {
    const { startTime, endTime } = downloadSections;

    if (startTime.length > 0 && !validTime(startTime)) {
      toast.error('Start time must be in HH:MM:SS format');
      return;
    }

    if (endTime.length > 0 && !validTime(endTime)) {
      toast.error('End time must be in HH:MM:SS format');
      return;
    }

    if (extraOptions.liveFromStart) {
      const formatId = selectedFormat.format_id;
      if (mediaInfo.live_from_start_formats) {
        const isFormatInLiveFromStartFormats = mediaInfo.live_from_start_formats.some(
          (f) => f.format_id === formatId
        );
        if (!isFormatInLiveFromStartFormats) {
          toast.error('Format does not support live from start');
          return;
        }
      }
    }

    const downloadOptions: DownloadOptions = {
      downloadId: crypto.randomUUID(),
      selectedFormat,
      url,
      source,
      mediaInfo,
      downloadSections,
      selectedDownloadFolder,
      extraOptions
    };

    window.api.download(downloadOptions);

    const unsubDownloadBegin = window.api.on('download-begin', () => {
      toast.info('Download Started');
      unsubDownloadBegin();
    });
    const unsubDownloadQueue = window.api.on('download-queued', () => {
      toast.info('Download Queued');
      unsubDownloadQueue();
    });
  }

  return (
    <Button
      disabled={loading}
      onClick={handleDownload}
      className="text-xs h-6 px-1 flex items-center gap-1 rounded-full"
    >
      <IconArrowDown className="size-4" />
      Download
    </Button>
  );
};

export default DownloadButton;
