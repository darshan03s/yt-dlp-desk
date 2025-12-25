import { ProgressDetails } from '@/shared/types/download';
import {
  DownloadHistoryItem,
  DownloadHistoryList,
  RunningDownloadItem,
  RunningDownloadsList
} from '@/shared/types/history';
import { Badge } from '@renderer/components/ui/badge';
import { Item, ItemContent, ItemFooter, ItemMedia, ItemTitle } from '@renderer/components/ui/item';
import { Anchor, TooltipWrapper } from '@renderer/components/wrappers';
import Logo from '@renderer/components/logo';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ProgressBar } from './components/progress-bar';
import {
  IconClockFilled,
  IconDotsVertical,
  IconExternalLink,
  IconFolder,
  IconInfoSquareRounded,
  IconPhoto,
  IconPlayerPause,
  IconPlayerPauseFilled,
  IconPlayerPlay,
  IconPlayerPlayFilled,
  IconReload,
  IconSearch,
  IconTrash
} from '@tabler/icons-react';
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
import { useSearchStore } from '@renderer/stores/search-store';
import { ButtonGroup } from '@renderer/components/ui/button-group';
import { Input } from '@renderer/components/ui/input';
import { isAudio } from '@shared/utils';
import { FilePlay } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu';

function updateDownloadHistoryInStore() {
  window.api.getDownloadHistory().then((downloadsHistory: DownloadHistoryList) => {
    useHistoryStore.setState({ downloadHistory: downloadsHistory ?? [] });
  });
}

const Downloads = () => {
  const downloadHistory = useHistoryStore((state) => state.downloadHistory);
  const [runningDownloads, setRunningDownloads] = useState<RunningDownloadsList>([]);
  const [queuedDownloads, setQueuedDownloads] = useState<RunningDownloadsList>([]);
  const [isConfirmDeleteAllModalOpen, setIsConfirmDeleteAllModalOpen] = useState(false);

  const searchResults = useSearchStore((state) => state.downloadHistorySearchResults);

  function updateDownloads() {
    window.api.getRunningDownloads().then((data) => {
      setRunningDownloads(data);
    });
    window.api.getQueuedDownloads().then((data) => {
      setQueuedDownloads(data);
    });
    window.api.getDownloadHistory().then((data) => {
      useHistoryStore.setState({ downloadHistory: data });
    });
  }

  useEffect(() => {
    updateDownloads();
    useSearchStore.setState({ downloadHistorySearchResults: [] });
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

  function handlePauseAllDownloads() {
    window.api.pauseAllDownloads();
  }

  function handlePauseWaitingDownloads() {
    window.api.pauseWaitingDownloads();
  }

  function handleResumePausedDownloads() {
    window.api.resumePausedDownloads();
  }

  function handleRetryFailedDownloads() {
    window.api.retryFailedDownloads();
  }

  return (
    <>
      <div className="w-full flex flex-col gap-2">
        <div className="px-3 py-2 h-12 text-sm flex items-center justify-between sticky top-0 left-0 bg-background/60 backdrop-blur-md text-foreground z-49">
          <span className="text-xs flex items-center gap-2 font-main">
            Downloads
            <span>
              <span title="History">({downloadHistory?.length})</span>
              {runningDownloads && runningDownloads?.length > 0 && (
                <span title="Running">({runningDownloads?.length})</span>
              )}
              {queuedDownloads && queuedDownloads?.length > 0 && (
                <span title="Queued">({queuedDownloads?.length})</span>
              )}
            </span>
          </span>
          <div className="flex items-center gap-4">
            <DownloadHistorySearch />
            <TooltipWrapper side="bottom" message={`Options`}>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant={'secondary'} size={'icon-sm'} className="size-7">
                    <IconDotsVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="bottom"
                  className="relative right-6 top-1 flex flex-col gap-2 font-main"
                >
                  <DropdownMenuItem
                    onClick={handlePauseAllDownloads}
                    className="text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <IconPlayerPauseFilled className="size-3.5" />
                    Pause all downloads
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handlePauseWaitingDownloads}
                    className="text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <IconClockFilled className="size-3.5" />
                    Pause waiting downloads
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleResumePausedDownloads}
                    className="text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <IconPlayerPlayFilled className="size-3.5" />
                    Resume paused downloads
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleRetryFailedDownloads}
                    className="text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <IconReload className="size-3.5" />
                    Retry failed downloads
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={downloadHistory?.length === 0}
                    onClick={() => handleUrlHistoryDelete()}
                    variant={'destructive'}
                    className="text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <IconTrash className="size-3.5" />
                    Delete download history
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipWrapper>
          </div>
        </div>
        <div className="px-2 py-1 pb-2">
          {runningDownloads && runningDownloads.length > 0 && (
            <RunningDownloads runningDownloads={runningDownloads} />
          )}
          {queuedDownloads && queuedDownloads.length > 0 && (
            <RunningDownloads runningDownloads={queuedDownloads} />
          )}
          {searchResults!.length > 0 ? (
            <DownloadHistorySearchResults downloadHistorySearchResults={searchResults} />
          ) : (
            <CompletedDownloads downloadsHistory={downloadHistory} />
          )}
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

const DownloadHistorySearch = () => {
  const searchInput = useSearchStore((state) => state.downloadSearchInput);

  function handleSearchInput(input: string) {
    useSearchStore.setState({ downloadSearchInput: input });
    if (input.length === 0) {
      useSearchStore.setState({ downloadHistorySearchResults: [] });
    }
  }

  function handleSearch() {
    if (searchInput.length === 0) return;
    window.api.downloadHistorySearch(searchInput).then((searchResults) => {
      useSearchStore.setState({ downloadHistorySearchResults: searchResults });
    });
  }

  return (
    <ButtonGroup>
      <Input
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch();
          }
        }}
        onChange={(e) => handleSearchInput(e.target.value)}
        className="h-7 text-[10px] w-[260px] font-main placeholder:font-main"
        type="search"
        placeholder="Search in download history"
      />
      <Button variant={'outline'} className="h-7" onClick={handleSearch}>
        <IconSearch />
      </Button>
    </ButtonGroup>
  );
};

