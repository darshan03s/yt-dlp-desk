import { type UrlHistoryItem, type UrlHistoryList } from '@shared/types/history';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
  ItemTitle
} from '@renderer/components/ui/item';
import { Badge } from '@renderer/components/ui/badge';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useHistoryStore } from '@renderer/stores/history-store';
import { useMediaInfoStore } from '@renderer/stores/media-info-store';
import { useNavigate } from 'react-router-dom';
import { IconInfoSquareRounded, IconTrash } from '@tabler/icons-react';
import { Button } from '@renderer/components/ui/button';
import { Logo } from '@renderer/data/logo';
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog';

export function updateUrlHistoryInStore() {
  window.api.getUrlHistory().then((urlHistory: UrlHistoryList) => {
    useHistoryStore.setState({ urlHistory: urlHistory ?? [] });
  });
}

const MoreInfo = ({
  open,
  setOpen,
  item
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  item: UrlHistoryItem;
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Info</DialogTitle>
          <DialogDescription>More info of url</DialogDescription>
        </DialogHeader>
        <div className="w-full font-mono flex flex-col gap-2 text-xs">
          <div>
            <span className="font-semibold">Title</span>: <span>{item.title}</span>
          </div>
          <div>
            <span className="font-semibold">Source</span>: <span>{item.source}</span>
          </div>
          <div>
            <span className="font-semibold">Uploader</span>: <span>{item.uploader}</span>
          </div>
          <div>
            <span className="font-semibold">URL</span>:{' '}
            <a href={item.url} target="_blank" rel="noreferrer" className="underline">
              {item.url}
            </a>
          </div>
          <div>
            <span className="font-semibold">Thumbnail</span>:{' '}
            <a href={item.thumbnail} target="_blank" rel="noreferrer" className="underline">
              {item.thumbnail}
            </a>
          </div>
          <div>
            <span className="font-semibold">Last Fetched</span>:{' '}
            <span>{new Date(item.addedAt).toLocaleString()}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const UrlHistoryItem = ({ item }: { item: UrlHistoryItem }) => {
  const [isMoreInfoModalOpen, setIsMoreInfoModalOpen] = useState(false);
  const navigate = useNavigate();

  function handleNavigateToDisplayInfo() {
    useMediaInfoStore.setState({ url: item.url, source: item.source, mediaInfo: {} });
    navigate('/display-media-info?updateUrlHistory=0');
  }

  function handleUrlHistoryItemDelete(id: string) {
    window.api.deleteFromUrlHistory(id).then(() => {
      updateUrlHistoryInStore();
    });
  }

  return (
    <>
      <Item size={'sm'} variant={'outline'} className="hover:bg-muted">
        <ItemMedia
          className="aspect-video w-32 cursor-pointer"
          onClick={handleNavigateToDisplayInfo}
        >
          <img
            src={
              item.thumbnail_local.length === 0
                ? item.thumbnail
                : `media:///${item.thumbnail_local}`
            }
            alt={item.title}
            className="aspect-video rounded-sm"
          />
        </ItemMedia>
        <ItemContent className="flex flex-col gap-3">
          <ItemTitle className="text-xs">{item.title}</ItemTitle>
          <ItemDescription className="flex gap-2 items-center text-xs">
            <Badge variant={'outline'} className="text-[10px]">
              {item.uploader}
            </Badge>
          </ItemDescription>
        </ItemContent>
        <ItemFooter className="url-history-item-footer w-full">
          <div className="url-history-item-footer-left flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger>
                <Button variant={'outline'} size={'icon-sm'}>
                  <img src={Logo(item.source)} alt={item.source} className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Source: {item.source}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  onClick={() => setIsMoreInfoModalOpen(true)}
                  variant={'outline'}
                  size={'icon-sm'}
                >
                  <IconInfoSquareRounded />
                </Button>
              </TooltipTrigger>
              <TooltipContent>More info</TooltipContent>
            </Tooltip>
          </div>
          <div className="url-history-item-footer-right">
            <Tooltip>
              <TooltipTrigger>
                <Button
                  onClick={() => handleUrlHistoryItemDelete(item.id)}
                  variant={'destructive'}
                  size={'icon-sm'}
                >
                  <IconTrash />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete from history</TooltipContent>
            </Tooltip>
          </div>
        </ItemFooter>
      </Item>
      <MoreInfo open={isMoreInfoModalOpen} setOpen={setIsMoreInfoModalOpen} item={item} />
    </>
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
    window.api.deleteAllUrlHistory().then(() => {
      updateUrlHistoryInStore();
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete all url history?</DialogTitle>
          <DialogDescription>This action will delete all url history</DialogDescription>
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

const UrlHistory = () => {
  const [isConfirmDeleteAllModalOpen, setIsConfirmDeleteAllModalOpen] = useState(false);

  const urlHistory = useHistoryStore((state) => state.urlHistory);
  useEffect(() => {
    if (urlHistory && urlHistory.length > 0) return;
    updateUrlHistoryInStore();
  }, []);

  function handleUrlHistoryDelete() {
    setIsConfirmDeleteAllModalOpen(true);
  }

  return (
    <>
      <div className="w-full p-2 flex items-center justify-between border-b">
        <span className="text-sm">History ({urlHistory?.length})</span>
        <Tooltip>
          <TooltipTrigger>
            <Button
              disabled={urlHistory?.length === 0}
              onClick={() => handleUrlHistoryDelete()}
              variant={'destructive'}
              size={'icon-sm'}
            >
              <IconTrash />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete url history</TooltipContent>
        </Tooltip>
      </div>
      <div className="p-2 flex flex-col gap-2">
        {urlHistory?.map((item) => {
          return <UrlHistoryItem key={item.id} item={item} />;
        })}
      </div>

      <ConfirmDeleteAllModal
        open={isConfirmDeleteAllModalOpen}
        setOpen={setIsConfirmDeleteAllModalOpen}
      />
    </>
  );
};

export default UrlHistory;
