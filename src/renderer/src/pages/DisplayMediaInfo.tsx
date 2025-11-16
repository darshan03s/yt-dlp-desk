import UserUrlInput from '@renderer/components/user-url-input';
import { useMediaInfoStore } from '@renderer/stores/media-info-store';
import YoutubeVideoInfo from './components/youtube/YoutubeVideoInfo';
import { Source } from '@/shared/types';

const DisplayMediaInfo = () => {
  const url = useMediaInfoStore((state) => state.url);
  const source = useMediaInfoStore((state) => state.source) as Source;

  return (
    <div className="h-full overflow-y-scroll">
      <div className="sticky left-0 top-0">
        <header className="bg-secondary text-secondary-foreground font-inter p-3">
          <UserUrlInput showRefetch={true} url={url} />
        </header>
      </div>

      <div>{source === 'youtube-video' && <YoutubeVideoInfo url={url} />}</div>
    </div>
  );
};

export default DisplayMediaInfo;
