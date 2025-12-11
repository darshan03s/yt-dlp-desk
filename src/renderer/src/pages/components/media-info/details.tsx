import { MediaInfoJson } from '@/shared/types/info-json';
import { formatDate } from '@renderer/utils';
import {
  IconCircleCheckFilled,
  IconClockHour3Filled,
  IconEye,
  IconNumber,
  IconThumbUp
} from '@tabler/icons-react';
import { useState } from 'react';
import LiveStatus from './live-status';
import DownloadButton from './download-button';
import Formats from './formats';
import DownloadSections from './download-sections';
import DownloadLocation from './download-location';
import ExtraOptions from './extra-options';
import MoreDetailsModal from './more-details-modal';
import { useMediaInfoStore } from '@renderer/stores/media-info-store';
import { Source } from '@shared/types';
import numeral from 'numeral';

const Details = ({ infoJson }: { infoJson: MediaInfoJson }) => {
  const [isMoreDetailsModalOpen, setIsMoreDetailsModalOpen] = useState(false);
  const isInfoJsonEmpty = Object.keys(infoJson).length === 0;
  const source = useMediaInfoStore((state) => state.source) as Source;

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
                  {infoJson.channel_follower_count ? (
                    <span>
                      {' | '} {numeral(infoJson.channel_follower_count).format('0.00a')}
                    </span>
                  ) : null}
                </span>
              )}
              {infoJson.upload_date && (
                <span className="text-xs inline-flex items-center gap-1 outline-1 p-1 px-2 rounded-full">
                  <IconClockHour3Filled className="size-3" />
                  {formatDate(infoJson.upload_date || '')}
                </span>
              )}
              {infoJson.modified_date && (
                <span className="text-xs inline-flex items-center gap-1 outline-1 p-1 px-2 rounded-full">
                  <IconClockHour3Filled className="size-3" />
                  {formatDate(infoJson.modified_date || '')}
                </span>
              )}
              {(source === 'youtube-playlist' || source === 'youtube-music-playlist') && (
                <span className="text-xs inline-flex items-center gap-1 outline-1 p-1 px-2 rounded-full">
                  <IconNumber className="size-3" />
                  Playlist Count: {infoJson.playlist_count}
                </span>
              )}
              {infoJson.view_count && (
                <span className="text-xs inline-flex items-center gap-1 outline-1 p-1 px-2 rounded-full">
                  <IconEye className="size-3" />
                  {numeral(infoJson.view_count).format('0.00a')}
                </span>
              )}
              {infoJson.like_count && (
                <span className="text-xs inline-flex items-center gap-1 outline-1 p-1 px-2 rounded-full">
                  <IconThumbUp className="size-3" />
                  {numeral(infoJson.like_count).format('0.00a')}
                </span>
              )}
              <span className="text-xs inline-flex items-center gap-1">
                <LiveStatus infoJson={infoJson} />
              </span>
            </div>
          ) : (
            <div className="flex-1"></div>
          )}

          {!(source === 'youtube-playlist' || source === 'youtube-music-playlist') && (
            <div>
              <DownloadButton loading={isInfoJsonEmpty} />
            </div>
          )}
        </div>

        {!(source === 'youtube-playlist' || source === 'youtube-music-playlist') && (
          <div className="formats-display">
            <Formats infoJson={infoJson} loading={isInfoJsonEmpty} />
          </div>
        )}

        {source !== 'youtube-playlist' && source !== 'youtube-music-playlist' && (
          <div className="download-sections pt-2">
            <h1 className="text-xs border-border border-b mb-2 pb-1">Download Sections</h1>
            <DownloadSections loading={isInfoJsonEmpty} />
          </div>
        )}

        {!(source === 'youtube-playlist' || source === 'youtube-music-playlist') && (
          <div className="download-location pt-2">
            <h1 className="text-xs border-border border-b mb-2 pb-1">Download Location</h1>
            <DownloadLocation loading={isInfoJsonEmpty} />
          </div>
        )}

        {!isInfoJsonEmpty &&
          source !== 'youtube-playlist' &&
          source !== 'youtube-music-playlist' && (
            <div className="extra-options pt-2">
              <ExtraOptions />
            </div>
          )}
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

export default Details;
