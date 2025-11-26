import { ProgressDetails } from '@/shared/types/download';
import {
  DownloadsHistoryItem,
  DownloadsHistoryList,
  RunningDownloadItem,
  RunningDownloadsList
} from '@/shared/types/history';
import { Badge } from '@renderer/components/ui/badge';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
  ItemTitle
} from '@renderer/components/ui/item';
import { Anchor, TooltipWrapper } from '@renderer/components/wrappers';
import { Logo } from '@renderer/data/logo';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ProgressBar } from './components/progress-bar';
import { IconExternalLink, IconPhoto, IconTerminal2 } from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useMediaInfoStore } from '@renderer/stores/media-info-store';

const Downloads = () => {
  const [runningDownloads, setRunningDownloads] = useState<RunningDownloadsList>([]);
  const [downloadsHistory, setDownloadsHistory] = useState<DownloadsHistoryList>([]);

  function updateDownloads() {
    window.api.getRunningDownloads().then((data) => {
      setRunningDownloads(data);
    });
    window.api.getDownloadsHistory().then((data) => {
      setDownloadsHistory(data);
    });
  }

  useEffect(() => {
    updateDownloads();
  }, []);

  useEffect(() => {
    const unsubscribe = window.api.on('refresh-downloads', () => {
      updateDownloads();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="px-2 py-2 h-10 text-sm flex items-center justify-between sticky top-0 left-0 bg-background/60 backdrop-blur-md text-foreground z-49">
        History ({downloadsHistory?.length})
      </div>
      <div className="px-2 py-1 pb-2">
        {runningDownloads && runningDownloads.length > 0 && (
          <RunningDownloads runningDownloads={runningDownloads} />
        )}
        <CompletedDownloads downloadsHistory={downloadsHistory} />
      </div>
    </div>
  );
};

export default Downloads;

const DownloadCard = ({
  downloadItem,
  progressDetails
}: {
  downloadItem: RunningDownloadItem | DownloadsHistoryItem;
  progressDetails?: ProgressDetails;
}) => {
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
  const navigate = useNavigate();

  function handleNavigateToDisplayInfo() {
    useMediaInfoStore.setState({
      url: downloadItem.url,
      source: downloadItem.source,
      mediaInfo: {}
    });
    navigate('/display-media-info?updateUrlHistory=0');
  }

  return (
    <>
      <Item size={'sm'} variant={'outline'} className="hover:bg-muted p-2 border-none">
        <ItemMedia
          onClick={() => handleNavigateToDisplayInfo()}
          className="aspect-video w-34 shrink-0 relative cursor-pointer"
        >
          <img
            src={
              downloadItem.thumbnail_local.length === 0
                ? downloadItem.thumbnail
                : `media:///${downloadItem.thumbnail_local}`
            }
            alt={downloadItem.title}
            className="aspect-video rounded-sm outline-1"
          />
          <span className="bg-black text-white p-1 px-1.5 text-[10px] rounded-md absolute right-0.5 bottom-0.5">
            {downloadItem.duration}
          </span>
        </ItemMedia>
        <ItemContent className="flex flex-col gap-2 min-w-0">
          <ItemTitle className="text-xs line-clamp-1">{downloadItem.title}</ItemTitle>
          <ItemDescription className="flex flex-col gap-1 text-xs">
            <div className="flex items-center gap-2">
              <Anchor href={downloadItem.uploader_url}>
                <Badge variant={'outline'} className="text-[10px]">
                  {downloadItem.uploader}
                </Badge>
              </Anchor>
              <Badge variant={'outline'} className="text-[10px]">
                {downloadItem.format}
              </Badge>
              {downloadItem.start_time || downloadItem.end_time ? (
                <Badge variant="outline" className="text-[10px]">
                  {(downloadItem.start_time.length === 0 ? '00:00:00' : downloadItem.start_time) +
                    ' - ' +
                    downloadItem.end_time}
                </Badge>
              ) : (
                downloadItem.start_time || null
              )}
            </div>
            <div className="space-y-2">
              <p className="line-clamp-1 text-[10px]">
                {progressDetails?.progressString ?? downloadItem.download_progress_string}
              </p>
              <ProgressBar
                value={progressDetails?.progressPercentage ?? downloadItem.download_progress}
              />
            </div>
          </ItemDescription>
        </ItemContent>
        <ItemFooter className="url-history-item-footer w-full">
          <div className="url-history-item-footer-left flex items-center gap-3">
            <TooltipWrapper message={`Source: ${downloadItem.source}`}>
              <span>
                <img src={Logo(downloadItem.source)} alt={downloadItem.source} className="size-4" />
              </span>
            </TooltipWrapper>
            <TooltipWrapper message={`Open in browser`}>
              <span>
                <Anchor href={downloadItem.url}>
                  <IconExternalLink className="size-4" />
                </Anchor>
              </span>
            </TooltipWrapper>
            <TooltipWrapper message={`Open thumbnail in browser`}>
              <span>
                <Anchor href={downloadItem.thumbnail}>
                  <IconPhoto className="size-4" />
                </Anchor>
              </span>
            </TooltipWrapper>
            <TooltipWrapper message={`Command`}>
              <span onClick={() => setIsCommandModalOpen(true)} className="cursor-pointer">
                <IconTerminal2 className="size-4" />
              </span>
            </TooltipWrapper>
          </div>
          <div className="url-history-item-footer-right"></div>
        </ItemFooter>
      </Item>
      <Command
        open={isCommandModalOpen}
        setOpen={setIsCommandModalOpen}
        data={downloadItem.command}
      />
    </>
  );
};

const Command = ({
  open,
  setOpen,
  data
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  data: string;
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Command</DialogTitle>
          <DialogDescription>See download command</DialogDescription>
        </DialogHeader>
        <div className="w-full flex flex-col gap-2 text-xs">
          <textarea
            name="command"
            className="h-44 outline-2 p-2 cursor-text resize-none rounded-md font-mono leading-4.5 overflow-y-auto"
            disabled
          >
            {data}
          </textarea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const RunningDownloadItemComp = ({ downloadItem }: { downloadItem: RunningDownloadItem }) => {
  const [progressDetails, setProgressDetails] = useState<ProgressDetails>({
    progressString: downloadItem.download_progress_string,
    progressPercentage: downloadItem.download_progress
  });

  useEffect(() => {
    const unsubscribe = window.api.on(`download-progress:${downloadItem.id}`, (progressDetails) => {
      setProgressDetails(progressDetails as ProgressDetails);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="w-full">
      <DownloadCard downloadItem={downloadItem} progressDetails={progressDetails} />
    </div>
  );
};

const RunningDownloads = ({ runningDownloads }: { runningDownloads: RunningDownloadsList }) => {
  return (
    <div className="w-full space-y-2 pb-2">
      {runningDownloads?.map((downloadItem) => (
        <RunningDownloadItemComp key={downloadItem.id} downloadItem={downloadItem} />
      ))}
    </div>
  );
};

const CompletedDownloads = ({ downloadsHistory }: { downloadsHistory: DownloadsHistoryList }) => {
  return (
    <div className="w-full space-y-2">
      {downloadsHistory?.map((downloadItem) => (
        <DownloadCard key={downloadItem.id} downloadItem={downloadItem} />
      ))}
    </div>
  );
};
