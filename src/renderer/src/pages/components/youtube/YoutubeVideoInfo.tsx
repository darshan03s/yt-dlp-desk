import { useEffect, useState } from 'react';
import { YoutubeVideoInfoJson } from '@/shared/types/info-json/youtube-video';
import { toast } from 'sonner';
import { Spinner } from '@renderer/components/ui/spinner';
import { useMediaInfoStore } from '@renderer/stores/media-info-store';
import { useSearchParams } from 'react-router-dom';
import { updateUrlHistoryInStore } from '../UrlHistory';

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

  const Details = () => {
    return <div className="text-sm">{infoJson?.fulltitle}</div>;
  };

  return (
    <div className="flex flex-col">
      <Preview previewUrl={thumbnailUrl} isLoading={isLoadingInfoJson} />
      <div className="p-2">{Object.keys(infoJson).length !== 0 ? <Details /> : <Spinner />}</div>
    </div>
  );
};

export default YoutubeVideoInfo;
