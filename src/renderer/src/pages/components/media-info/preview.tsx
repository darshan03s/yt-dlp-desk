import { SERVER_BASE_URL, SERVER_PORT } from '@shared/data';
import { Source } from '@shared/types';
import { MediaInfoJson } from '@shared/types/info-json';
import { Anchor } from '@renderer/components/wrappers';
import { IconExternalLink } from '@tabler/icons-react';

const Preview = ({
  previewUrl,
  loading,
  infoJson,
  url,
  source
}: {
  previewUrl: string;
  loading: boolean;
  infoJson: MediaInfoJson;
  url: string;
  source: Source;
}) => {
  if (source === 'youtube-video') {
    return (
      <div className="w-full h-60 bg-black flex items-center justify-center">
        <iframe
          className="aspect-video w-[420px] border-none outline-0 shadow-none m-0 p-0"
          src={`${SERVER_BASE_URL}:${SERVER_PORT}/embed?url=${url}&source=${source}`}
          scrolling="no"
        ></iframe>
      </div>
    );
  } else {
    return (
      <div className="w-full h-60 bg-black flex items-center justify-center">
        {loading ? (
          <div className="w-[420px] aspect-video bg-secondary animate-fast" />
        ) : (
          <div className="relative">
            <img src={previewUrl} alt="Preview" width={420} className="aspect-video" />
            {infoJson.duration_string && (
              <span className="absolute right-1 bottom-1 text-xs p-1 px-2 bg-black text-white rounded-md">
                {infoJson.duration_string}
              </span>
            )}
            <Anchor
              href={url}
              className="absolute top-1 right-1 bg-black p-1 text-white rounded-md"
            >
              <IconExternalLink className="size-4" />
            </Anchor>
          </div>
        )}
      </div>
    );
  }
};

export default Preview;
