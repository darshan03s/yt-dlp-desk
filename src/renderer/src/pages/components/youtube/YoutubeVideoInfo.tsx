import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { YoutubeFormat, YoutubeVideoInfoJson } from '@/shared/types/info-json/youtube-video';
import { toast } from 'sonner';
import { Spinner } from '@renderer/components/ui/spinner';
import { useMediaInfoStore } from '@renderer/stores/media-info-store';
import { useSearchParams } from 'react-router-dom';
import { updateUrlHistoryInStore } from '../UrlHistory';
import { IconArrowDown, IconCircleCheckFilled, IconClockHour3Filled } from '@tabler/icons-react';
import { formatDate, formatFileSize } from '@renderer/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog';
import { Anchor } from '@renderer/components/wrappers';
import { Button } from '@renderer/components/ui/button';
import { SelectedFormat, useSelectedOptionsStore } from '@renderer/stores/selected-options-store';

const Preview = ({ previewUrl, isLoading }: { previewUrl: string; isLoading: boolean }) => {
  return (
    <div className="w-full h-60 bg-black flex items-center justify-center">
      {isLoading ? (
        <Spinner className="text-white" />
      ) : (
        <img src={previewUrl} alt="Preview" width={420} className="aspect-video" />
      )}
    </div>
  );
};

const Details = ({ infoJson }: { infoJson: YoutubeVideoInfoJson }) => {
  const [isMoreDetailsModalOpen, setIsMoreDetailsModalOpen] = useState(false);

  const LiveStatus = () => {
    if (infoJson.was_live) {
      return (
        <span className="text-[10px]">
          <span className="text-red-500">Was Live</span>
          {' || '}
        </span>
      );
    } else if (infoJson.is_live) {
      return (
        <span className="text-[10px]">
          <span className="text-red-500">Live Now</span>
          {' || '}
        </span>
      );
    } else return null;
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <div
          onClick={() => setIsMoreDetailsModalOpen(true)}
          className="text-xs border bg-secondary text-secondary-foreground p-2 rounded-md cursor-pointer flex flex-col gap-1"
        >
          <div className="">
            <p className="text-xs leading-5">
              <LiveStatus />
              {infoJson.fulltitle}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xs inline-flex items-center gap-1">
              {infoJson.channel_is_verified ? <IconCircleCheckFilled className="size-3" /> : null}
              {infoJson.uploader}
            </span>
            {' | '}
            <span className="text-xs inline-flex items-center gap-1">
              <IconClockHour3Filled className="size-3" />
              {formatDate(infoJson.upload_date)}
            </span>
          </div>

          <div>
            <Button className="text-xs h-6 px-1 flex items-center gap-1">
              <IconArrowDown className="size-4" /> Download
            </Button>
          </div>
        </div>

        <div className="formats-display">
          <Formats infoJson={infoJson} />
        </div>
      </div>

      <MoreDetailsModal
        open={isMoreDetailsModalOpen}
        setOpen={setIsMoreDetailsModalOpen}
        infoJson={infoJson}
      />
    </>
  );
};

const Formats = ({ infoJson }: { infoJson: YoutubeVideoInfoJson }) => {
  const [isAllFormatsModalOpen, setIsAllFormatsModalOpen] = useState(false);
  const setSelectedFormat = useSelectedOptionsStore((state) => state.setSelectedFormat);
  const selectedFormat = useSelectedOptionsStore((state) => state.selectedFormat);
  const defaultFormat: SelectedFormat = {
    vcodec: infoJson.vcodec,
    acodec: infoJson.acodec,
    ext: infoJson.ext,
    filesize_approx: infoJson.filesize_approx,
    fps: infoJson.fps,
    format: infoJson.format,
    format_id: infoJson.format_id,
    format_note: infoJson.format_note,
    height: infoJson.height,
    width: infoJson.width,
    resolution: infoJson.resolution
  };
  useEffect(() => {
    setSelectedFormat(defaultFormat);
  }, []);

  return (
    <>
      <div
        onClick={() => setIsAllFormatsModalOpen(true)}
        className="selected-format relative border p-1 rounded-md w-full bg-secondary flex items-center gap-2 cursor-pointer"
      >
        <div className="selected-format-left p-1 flex items-center">
          <span className="bg-primary text-primary-foreground text-xs p-2 rounded-md">
            {selectedFormat.ext || defaultFormat.ext}
          </span>
        </div>
        <div className="selected-format-right flex flex-col">
          <span>{selectedFormat.resolution || defaultFormat.resolution}</span>
          <span className="text-[10px]">{selectedFormat.format || defaultFormat.format}</span>
          <div className="text-[10px] flex items-center gap-2">
            <span>fps: {selectedFormat.fps || defaultFormat.fps}</span>
            <span>vcodec: {selectedFormat.vcodec || defaultFormat.vcodec}</span>
            <span>acodec: {selectedFormat.acodec || defaultFormat.acodec}</span>
            <span>
              Filesize≈{' '}
              {formatFileSize(selectedFormat.filesize_approx! || defaultFormat.filesize_approx!)}
            </span>
          </div>
        </div>
        <span className="absolute right-0 top-0 text-[10px] bg-primary/30 px-2 py-0.5 rounded-tr-md rounded-bl-md">
          Selected Format
        </span>
      </div>
      <AllFormatsModal
        open={isAllFormatsModalOpen}
        setOpen={setIsAllFormatsModalOpen}
        formats={infoJson.formats}
        defaultFormat={defaultFormat}
      />
    </>
  );
};