const ConfirmDeleteAllModal = ({
  open,
  setOpen
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  function handleConfirmDeleteAll() {
    window.api.deleteAllDownloadHistory().then(() => {
      updateDownloadHistoryInStore();
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="font-main">
        <DialogHeader>
          <DialogTitle className="font-main">Delete all download history?</DialogTitle>
          <DialogDescription className="font-main">
            This action will delete all download history
          </DialogDescription>
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
  downloadItem: RunningDownloadItem | DownloadHistoryItem;
  progressDetails?: ProgressDetails;
}) => {
  const [isMoreInfoModalOpen, setIsMoreInfoModalOpen] = useState(false);
  const [isPlayVideoModalOpen, setIsPlayVideoModalOpen] = useState(false);
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
    window.api.deleteFromDownloadHistory(id).then(() => {
      updateDownloadHistoryInStore();
    });
  }

  function handlePauseRunningDownload(id: string) {
    window.api.pauseRunningDownload(id);
  }

  function handlePauseWaitingDownload(id: string) {
    window.api.pauseWaitingDownload(id);
  }

  function handleResumePausedDownload(id: string) {
    window.api.resumePausedDownload(id);
  }

  function handleRetryFailedDownload(id: string) {
    window.api.retryFailedDownload(id);
  }

  function handlePlay() {
    setIsPlayVideoModalOpen(true);
  }

  function handlePlayInDefaultPlayer() {
    window.api.playMedia(downloadItem.download_path);
  }

  function handleShowInFolder() {
    window.api.showInFolder(downloadItem.download_path);
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
                : `image:///${encodeURIComponent(downloadItem.thumbnail_local)}`
            }
            alt={downloadItem.title}
            className="aspect-video rounded-sm outline-1"
          />
          <span className="bg-black text-white p-1 text-[9px] rounded absolute right-0.5 bottom-0.5 font-main">
            {downloadItem.duration}
          </span>
        </ItemMedia>
        <ItemContent className="flex flex-col gap-2 min-w-0 font-main">
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
                <Logo source={downloadItem.source} />
              </span>
            </TooltipWrapper>
            <TooltipWrapper message={`More Details`}>
              <span onClick={() => setIsMoreInfoModalOpen(true)} className="cursor-pointer">
                <IconInfoSquareRounded className="size-4" />
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
          </div>
          <div className="downloads-history-item-footer-right flex items-center gap-2">
            <TooltipWrapper message={`Show in folder`}>
              <Button
                onClick={() => handleShowInFolder()}
                variant={'ghost'}
                size={'icon-sm'}
                className="size-6 rounded-sm"
              >
                <IconFolder className="size-4" />
              </Button>
            </TooltipWrapper>
            {downloadItem.download_status === 'completed' && (
              <>
                <TooltipWrapper message={`Play in default player`}>
                  <Button
                    onClick={() => handlePlayInDefaultPlayer()}
                    variant={'ghost'}
                    size={'icon-sm'}
                    className="size-6 rounded-sm"
                  >
                    <FilePlay className="size-4" />
                  </Button>
                </TooltipWrapper>
                <TooltipWrapper message={`Play`}>
                  <Button
                    onClick={() => handlePlay()}
                    variant={'ghost'}
                    size={'icon-sm'}
                    className="size-6 rounded-sm"
                  >
                    <IconPlayerPlay className="size-4" />
                  </Button>
                </TooltipWrapper>
              </>
            )}
            {downloadItem.download_status === 'downloading' && (
              <TooltipWrapper message={`Pause download`}>
                <Button
                  onClick={() => handlePauseRunningDownload(downloadItem.id)}
                  variant={'ghost'}
                  size={'icon-sm'}
                  className="size-6 rounded-sm"
                >
                  <IconPlayerPause className="size-4" />
                </Button>
              </TooltipWrapper>
            )}
            {downloadItem.download_status === 'waiting' && (
              <TooltipWrapper message={`Pause waiting download`}>
                <Button
                  onClick={() => handlePauseWaitingDownload(downloadItem.id)}
                  variant={'ghost'}
                  size={'icon-sm'}
                  className="size-6 rounded-sm"
                >
                  <IconPlayerPause className="size-4" />
                </Button>
              </TooltipWrapper>
            )}
            {downloadItem.download_status === 'paused' && (
              <TooltipWrapper message={`Resume download`}>
                <Button
                  onClick={() => handleResumePausedDownload(downloadItem.id)}
                  variant={'ghost'}
                  size={'icon-sm'}
                  className="size-6 rounded-sm"
                >
                  <IconPlayerPlay className="size-4" />
                </Button>
              </TooltipWrapper>
            )}
            {downloadItem.download_status === 'failed' && (
              <TooltipWrapper message={`Retry download`}>
                <Button
                  onClick={() => handleRetryFailedDownload(downloadItem.id)}
                  variant={'ghost'}
                  size={'icon-sm'}
                  className="size-6 rounded-sm"
                >
                  <IconReload className="size-4" />
                </Button>
              </TooltipWrapper>
            )}
            <TooltipWrapper message={`Delete from history`} className="relative right-2">
              <Button
                disabled={downloadItem.download_status === 'downloading'}
                onClick={() => handleDownloadsHistoryItemDelete(downloadItem.id)}
                variant={'ghost'}
                size={'icon-sm'}
                className="size-6 hover:bg-red-500/20 dark:hover:bg-red-500/20 rounded-sm"
              >
                <IconTrash className="size-4 text-red-500" />
              </Button>
            </TooltipWrapper>
          </div>
        </ItemFooter>
      </Item>
      {isMoreInfoModalOpen && (
        <MoreInfo open={isMoreInfoModalOpen} setOpen={setIsMoreInfoModalOpen} data={downloadItem} />
      )}
      {isPlayVideoModalOpen && (
        <PlayMediaModal
          open={isPlayVideoModalOpen}
          setOpen={setIsPlayVideoModalOpen}
          data={downloadItem}
        />
      )}
    </>
  );
};

const MoreInfo = ({
  open,
  setOpen,
  data
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  data: RunningDownloadItem | DownloadHistoryItem;
}) => {
  const [isShowLogsVisible, setIsShowLogsVisible] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="font-main">
        <DialogHeader>
          <DialogTitle className="font-main">Info</DialogTitle>
          <DialogDescription className="font-main">More info of download</DialogDescription>
        </DialogHeader>
        <div className="w-full flex flex-col gap-2 text-xs h-68 overflow-y-auto px-1 pb-2">
          <div>
            <span className="font-semibold">Title</span>: <span>{data.title}</span>
          </div>
          <div>
            <span className="font-semibold">Source</span>: <span>{data.source}</span>
          </div>
          <div>
            <span className="font-semibold">URL</span>:{' '}
            <Anchor href={data.url} className="text-primary">
              {data.url}
            </Anchor>
          </div>
          <div>
            <span className="font-semibold">Uploader</span>: <span>{data.uploader}</span>
          </div>
          <div>
            <span className="font-semibold">Uploader URL</span>:{' '}
            <Anchor href={data.uploader_url || ''} className="text-primary">
              {data.uploader_url || 'N/A'}
            </Anchor>
          </div>
          <div>
            <span className="font-semibold">Thumbnail</span>:{' '}
            <Anchor href={data.thumbnail} className="text-primary">
              {data.thumbnail}
            </Anchor>
          </div>
          <div>
            <span className="font-semibold">Selected Format</span>: <span>{data.format}</span>
          </div>
          {data.start_time.length > 0 && (
            <div>
              <span className="font-semibold">Start Time</span>: <span>{data.start_time}</span>
            </div>
          )}
          {data.end_time.length > 0 && (
            <div>
              <span className="font-semibold">End Time</span>: <span>{data.end_time}</span>
            </div>
          )}
          <div>
            <span className="font-semibold">Download Status</span>:{' '}
            <span>{data.download_status}</span>
          </div>
          <div>
            <span className="font-semibold">Added At</span>:{' '}
            <span>{new Date(data.added_at!).toLocaleString()}</span>
          </div>
          {data.download_status !== 'downloading' && data.download_completed_at && (
            <div>
              <span className="font-semibold">Completed At</span>:{' '}
              <span>{new Date(data.download_completed_at).toLocaleString()}</span>
            </div>
          )}
          <div>
            <span className="font-semibold">Download Path</span>: <span>{data.download_path}</span>
          </div>

          <div className="w-full flex flex-col gap-3 text-xs">
            <textarea
              name="command"
              value={data.command}
              className="h-44 outline-2 p-2 cursor-text resize-none rounded-md font-mono leading-4.5 overflow-y-auto"
              disabled
            />

            {data.download_status !== 'downloading' ? (
              isShowLogsVisible ? (
                <AutoScrollTextarea
                  name="output"
                  value={data.complete_output}
                  className="h-44 outline-2 p-2 text-muted-foreground bg-muted resize-none rounded-md font-mono leading-4.5 overflow-y-auto"
                  disabled
                />
              ) : (
                <Button
                  size={'sm'}
                  className="text-xs h-8"
                  variant={'secondary'}
                  onClick={() => setIsShowLogsVisible(true)}
                >
                  Show logs
                </Button>
              )
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const PlayMediaModal = ({
  open,
  setOpen,
  data
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  data: RunningDownloadItem | DownloadHistoryItem;
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="font-main">
        <DialogHeader>
          <DialogTitle>Play media</DialogTitle>
          <DialogDescription className="line-clamp-1"></DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {isAudio(data.download_path) ? (
            <audio
              controls
              controlsList="nofullscreen"
              autoPlay
              className="w-full"
              src={`playmedia://audio/${encodeURIComponent(data.download_path)}`}
            />
          ) : (
            <video
              className="w-[500px] aspect-video rounded-md outline-1"
              controls
              controlsList="nofullscreen"
              autoPlay
              src={`playmedia://video/${encodeURIComponent(data.download_path)}`}
            />
          )}
          <p className="text-sm">{data.title}</p>
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

const CompletedDownloads = ({ downloadsHistory }: { downloadsHistory: DownloadHistoryList }) => {
  return (
    <div className="w-full space-y-2">
      {downloadsHistory?.map((downloadItem) => (
        <DownloadCard key={downloadItem.id} downloadItem={downloadItem} />
      ))}
    </div>
  );
};

const DownloadHistorySearchResults = ({
  downloadHistorySearchResults
}: {
  downloadHistorySearchResults: DownloadHistoryList;
}) => {
  return (
    <div className="w-full space-y-2">
      {downloadHistorySearchResults?.map((downloadItem) => (
        <DownloadCard key={downloadItem.id} downloadItem={downloadItem} />
      ))}
    </div>
  );
};
