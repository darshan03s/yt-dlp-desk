import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { YoutubeVideoInfoJson } from '@/shared/types/info-json/youtube-video';
import { toast } from 'sonner';
import { Spinner } from '@renderer/components/ui/spinner';
import { useMediaInfoStore } from '@renderer/stores/media-info-store';
import { useSearchParams } from 'react-router-dom';
import { updateUrlHistoryInStore } from '../UrlHistory';
import { IconCircleCheckFilled, IconClockHour3Filled } from '@tabler/icons-react';
import { formatDate } from '@renderer/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog';
import { Anchor } from '@renderer/components/wrappers';

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
        <span className="bg-red-500 text-white text-[10px] p-1 px-1.5 rounded-full">Was Live</span>
      );
    } else if (infoJson.is_live) {
      return (
        <span className="bg-red-500 text-white text-[10px] p-1 px-1.5 rounded-full">Is Live</span>
      );
    } else return null;
  };

  return (
    <>
      <div
        onClick={() => setIsMoreDetailsModalOpen(true)}
        className="text-xs bg-secondary text-secondary-foreground p-2 rounded-md cursor-pointer flex flex-col gap-1"
      >
        <div className="">
          <p className="text-xs leading-5">
            <LiveStatus /> {infoJson.fulltitle}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] bg-primary text-primary-foreground p-1 px-1.5 rounded-full inline-flex items-center gap-1">
            {infoJson.channel_is_verified ? <IconCircleCheckFilled className="size-3" /> : null}
            {infoJson.uploader}
          </span>
          <span className="text-[10px] bg-primary text-primary-foreground p-1 px-1.5 rounded-full inline-flex items-center gap-1">
            <IconClockHour3Filled className="size-3" />
            {formatDate(infoJson.upload_date)}
          </span>
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
            <span>{infoJson.duration_string.length === 0 ? 'N/A' : infoJson.duration_string}</span>
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
