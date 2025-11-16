import { useEffect, useState } from 'react';
import { YoutubeVideo } from '@/shared/types/info-json/youtube-video';
import { toast } from 'sonner';
import { Spinner } from '@renderer/components/ui/spinner';

const Preview = ({ previewUrl }: { previewUrl: string }) => {
  return (
    <div className="w-full h-60 bg-black flex items-center justify-center">
      <img src={previewUrl} alt="Preview" width={420} className="aspect-video" />
    </div>
  );
};

type YoutubeVideoInfoProps = {
  url: string;
};

const YoutubeVideoInfo = ({ url }: YoutubeVideoInfoProps) => {
  const videoId = new URL(url).searchParams.get('v');
  const hqDefaultThumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const [infoJson, setInfoJson] = useState<YoutubeVideo | null>(null);

  useEffect(() => {
    window.api.getYoutubeVideoInfoJson(url).then((data: YoutubeVideo | null) => {
      setInfoJson(data);
      if (!data) {
        toast.error('Could not fetch info for this url');
      }
    });
  }, []);

  const Details = () => {
    return <div className="text-sm">{infoJson?.fulltitle}</div>;
  };

  return (
    <div className="flex flex-col">
      <Preview previewUrl={hqDefaultThumbnailUrl} />
      <div className="p-2">{infoJson ? <Details /> : <Spinner />}</div>
    </div>
  );
};

export default YoutubeVideoInfo;
