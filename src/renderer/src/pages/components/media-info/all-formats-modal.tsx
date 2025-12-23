import { LiveFromStartFormats, MediaFormat, MediaInfoJson } from '@/shared/types/info-json';
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
import { SelectedFormat, useSelectedOptionsStore } from '@renderer/stores/selected-options-store';
import { acodec, formatFileSize, vcodec } from '@renderer/utils';
import { Dispatch, SetStateAction, useState } from 'react';

interface AllFormatsModalProps {
  formats: MediaInfoJson['formats'];
  liveFromStartFormats: LiveFromStartFormats[];
  defaultFormat: SelectedFormat;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const AllFormatsModal = ({
  formats,
  liveFromStartFormats,
  defaultFormat,
  open,
  setOpen
}: AllFormatsModalProps) => {
  const videoFormats = formats.filter((format) => format.vcodec !== 'none').reverse();
  const audioFormats = formats
    .filter((format) => format.acodec !== 'none' && format.vcodec === 'none')
    .reverse();
  const allFormats: (MediaFormat | SelectedFormat)[] = [...videoFormats, ...audioFormats];
  const isDefaultFormatPresent = allFormats.some((f) => f.format_id === defaultFormat.format_id);
  if (!isDefaultFormatPresent) {
    allFormats.unshift(defaultFormat);
  }
  const videoAndAudioFormats = formats
    .filter((format) => format.vcodec !== 'none' && format.acodec !== 'none')
    .reverse();
  const mp4Formats = formats.filter((format) => format.ext === 'mp4').reverse();
  const webmFormats = formats.filter((format) => format.ext === 'webm').reverse();
  const vp9Formats = formats.filter((format) => format.vcodec?.includes('vp9')).reverse();
  const av01Formats = formats.filter((format) => format.vcodec?.includes('av01')).reverse();
  const avc1Formats = formats.filter((format) => format.vcodec?.includes('avc1')).reverse();
  const opusFormats = formats.filter((format) => format.acodec?.includes('opus')).reverse();
  const mp4aFormats = formats.filter((format) => format.acodec?.includes('mp4a')).reverse();
  const reversedLiveFormats = [...liveFromStartFormats].reverse();

  const formatFiltersObj = {
    all: 'All',
    'video-and-video': 'Video & Audio',
    video: 'Video',
    audio: 'Audio Only',
    mp4: 'Video: mp4',
    webm: 'Video: webm',
    vp9: 'Video: vp9',
    av01: 'Video: av01',
    avc1: 'Video: avc1',
    opus: 'Audio: opus',
    mp4a: 'Audio: mp4a'
  };

  if (liveFromStartFormats.length > 0) {
    formatFiltersObj['liveFromStart'] = 'Live from start';
  }

  const formatFilters = Object.keys(formatFiltersObj);
  type FormatFilter = keyof typeof formatFiltersObj;

  const formatMap: Record<FormatFilter, typeof allFormats> = {
    all: allFormats,
    video: videoFormats,
    audio: audioFormats,
    'video-and-video': videoAndAudioFormats,
    mp4: mp4Formats,
    webm: webmFormats,
    vp9: vp9Formats,
    av01: av01Formats,
    avc1: avc1Formats,
    opus: opusFormats,
    mp4a: mp4aFormats
  };

  if (liveFromStartFormats.length > 0) {
    formatMap['liveFromStart'] = reversedLiveFormats;
  }

  const [selectedFilter, setSelectedFilter] = useState<FormatFilter>('all');

  const Format = ({ format }: { format: MediaFormat | SelectedFormat }) => {
    const setSelectedFormat = useSelectedOptionsStore((state) => state.setSelectedFormat);
    const selectedFormat = useSelectedOptionsStore((state) => state.selectedFormat);

    function handleFormatSelect() {
      setSelectedFormat({
        ext: format.ext ?? 'N/A',
        resolution: format.resolution ?? 'N/A',
        format: format.format ?? 'N/A',
        fps: format.fps ?? 0,
        vcodec: format.vcodec ?? 'N/A',
        acodec: format.acodec ?? 'N/A',
        filesize_approx: format.filesize_approx ?? 0,
        filesize: format.filesize ?? 0,
        format_id: format.format_id ?? 'N/A',
        format_note: format.format_note ?? 'N/A',
        height: format.height ?? 0,
        width: format.width ?? 0
      });
    }

    return (
      <div
        onClick={handleFormatSelect}
        className="selected-format p-1 relative rounded-md w-full bg-primary/10 flex items-center gap-2 cursor-pointer border border-primary/10"
      >
        <div className="selected-format-left p-1 flex items-center">
          <span className="bg-primary text-primary-foreground text-xs p-2 rounded-md">
            {format.ext ?? 'N/A'}
          </span>
        </div>
        <div className="selected-format-right flex flex-col">
          <span>{format.resolution ?? 'N/A'}</span>
          <span className="text-[10px]">{format.format ?? 'N/A'}</span>
          <div className="text-[10px] flex items-center gap-2">
            <span>fps: {format.fps || 'N/A'}</span>
            <span>vcodec: {vcodec(format.vcodec) || 'N/A'}</span>
            <span>acodec: {acodec(format.acodec) || 'N/A'}</span>
            {format.filesize ? (
              <span>Filesize={format.filesize ? formatFileSize(format.filesize!) : 'N/A'}</span>
            ) : (
              <span>
                Filesize≈{format.filesize_approx ? formatFileSize(format.filesize_approx!) : 'N/A'}
              </span>
            )}
          </div>
        </div>
        {selectedFormat.format_id === format.format_id ? (
          <span className="absolute right-0 top-0 text-[10px] bg-primary/30 px-2 py-0.5 rounded-tr-md rounded-bl-md">
            Selected Format
          </span>
        ) : null}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="font-satoshi">
        <DialogHeader>
          <DialogTitle className="font-satoshi">All formats</DialogTitle>
          <DialogDescription className="font-satoshi">
            All audio and video formats
          </DialogDescription>
          <p className="bg-yellow-300/20 text-[10px] rounded-md border p-1 px-2 text-foreground">
            The final output container will be based on video and audio codecs, it may not be the
            same as displayed here
          </p>
        </DialogHeader>
        <div className="format-filters flex flex-wrap items-center gap-2">
          {formatFilters.map((formatFilter, key) => (
            <Button
              key={key}
              onClick={() => setSelectedFilter(formatFilter as FormatFilter)}
              size={'sm'}
              variant={'secondary'}
              className={`text-xs border-none shadow-none outline-none ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=on]:outline-none data-[state=on]:ring-0 ${formatFilter === selectedFilter ? 'hover:bg-primary text-primary-foreground' : ''} ${formatFilter === selectedFilter ? 'bg-primary text-primary-foreground' : ''}`}
            >
              {formatFiltersObj[formatFilter]} ({formatMap[formatFilter].length})
            </Button>
          ))}
        </div>
        <div className="w-full font-satoshi flex flex-col gap-2 h-53 overflow-auto">
          {formatMap[selectedFilter]?.map((format) => (
            <Format key={format.format_id} format={format} />
          ))}
        </div>
        <DialogFooter>
          <DialogClose>
            <Button size={'sm'} className="text-xs font-satoshi">
              OK
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AllFormatsModal;
