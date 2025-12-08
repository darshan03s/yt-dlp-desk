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
import { formatDate } from '@renderer/utils';
import { Dispatch, SetStateAction } from 'react';

interface MoreDetailsModalProps {
  infoJson: MediaInfoJson;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const MoreDetailsModal = ({ infoJson, open, setOpen }: MoreDetailsModalProps) => {
  const source = useMediaInfoStore((state) => state.source) as Source;
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
            <span>{infoJson.fulltitle ?? infoJson.title ?? 'N/A'}</span>
          </div>
          <div>
            <span className="font-semibold">URL</span>:{' '}
            <Anchor href={infoJson.webpage_url || ''}>{infoJson.webpage_url || 'N/A'}</Anchor>
          </div>
          {source !== 'youtube-playlist' && (
            <div>
              <span className="font-semibold">Duration</span>:{' '}
              <span>
                {infoJson.duration_string?.length === 0 ? 'N/A' : infoJson.duration_string}
              </span>
            </div>
          )}
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
          {source === 'youtube-playlist' ? (
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
            <Anchor href={infoJson.thumbnail ?? infoJson.thumbnails.at(-1)?.url ?? ''}>
              {infoJson.thumbnail ?? infoJson.thumbnails.at(-1)?.url ?? 'N/A'}
            </Anchor>
          </div>
          {source === 'youtube-playlist' && (
            <div>
              <span className="font-semibold">View Count</span>: <span>{infoJson.view_count}</span>
            </div>
          )}
          {source !== 'youtube-playlist' && (
            <div>
              <span className="font-semibold">Live Status</span>:{' '}
              <span>{infoJson.is_live ? 'Live Now' : infoJson.was_live ? 'Was Live' : 'N/A'}</span>
            </div>
          )}
          {source !== 'youtube-playlist' && (
            <div>
              <span className="font-semibold">Categories</span>:{' '}
              <span>{infoJson.categories?.join(', ')}</span>
            </div>
          )}
          <div>
            <span className="font-semibold">Tags</span>: <span>{infoJson.tags?.join(', ')}</span>
          </div>
          <div>
            <span className="font-semibold">Availablity</span>:{' '}
            <span>{infoJson.availability || 'N/A'}</span>
          </div>
          {source !== 'youtube-playlist' && (
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

export default MoreDetailsModal;
