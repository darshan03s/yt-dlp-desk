import { Source } from '@shared/types';
import { MediaInfoJson } from '@/shared/types/info-json';
import { AlertDialogHeader } from '@renderer/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle
} from '@renderer/components/ui/dialog';
import { Anchor } from '@renderer/components/wrappers';
import { useMediaInfoStore } from '@renderer/stores/media-info-store';
import { formatDate, secondsToHMS } from '@renderer/utils';
import { Dispatch, SetStateAction } from 'react';
import numeral from 'numeral';

interface MoreDetailsModalProps {
  infoJson: MediaInfoJson;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const MoreDetailsModal = ({ infoJson, open, setOpen }: MoreDetailsModalProps) => {
  const source = useMediaInfoStore((state) => state.source) as Source;
  const url = useMediaInfoStore((state) => state.url);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <AlertDialogHeader>
          <DialogTitle>More Details</DialogTitle>
          <DialogDescription>More details for this media</DialogDescription>
        </AlertDialogHeader>
        <div className="w-full font-mono flex flex-col gap-2 text-xs h-70 overflow-auto">
          <div>
            <span className="font-semibold">Title</span>:{' '}
            <span>{infoJson.fulltitle || infoJson.title || 'N/A'}</span>
          </div>
          {infoJson.alt_title && (
            <div>
              <span className="font-semibold">Alt Title</span>: <span>{infoJson.alt_title}</span>
            </div>
          )}
          <div>
            <span className="font-semibold">URL</span>:{' '}
            <Anchor href={url || infoJson.webpage_url || ''}>
              {url || infoJson.webpage_url || 'N/A'}
            </Anchor>
          </div>
          {!(source === 'youtube-playlist' || source === 'youtube-music-playlist') && (
            <div>
              <span className="font-semibold">Duration</span>:{' '}
              <span>
                {infoJson.duration_string?.length === 0
                  ? 'N/A'
                  : (infoJson.duration_string ?? 'N/A')}
              </span>
            </div>
          )}
          <div>
            <span className="font-semibold">Uploader</span>:{' '}
            <span>{infoJson.uploader || 'N/A'}</span>
          </div>
          {infoJson.artist && (
            <div>
              <span className="font-semibold">Artist</span>: <span>{infoJson.artist}</span>
            </div>
          )}
          {infoJson.creator && (
            <div>
              <span className="font-semibold">Creator</span>: <span>{infoJson.creator}</span>
            </div>
          )}
          <div>
            <span className="font-semibold">Uploader URL</span>:{' '}
            <Anchor href={infoJson.uploader_url || infoJson.channel_url || ''}>
              {infoJson.uploader_url || infoJson.channel_url || 'N/A'}
            </Anchor>
          </div>
          {source === 'youtube-playlist' || source === 'youtube-music-playlist' ? (
            <div>
              <span className="font-semibold">Modified Date</span>:{' '}
              <span>{formatDate(infoJson.modified_date || '')}</span>
            </div>
          ) : (
            <div>
              <span className="font-semibold">Upload Date</span>:{' '}
              <span>{formatDate(infoJson.upload_date || '')}</span>
            </div>
          )}
          <div>
            <span className="font-semibold">Thumbnail</span>:{' '}
            <Anchor href={infoJson.thumbnail ?? infoJson.thumbnails?.at(-1)?.url ?? ''}>
              {infoJson.thumbnail ?? infoJson.thumbnails?.at(-1)?.url ?? 'N/A'}
            </Anchor>
          </div>
          {infoJson.view_count !== undefined && (
            <div>
              <span className="font-semibold">View Count</span>:{' '}
              <span>{numeral(infoJson.view_count).format('0.00a')}</span>
            </div>
          )}
          {infoJson.comment_count !== undefined && (
            <div>
              <span className="font-semibold">Comment Count</span>:{' '}
              <span>{numeral(infoJson.comment_count).format('0.00a')}</span>
            </div>
          )}
          {infoJson.like_count !== undefined && (
            <div>
              <span className="font-semibold">Like Count</span>:{' '}
              <span>{numeral(infoJson.like_count).format('0.00a')}</span>
            </div>
          )}
          {infoJson.repost_count !== undefined && (
            <div>
              <span className="font-semibold">Repost Count</span>:{' '}
              <span>{numeral(infoJson.repost_count).format('0.00a')}</span>
            </div>
          )}
          {infoJson.concurrent_view_count !== undefined && (
            <div>
              <span className="font-semibold">Concurrent View Count</span>:{' '}
              <span>{numeral(infoJson.concurrent_view_count).format('0.00a')}</span>
            </div>
          )}
          {!(source === 'youtube-playlist' || source === 'youtube-music-playlist') && (
            <div>
              <span className="font-semibold">Live Status</span>:{' '}
              <span>{infoJson.is_live ? 'Live Now' : infoJson.was_live ? 'Was Live' : 'N/A'}</span>
            </div>
          )}
          {infoJson.categories !== undefined && (
            <div>
              <span className="font-semibold">Categories</span>:{' '}
              <span>{infoJson.categories?.join(', ')}</span>
            </div>
          )}
          {infoJson.tags !== undefined && (
            <div>
              <span className="font-semibold">Tags</span>: <span>{infoJson.tags?.join(', ')}</span>
            </div>
          )}
          {infoJson.album !== undefined && (
            <div>
              <span className="font-semibold">Album</span>: <span>{infoJson.album}</span>
            </div>
          )}
          {infoJson.artists !== undefined && (
            <div>
              <span className="font-semibold">Artists</span>:{' '}
              <span>{infoJson.artists?.join(', ')}</span>
            </div>
          )}
          {infoJson.track !== undefined && (
            <div>
              <span className="font-semibold">Track</span>: <span>{infoJson.track}</span>
            </div>
          )}
          {infoJson.release_year !== undefined && (
            <div>
              <span className="font-semibold">Release Year</span>:{' '}
              <span>{infoJson.release_year}</span>
            </div>
          )}
          <div>
            <span className="font-semibold">Availablity</span>:{' '}
            <span>{infoJson.availability || 'N/A'}</span>
          </div>
          {!(source === 'youtube-playlist' || source === 'youtube-music-playlist') && (
            <div>
              <span className="font-semibold">Age Limit</span>:{' '}
              <span>{infoJson.age_limit ?? 'N/A'}</span>
            </div>
          )}
          <div>
            <span className="font-semibold">Last fetched</span>:{' '}
            <span>{new Date(infoJson.created_at).toLocaleString()}</span>
          </div>
          <div>
            <span className="font-semibold">Description</span>:{' '}
            {infoJson.description !== undefined ? (
              <>
                <br />
                <p className="w-full resize-none p-1">{infoJson.description}</p>
              </>
            ) : (
              'N/A'
            )}
          </div>
          {infoJson.chapters !== undefined && (
            <div>
              <span className="font-semibold">Chapters: </span>
              <div className="flex flex-col gap-2">
                {infoJson.chapters?.map((c) => (
                  <div key={c.start_time} className="flex flex-col">
                    <span>Start time: {secondsToHMS(c.start_time)}</span>
                    <span>Title: {c.title}</span>
                    <span>End time: {secondsToHMS(c.end_time)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MoreDetailsModal;
