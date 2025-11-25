import UserUrlInput from '@renderer/components/user-url-input';
import { useMediaInfoStore } from '@renderer/stores/media-info-store';
import YoutubeVideoInfo from './components/youtube/youtube-video-info';
import { Source } from '@/shared/types';

const DisplayMediaInfo = () => {
  const url = useMediaInfoStore((state) => state.url);
  const source = useMediaInfoStore((state) => state.source) as Source;

  return (
    <div className="h-full overflow-y-scroll">
      <div className="sticky left-0 top-0 z-50">
        <header className="p-3">
          <UserUrlInput showRefetch={true} url={url} />
        </header>
      </div>

      <div className="relative z-0">
        {source === 'youtube-video' && <YoutubeVideoInfo url={url} />}
      </div>
    </div>
  );
};

export default DisplayMediaInfo;
