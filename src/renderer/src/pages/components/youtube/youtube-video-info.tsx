import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { YoutubeFormat, YoutubeVideoInfoJson } from '@/shared/types/info-json/youtube-video';
import { toast } from 'sonner';
import { useMediaInfoStore } from '@renderer/stores/media-info-store';
import { useSearchParams } from 'react-router-dom';
import { updateUrlHistoryInStore } from '../url-history';
import {
  IconArrowDown,
  IconCircleCheckFilled,
  IconClockHour3Filled,
  IconFolder,
  IconKeyframes,
  IconPhotoVideo
} from '@tabler/icons-react';
import { acodec, formatDate, formatFileSize, vcodec } from '@renderer/utils';
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
import { DownloadOptions } from '@/shared/types/download';
import { Input } from '@renderer/components/ui/input';
import { Toggle } from '@renderer/components/ui/toggle';
import { useSettingsStore } from '@renderer/stores/settings-store';

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
  }, []);

  useEffect(() => {
    if (Object.keys(infoJson).length !== 0) return;
    window.api.getYoutubeVideoInfoJson(url, updateUrlHistory);

    const unsubscribe = window.api.on('yt-dlp:recieve-youtube-video-info-json', (data) => {
      if (!data) {
        toast.error('Could not fetch info for this url');
        setIsLoadingInfoJson(false);
        return;
      }
      const infoJson = data as YoutubeVideoInfoJson;
      useMediaInfoStore.setState({ mediaInfo: infoJson as YoutubeVideoInfoJson });
      if (infoJson.thumbnail_local) {
        setThumbnailUrl(`media:///${infoJson.thumbnail_local}`);
      }
      setIsLoadingInfoJson(false);

      updateUrlHistoryInStore();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="flex flex-col">
      <Preview
        previewUrl={thumbnailUrl}
        loading={isLoadingInfoJson}
        duration={infoJson.duration_string}
      />
      <div className="p-2">
        <Details infoJson={infoJson} />
      </div>
    </div>
  );
};

const Preview = ({
  previewUrl,
  loading,
  duration
}: {
  previewUrl: string;
  loading: boolean;
  duration?: string;
}) => {
  return (
    <div className="w-full h-60 bg-black flex items-center justify-center">
      {loading ? (
        <div className="w-[420px] aspect-video bg-secondary animate-fast" />
      ) : (
        <div className="relative">
          <img src={previewUrl} alt="Preview" width={420} className="aspect-video" />
          {duration && (
            <span className="absolute right-1 bottom-1 text-xs p-1 px-2 bg-black text-white rounded-md">
              {duration}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const Details = ({ infoJson }: { infoJson: YoutubeVideoInfoJson }) => {
  const [isMoreDetailsModalOpen, setIsMoreDetailsModalOpen] = useState(false);
  const isInfoJsonEmpty = Object.keys(infoJson).length === 0;

  return (
    <>
      <div className="flex flex-col gap-2">
        {isInfoJsonEmpty ? (
          <div className="border bg-secondary h-10 px-2 rounded-md animate-fast" />
        ) : (
          <div
            onClick={() => setIsMoreDetailsModalOpen(true)}
            className="text-xs border bg-secondary text-secondary-foreground h-10 px-2 rounded-md cursor-pointer flex items-center"
          >
            <p className="text-xs leading-5 line-clamp-1">
              {infoJson.fulltitle ?? infoJson.title ?? 'N/A'}
            </p>
          </div>
        )}
        <div className="py-1 flex items-center justify-between">
          {!isInfoJsonEmpty ? (
            <div className="flex items-center gap-2 flex-1">
              {infoJson.uploader && (
                <span className="text-xs inline-flex items-center gap-1 outline-1 p-1 px-2 rounded-full">
                  {infoJson.channel_is_verified ? (
                    <IconCircleCheckFilled className="size-3" />
                  ) : null}
                  {infoJson.uploader}
                </span>
              )}
              {infoJson.upload_date && (
                <span className="text-xs inline-flex items-center gap-1 outline-1 p-1 px-2 rounded-full">
                  <IconClockHour3Filled className="size-3" />
                  {formatDate(infoJson.upload_date || '')}
                </span>
              )}
              <span className="text-xs inline-flex items-center gap-1">
                <LiveStatus infoJson={infoJson} />
              </span>
            </div>
          ) : (
            <div className="flex-1"></div>
          )}

          <div>
            <DownloadButton loading={isInfoJsonEmpty} />
          </div>
        </div>

        <div className="formats-display">
          <Formats infoJson={infoJson} loading={isInfoJsonEmpty} />
        </div>

        {!infoJson.is_live && (
          <div className="download-sections">
            <DownloadSections loading={isInfoJsonEmpty} />
          </div>
        )}

        <div className="download-location">
          <DownloadLocation loading={isInfoJsonEmpty} />
        </div>

        <div className="extra-options">
          <ExtraOptions />
        </div>
      </div>

      {!isInfoJsonEmpty && (
        <MoreDetailsModal
          open={isMoreDetailsModalOpen}
          setOpen={setIsMoreDetailsModalOpen}
          infoJson={infoJson}
        />
      )}
    </>
  );
};

const LiveStatus = ({ infoJson }: { infoJson: YoutubeVideoInfoJson }) => {
  if (infoJson.was_live) {
    return (
      <span className="bg-red-500 text-white text-[12px] px-2 py-0.5 rounded-full">Was Live</span>
    );
  } else if (infoJson.is_live) {
    return (
      <span className="bg-red-500 text-white text-[12px] px-2 py-0.5 rounded-full">Live Now</span>
    );
  } else return null;
};

const DownloadButton = ({ loading }: { loading: boolean }) => {
  const selectedFormat = useSelectedOptionsStore((state) => state.selectedFormat);
  const downloadSections = useSelectedOptionsStore((state) => state.downloadSections);
  const selectedDownloadFolder = useSelectedOptionsStore((state) => state.selectedDownloadFolder);
  const extraOptions = useSelectedOptionsStore((state) => state.extraOptions);
  const url = useMediaInfoStore.getState().url;
  const source = useMediaInfoStore.getState().source;
  const mediaInfo = useMediaInfoStore((state) => state.mediaInfo);

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

    const unsubscribe = window.api.on('download-begin', () => {
      toast.info('Download Started');
      unsubscribe();
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

const Formats = ({ infoJson, loading }: { infoJson: YoutubeVideoInfoJson; loading: boolean }) => {
  const [isAllFormatsModalOpen, setIsAllFormatsModalOpen] = useState(false);
  const setSelectedFormat = useSelectedOptionsStore((state) => state.setSelectedFormat);
  const selectedFormat = useSelectedOptionsStore((state) => state.selectedFormat);
  const defaultFormat: SelectedFormat = {
    vcodec: infoJson.vcodec ?? 'N/A',
    acodec: infoJson.acodec ?? 'N/A',
    ext: infoJson.ext ?? 'N/A',
    filesize_approx: infoJson.filesize_approx ?? 0,
    fps: infoJson.fps ?? 0,
    format: infoJson.format ?? 'N/A',
    format_id: infoJson.format_id ?? 'N/A',
    format_note: infoJson.format_note ?? 'N/A',
    height: infoJson.height ?? 0,
    width: infoJson.width ?? 0,
    resolution: infoJson.resolution ?? 'N/A'
  };
  useEffect(() => {
    setSelectedFormat(defaultFormat);
  }, [infoJson]);

  return (
    <>
      {loading ? (
        <div
          className={`relative border px-1 h-16 rounded-md w-full bg-secondary ${loading ? 'animate-fast' : ''}`}
        ></div>
      ) : (
        infoJson.formats && (
          <div
            onClick={() => setIsAllFormatsModalOpen(true)}
            className="selected-format relative border px-1 h-16 rounded-md w-full bg-secondary flex items-center gap-2 cursor-pointer"
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
                <span>vcodec: {vcodec(selectedFormat.vcodec || defaultFormat.vcodec)}</span>
                <span>acodec: {acodec(selectedFormat.acodec || defaultFormat.acodec)}</span>
                <span>
                  Filesize≈{' '}
                  {formatFileSize(
                    selectedFormat.filesize_approx! || defaultFormat.filesize_approx!
                  )}
                </span>
              </div>
            </div>
            <span className="absolute right-0 top-0 text-[10px] bg-primary/30 px-2 py-0.5 rounded-tr-md rounded-bl-md">
              Selected Format
            </span>
          </div>
        )
      )}
      {!loading && infoJson.formats.length > 0 && (
        <AllFormatsModal
          open={isAllFormatsModalOpen}
          setOpen={setIsAllFormatsModalOpen}
          formats={infoJson.formats}
          defaultFormat={defaultFormat}
        />
      )}
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
  const isDefaultFormatPresent = allFormats.some((f) => f.format_id === defaultFormat.format_id);
  if (!isDefaultFormatPresent) {
    allFormats.unshift(defaultFormat);
  }
  const videoAndAudioFormats = formats
    .filter((format) => format.vcodec !== 'none' && format.acodec !== 'none')
    .reverse();
  const mp4Formats = formats.filter((format) => format.ext === 'mp4').reverse();
  const webmFormats = formats.filter((format) => format.ext === 'webm').reverse();
  const vp9Formats = formats.filter((format) => format.vcodec.includes('vp9')).reverse();
  const av01Formats = formats.filter((format) => format.vcodec.includes('av01')).reverse();
  const avc1Formats = formats.filter((format) => format.vcodec.includes('avc1')).reverse();
  const opusFormats = formats.filter((format) => format.acodec.includes('opus')).reverse();
  const mp4aFormats = formats.filter((format) => format.acodec.includes('mp4a')).reverse();

  const formatFiltersObj = {
    all: 'All',
    'video-and-video': 'Video & Audio',
    video: 'Video',
    audio: 'Audio',
    mp4: 'Video: mp4',
    webm: 'Video: webm',
    vp9: 'Video: vp9',
    av01: 'Video: av01',
    avc1: 'Video: avc1',
    opus: 'Audio: opus',
    mp4a: 'Audio: mp4a'
  };

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

  const [selectedFilter, setSelectedFilter] = useState<FormatFilter>('all');

  const Format = ({ format }: { format: YoutubeFormat | SelectedFormat }) => {
    const setSelectedFormat = useSelectedOptionsStore((state) => state.setSelectedFormat);
    const selectedFormat = useSelectedOptionsStore((state) => state.selectedFormat);

    function handleFormatSelect() {
      setSelectedFormat({
        vcodec: format.vcodec ?? 'N/A',
        acodec: format.acodec ?? 'N/A',
        ext: format.ext ?? 'N/A',
        filesize_approx: format.filesize_approx ?? 0,
        fps: format.fps ?? 0,
        format: format.format ?? 'N/A',
        format_id: format.format_id ?? 'N/A',
        format_note: format.format_note ?? 'N/A',
        height: format.height ?? 0,
        width: format.width ?? 0,
        resolution: format.resolution ?? 'N/A'
      });
    }

    return (
      <div
        onClick={handleFormatSelect}
        className="selected-format p-1 relative rounded-md w-full bg-secondary flex items-center gap-2 cursor-pointer border"
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
            <span>fps: {format.fps ?? 'N/A'}</span>
            <span>vcodec: {vcodec(format.vcodec)}</span>
            <span>acodec: {acodec(format.acodec)}</span>
            <span>
              Filesize≈ {format.filesize_approx ? formatFileSize(format.filesize_approx) : 'N/A'}
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
          <p className="bg-yellow-300/20 text-[10px] rounded-md border p-2 text-foreground">
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
              {formatFiltersObj[formatFilter]}
            </Button>
          ))}
        </div>
        <div className="w-full font-mono flex flex-col gap-2 h-70 overflow-auto">
          {formatMap[selectedFilter]?.map((format) => (
            <Format key={format.format_id} format={format} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DownloadSections = ({ loading }: { loading: boolean }) => {
  const downloadSections = useSelectedOptionsStore((state) => state.downloadSections);
  const setDownloadSections = useSelectedOptionsStore((state) => state.setDownloadSections);

  useEffect(() => {
    setDownloadSections({ startTime: '', endTime: '', forceKeyframesAtCuts: false });
  }, []);

  function handleStarttime(e: React.ChangeEvent<HTMLInputElement>) {
    setDownloadSections({ startTime: e.currentTarget.value });
  }

  function handleEndtime(e: React.ChangeEvent<HTMLInputElement>) {
    setDownloadSections({ endTime: e.currentTarget.value });
  }

  function handleToggle(pressed: boolean) {
    setDownloadSections({ forceKeyframesAtCuts: pressed });
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        disabled={loading}
        type="text"
        placeholder="Start Time (HH:MM:SS)"
        value={downloadSections.startTime}
        onChange={handleStarttime}
        className="text-xs h-8"
      />
      <Input
        disabled={loading}
        type="text"
        placeholder="End Time (HH:MM:SS)"
        value={downloadSections.endTime}
        onChange={handleEndtime}
        className="text-xs h-8"
      />
      <Toggle
        disabled={loading}
        title="Force keyframes at cuts"
        pressed={downloadSections.forceKeyframesAtCuts}
        onPressedChange={handleToggle}
        size="sm"
        variant="outline"
        className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:fill-primary data-[state=on]:*:[svg]:stroke-primary"
      >
        <IconKeyframes />
      </Toggle>
    </div>
  );
};

const DownloadLocation = ({ loading }: { loading: boolean }) => {
  const downloadsFolderFromSettings = useSettingsStore((state) => state.downloadsFolder);
  const selectedDownloadFolder = useSelectedOptionsStore((state) => state.selectedDownloadFolder);

  useEffect(() => {
    useSelectedOptionsStore.setState({ selectedDownloadFolder: downloadsFolderFromSettings });
  }, []);

  async function pickFolder() {
    const path = await window.api.selectFolder();
    if (path) {
      useSelectedOptionsStore.setState({ selectedDownloadFolder: path });
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Input disabled type="text" className="text-xs" value={selectedDownloadFolder} />
      <Button
        variant={'outline'}
        onClick={pickFolder}
        disabled={loading}
        title="Select download folder"
      >
        <IconFolder />
      </Button>
    </div>
  );
};

const ExtraOptions = () => {
  const extraOptions = useSelectedOptionsStore((state) => state.extraOptions);
  const setExtraOptions = useSelectedOptionsStore((state) => state.setExtraOptions);

  function handleEmbedThumbnailToggle(pressed: boolean) {
    setExtraOptions({ embedThumbnail: pressed });
  }

  const EmbedThumbnail = () => {
    return (
      <Toggle
        title="Embed thumbnail"
        pressed={extraOptions.embedThumbnail}
        onPressedChange={handleEmbedThumbnailToggle}
        size="sm"
        variant="outline"
        className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:stroke-primary"
      >
        <IconPhotoVideo />
      </Toggle>
    );
  };

  return (
    <div>
      <EmbedThumbnail />
    </div>
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
            <span className="font-semibold">Title</span>: <span>{infoJson.fulltitle || 'N/A'}</span>
          </div>
          <div>
            <span className="font-semibold">URL</span>:{' '}
            <Anchor href={infoJson.webpage_url || ''}>{infoJson.webpage_url || 'N/A'}</Anchor>
          </div>
          <div>
            <span className="font-semibold">Duration</span>:{' '}
            <span>{infoJson.duration_string?.length === 0 ? 'N/A' : infoJson.duration_string}</span>
          </div>
          <div>
            <span className="font-semibold">Uploader</span>:{' '}
            <span>{infoJson.uploader || 'N/A'}</span>
          </div>
          <div>
            <span className="font-semibold">Uploader URL</span>:{' '}
            <Anchor href={infoJson.uploader_url || infoJson.channel_url || ''}>
              {infoJson.uploader_url || infoJson.channel_url || 'N/A'}
            </Anchor>
          </div>
          <div>
            <span className="font-semibold">Uploade Date</span>:{' '}
            <span>{formatDate(infoJson.upload_date || '')}</span>
          </div>
          <div>
            <span className="font-semibold">Thumbnail</span>:{' '}
            <Anchor href={infoJson.thumbnail || ''}>{infoJson.thumbnail || 'N/A'}</Anchor>
          </div>
          <div>
            <span className="font-semibold">Live Status</span>:{' '}
            <span>{infoJson.is_live ? 'Live Now' : infoJson.was_live ? 'Was Live' : 'N/A'}</span>
          </div>
          <div>
            <span className="font-semibold">Categories</span>:{' '}
            <span>{infoJson.categories?.join(', ')}</span>
          </div>
          <div>
            <span className="font-semibold">Tags</span>: <span>{infoJson.tags?.join(', ')}</span>
          </div>
          <div>
            <span className="font-semibold">Availablity</span>:{' '}
            <span>{infoJson.availability || 'N/A'}</span>
          </div>
          <div>
            <span className="font-semibold">Age Limit</span>:{' '}
            <span>{infoJson.age_limit ?? 'N/A'}</span>
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

export default YoutubeVideoInfo;