interface AllFormatsModalProps {
  formats: YoutubeVideoInfoJson['formats'];
  defaultFormat: SelectedFormat;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const AllFormatsModal = ({ formats, defaultFormat, open, setOpen }: AllFormatsModalProps) => {
  const videoFormats = formats.filter((format) => format.vcodec !== 'none').reverse();
  const audioFormats = formats
    .filter((format) => format.acodec !== 'none' && format.vcodec === 'none')
    .reverse();
  const allFormats: (YoutubeFormat | SelectedFormat)[] = [...videoFormats, ...audioFormats];
  allFormats.unshift(defaultFormat);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'video' | 'audio'>('all');

  const Format = ({ format }: { format: YoutubeFormat | SelectedFormat }) => {
    const setSelectedOptions = useSelectedOptionsStore((state) => state.setSelectedFormat);
    const selectedFormat = useSelectedOptionsStore((state) => state.selectedFormat);
    function handleFormatSelect() {
      setSelectedOptions({
        vcodec: format.vcodec,
        acodec: format.acodec,
        ext: format.ext,
        filesize_approx: format.filesize_approx,
        fps: format.fps,
        format: format.format,
        format_id: format.format_id,
        format_note: format.format_note,
        height: format.height,
        width: format.width,
        resolution: format.resolution
      });
    }

    function vcodec(codec: string | undefined): string {
      if (codec === undefined) {
        return '';
      }
      if (codec.includes('av01')) {
        return 'av01';
      }
      if (codec.includes('avc1')) {
        return 'avc1';
      }
      return codec || '';
    }

    function acodec(codec: string | undefined): string {
      if (codec === undefined) {
        return '';
      }
      if (codec.includes('m4a')) {
        return 'm4a';
      }
      if (codec.includes('mp4a')) {
        return 'mp4a';
      }
      return codec || '';
    }

    return (
      <div
        onClick={handleFormatSelect}
        className="selected-format p-1 relative rounded-md w-full bg-secondary flex items-center gap-2 cursor-pointer border"
      >
        <div className="selected-format-left p-1 flex items-center">
          <span className="bg-primary text-primary-foreground text-xs p-2 rounded-md">
            {format.ext}
          </span>
        </div>
        <div className="selected-format-right flex flex-col">
          <span>{format.resolution}</span>
          <span className="text-[10px]">{format.format}</span>
          <div className="text-[10px] flex items-center gap-2">
            <span>fps: {format.fps}</span>
            <span>vcodec: {vcodec(format.vcodec)}</span>
            <span>acodec: {acodec(format.acodec)}</span>
            <span>
              Filesize≈ {format.filesize_approx ? formatFileSize(format.filesize_approx) : ''}
            </span>
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>All formats</DialogTitle>
          <DialogDescription>All audio and video formats</DialogDescription>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setSelectedFilter('all')}
              size={'sm'}
              variant={'secondary'}
              className="text-xs"
            >
              All
            </Button>
            <Button
              onClick={() => setSelectedFilter('video')}
              size={'sm'}
              variant={'secondary'}
              className="text-xs"
            >
              Video
            </Button>
            <Button
              onClick={() => setSelectedFilter('audio')}
              size={'sm'}
              variant={'secondary'}
              className="text-xs"
            >
              Audio
            </Button>
          </div>
        </DialogHeader>
        <div className="w-full font-mono flex flex-col gap-2 h-70 overflow-auto">
          {selectedFilter === 'all' &&
            allFormats.map((format) => <Format key={format.format_id} format={format} />)}
          {selectedFilter === 'video' &&
            videoFormats.map((format) => <Format key={format.format_id} format={format} />)}
          {selectedFilter === 'audio' &&
            audioFormats.map((format) => <Format key={format.format_id} format={format} />)}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface MoreDetailsModalProps {
  infoJson: YoutubeVideoInfoJson;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const MoreDetailsModal = ({ infoJson, open, setOpen }: MoreDetailsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>More Details</DialogTitle>
          <DialogDescription>More details for this media</DialogDescription>
        </DialogHeader>
        <div className="w-full font-mono flex flex-col gap-2 text-xs h-70 overflow-auto">
          <div>
            <span className="font-semibold">Title</span>: <span>{infoJson.fulltitle}</span>
          </div>
          <div>
            <span className="font-semibold">URL</span>:{' '}
            <Anchor href={infoJson.webpage_url}>{infoJson.webpage_url}</Anchor>
          </div>
          <div>
            <span className="font-semibold">Duration</span>:{' '}
            <span>{infoJson.duration_string?.length === 0 ? 'N/A' : infoJson.duration_string}</span>
          </div>
          <div>
            <span className="font-semibold">Uploader</span>: <span>{infoJson.uploader}</span>
          </div>
          <div>
            <span className="font-semibold">Uploader URL</span>:{' '}
            <Anchor href={infoJson.uploader_url}>{infoJson.uploader_url}</Anchor>
          </div>
          <div>
            <span className="font-semibold">Uploade Date</span>:{' '}
            <span>{formatDate(infoJson.upload_date)}</span>
          </div>
          <div>
            <span className="font-semibold">Thumbnail</span>:{' '}
            <Anchor href={infoJson.thumbnail}>{infoJson.thumbnail}</Anchor>
          </div>
          <div>
            <span className="font-semibold">Live Status</span>:{' '}
            <span>{infoJson.is_live ? 'Live Now' : infoJson.was_live ? 'Was Live' : 'N/A'}</span>
          </div>
          <div>
            <span className="font-semibold">Categories</span>:{' '}
            <span>{infoJson.categories.join(', ')}</span>
          </div>
          <div>
            <span className="font-semibold">Tags</span>: <span>{infoJson.tags.join(', ')}</span>
          </div>
          <div>
            <span className="font-semibold">Availablity</span>: <span>{infoJson.availability}</span>
          </div>
          <div>
            <span className="font-semibold">Age Limit</span>: <span>{infoJson.age_limit}</span>
          </div>
          <div>
            <span className="font-semibold">Last fetched</span>:{' '}
            <span>{new Date(infoJson.created_at).toLocaleString()}</span>
          </div>
          <div>
            <span className="font-semibold">Description</span>:{' '}
            {infoJson.description ? (
              <>
                <br />
                <p className="w-full resize-none p-1">{infoJson.description}</p>
              </>
            ) : (
              'N/A'
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

type YoutubeVideoInfoProps = {
  url: string;
};

const YoutubeVideoInfo = ({ url }: YoutubeVideoInfoProps) => {
  const [searchParams] = useSearchParams();
  const updateUrlHistory = searchParams.get('updateUrlHistory') === '0' ? false : true;
  const videoId = new URL(url).searchParams.get('v');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
  );
  const infoJson = useMediaInfoStore((state) => state.mediaInfo) as YoutubeVideoInfoJson;
  const [isLoadingInfoJson, setIsLoadingInfoJson] = useState<boolean>(true);

  useEffect(() => {
    if (Object.keys(infoJson).length !== 0) {
      setThumbnailUrl(`media:///${infoJson.thumbnail_local}`);
      setIsLoadingInfoJson(false);
      return;
    }
    setIsLoadingInfoJson(true);
    window.api
      .getYoutubeVideoInfoJson(url, updateUrlHistory)
      .then((data: YoutubeVideoInfoJson | null) => {
        if (!data) {
          toast.error('Could not fetch info for this url');
          setIsLoadingInfoJson(false);
          return;
        }
        useMediaInfoStore.setState({ mediaInfo: data as YoutubeVideoInfoJson });
        if (data.thumbnail_local) {
          setThumbnailUrl(`media:///${data.thumbnail_local}`);
        }
        setIsLoadingInfoJson(false);

        updateUrlHistoryInStore();
      });
  }, []);
  return (
    <div className="flex flex-col">
      <Preview previewUrl={thumbnailUrl} isLoading={isLoadingInfoJson} />
      <div className="p-2">
        {Object.keys(infoJson).length !== 0 ? <Details infoJson={infoJson} /> : <Spinner />}
      </div>
    </div>
  );
};

export default YoutubeVideoInfo;
