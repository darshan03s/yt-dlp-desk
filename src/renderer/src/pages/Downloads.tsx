import { ProgressDetails } from '@/shared/types/download';
import {
  DownloadsHistoryItem,
  DownloadsHistoryList,
  RunningDownloadItem,
  RunningDownloadsList
} from '@/shared/types/history';
import { Badge } from '@renderer/components/ui/badge';
import { Item, ItemContent, ItemFooter, ItemMedia, ItemTitle } from '@renderer/components/ui/item';
import { Anchor, TooltipWrapper } from '@renderer/components/wrappers';
import { Logo } from '@renderer/data/logo';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ProgressBar } from './components/progress-bar';
import { IconExternalLink, IconPhoto, IconTerminal2, IconTrash } from '@tabler/icons-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useMediaInfoStore } from '@renderer/stores/media-info-store';
import { AutoScrollTextarea } from './components/auto-scroll-textarea';
import { useHistoryStore } from '@renderer/stores/history-store';
import { Button } from '@renderer/components/ui/button';

function updateDownloadsHistoryInStore() {
  window.api.getDownloadsHistory().then((downloadsHistory: DownloadsHistoryList) => {
    useHistoryStore.setState({ downloadHistory: downloadsHistory ?? [] });
  });
}

const Downloads = () => {
  const downloadsHistory = useHistoryStore((state) => state.downloadHistory);
  const [runningDownloads, setRunningDownloads] = useState<RunningDownloadsList>([]);
  const [isConfirmDeleteAllModalOpen, setIsConfirmDeleteAllModalOpen] = useState(false);

  function updateDownloads() {
    window.api.getRunningDownloads().then((data) => {
      setRunningDownloads(data);
    });
    window.api.getDownloadsHistory().then((data) => {
      useHistoryStore.setState({ downloadHistory: data });
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

  function handleUrlHistoryDelete() {
    setIsConfirmDeleteAllModalOpen(true);
  }

  return (
    <>
      <div className="w-full flex flex-col gap-2">
        <div className="px-3 py-2 h-12 text-sm flex items-center justify-between sticky top-0 left-0 bg-background/60 backdrop-blur-md text-foreground z-49">
          <span className="text-xs">History ({downloadsHistory?.length})</span>
          <TooltipWrapper side="bottom" message={`Delete downloads history`}>
            <Button
              disabled={downloadsHistory?.length === 0}
              onClick={() => handleUrlHistoryDelete()}
              variant={'destructive'}
              size={'icon-sm'}
              className="size-6"
            >
              <IconTrash className="size-4" />
            </Button>
          </TooltipWrapper>
        </div>
        <div className="px-2 py-1 pb-2">
          {runningDownloads && runningDownloads.length > 0 && (
            <RunningDownloads runningDownloads={runningDownloads} />
          )}
          <CompletedDownloads downloadsHistory={downloadsHistory} />
        </div>
      </div>
      <ConfirmDeleteAllModal
        open={isConfirmDeleteAllModalOpen}
        setOpen={setIsConfirmDeleteAllModalOpen}
      />
    </>
  );
};

export default Downloads;

const ConfirmDeleteAllModal = ({
  open,
  setOpen
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  function handleConfirmDeleteAll() {
    window.api.deleteAllDownloadsHistory().then(() => {
      updateDownloadsHistoryInStore();
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete all downloads history?</DialogTitle>
          <DialogDescription>This action will delete all downloads history</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex ">
          <DialogClose asChild>
            <Button variant={'outline'}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleConfirmDeleteAll} variant={'destructive'}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

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

  function handleDownloadsHistoryItemDelete(id: string) {
    window.api.deleteFromDownloadsHistory(id).then(() => {
      updateDownloadsHistoryInStore();
    });
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
          <div className="flex flex-col gap-1 text-xs">
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
              <p className="line-clamp-1 text-[10px] text-muted-foreground">
                {progressDetails?.progressString ?? downloadItem.download_progress_string}
              </p>
              <ProgressBar
                downloadStatus={downloadItem.download_status}
                value={progressDetails?.progressPercentage ?? downloadItem.download_progress}
              />
            </div>
          </div>
        </ItemContent>
        <ItemFooter className="downloads-history-item-footer w-full">
          <div className="downloads-history-item-footer-left flex items-center gap-3">
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
            <TooltipWrapper message={`Command and Output`}>
              <span onClick={() => setIsCommandModalOpen(true)} className="cursor-pointer">
                <IconTerminal2 className="size-4" />
              </span>
            </TooltipWrapper>
          </div>
          <div className="downloads-history-item-footer-right">
            <TooltipWrapper message={`Delete from history`}>
              <Button
                disabled={downloadItem.download_status === 'downloading'}
                onClick={() => handleDownloadsHistoryItemDelete(downloadItem.id)}
                variant={'ghost'}
                size={'icon-sm'}
                className="size-6 hover:bg-red-500/20 dark:hover:bg-red-500/20"
              >
                <IconTrash className="size-4 text-red-500" />
              </Button>
            </TooltipWrapper>
          </div>
        </ItemFooter>
      </Item>
      <Command open={isCommandModalOpen} setOpen={setIsCommandModalOpen} data={downloadItem} />
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
  data: RunningDownloadItem | DownloadsHistoryItem;
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Command and Output</DialogTitle>
          <DialogDescription>See download command and output</DialogDescription>
        </DialogHeader>
        <div className="w-full flex flex-col gap-3 text-xs">
          <textarea
            name="command"
            className="h-44 outline-2 p-2 cursor-text resize-none rounded-md font-mono leading-4.5 overflow-y-auto"
            disabled
          >
            {data.command}
          </textarea>

          {data.download_status !== 'downloading' ? (
            <AutoScrollTextarea
              name="output"
              value={data.complete_output}
              className="h-44 outline-2 p-2 text-muted-foreground bg-muted resize-none rounded-md font-mono leading-4.5 overflow-y-auto"
              disabled
            />
          ) : null}
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
