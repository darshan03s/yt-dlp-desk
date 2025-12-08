import UserUrlInput from '@renderer/components/user-url-input';
import { useMediaInfoStore } from '@renderer/stores/media-info-store';
import { Source } from '@/shared/types';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MediaInfoJson } from '@/shared/types/info-json';
import { toast } from 'sonner';
import { updateUrlHistoryInStore } from './components/url-history';
import Preview from './components/media-info/preview';
import Details from './components/media-info/details';

const DisplayMediaInfo = () => {
  const navigate = useNavigate();
  const url = useMediaInfoStore((state) => state.url);
  const source = useMediaInfoStore((state) => state.source) as Source;
  const [searchParams] = useSearchParams();
  const updateUrlHistory = searchParams.get('updateUrlHistory') === '0' ? false : true;
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const infoJson = useMediaInfoStore((state) => state.mediaInfo) as MediaInfoJson;
  const [isLoadingInfoJson, setIsLoadingInfoJson] = useState<boolean>(true);

  useEffect(() => {
    if (!url && !source) {
      navigate('/');
    }
  }, []);

  useEffect(() => {
    if (Object.keys(infoJson).length !== 0) {
      setThumbnailUrl(`media:///${encodeURIComponent(infoJson.thumbnail_local!)}`);
      setIsLoadingInfoJson(false);
      return;
    }
  }, []);

  useEffect(() => {
    if (Object.keys(infoJson).length !== 0) return;
    window.api.getMediaInfoJson(url, source, updateUrlHistory);

    const unsubscribe = window.api.on('yt-dlp:recieve-media-info-json', (data) => {
      if (!data) {
        toast.error('Could not fetch info for this url');
        setIsLoadingInfoJson(false);
        return;
      }
      const infoJson = data as MediaInfoJson;
      useMediaInfoStore.setState({ mediaInfo: infoJson });
      if (infoJson.thumbnail_local) {
        setThumbnailUrl(`media:///${encodeURIComponent(infoJson.thumbnail_local)}`);
      }
      setIsLoadingInfoJson(false);

      updateUrlHistoryInStore();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="h-full overflow-y-scroll">
      <div className="sticky left-0 top-0 z-50">
        <header className="p-3 sticky top-0 left-0 z-50 bg-background/60 backdrop-blur-md">
          <UserUrlInput showRefetch={true} />
        </header>
      </div>

      <div className="relative z-0">
        <div className="flex flex-col">
          <Preview
            previewUrl={thumbnailUrl}
            loading={isLoadingInfoJson}
            infoJson={infoJson}
            url={url}
            source={source}
          />
          <div className="p-2 pb-8">
            <Details infoJson={infoJson} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayMediaInfo;
