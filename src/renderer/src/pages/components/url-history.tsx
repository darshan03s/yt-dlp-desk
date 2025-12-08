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
import {
  IconExternalLink,
  IconInfoSquareRounded,
  IconPhoto,
  IconSearch,
  IconTrash
} from '@tabler/icons-react';
import { Button } from '@renderer/components/ui/button';
import { Logo } from '@renderer/data/logo';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog';
import { Anchor, TooltipWrapper } from '@renderer/components/wrappers';
import { formatDate } from '@renderer/utils';
import { Input } from '@renderer/components/ui/input';
import { ButtonGroup } from '@renderer/components/ui/button-group';
import { useSearchStore } from '@renderer/stores/search-store';

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
            <span className="font-semibold">URL</span>: <Anchor href={item.url}>{item.url}</Anchor>
          </div>
          <div>
            <span className="font-semibold">Created/Uploaded At</span>:{' '}
            <span>{formatDate(item.created_at)}</span>
          </div>
          <div>
            <span className="font-semibold">Duration</span>:{' '}
            <span>{item.duration.length === 0 ? 'N/A' : item.duration}</span>
          </div>
          <div>
            <span className="font-semibold">Uploader</span>: <span>{item.uploader}</span>
          </div>
          <div>
            <span className="font-semibold">Uploader URL</span>:{' '}
            <Anchor href={item.uploader_url}>{item.uploader_url}</Anchor>
          </div>
          <div>
            <span className="font-semibold">Thumbnail</span>:{' '}
            <Anchor href={item.thumbnail}>{item.thumbnail}</Anchor>
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
      <Item size={'sm'} variant={'outline'} className="hover:bg-muted p-2 border-none">
        <ItemMedia
          className="aspect-video w-32 cursor-pointer relative"
          onClick={handleNavigateToDisplayInfo}
        >
          <img
            src={
              item.thumbnail_local.length === 0
                ? item.thumbnail
                : `media:///${encodeURIComponent(item.thumbnail_local)}`
            }
            alt={item.title}
            className="aspect-video rounded-sm outline-1"
          />
          <span className="bg-black text-white p-1 px-1.5 text-[10px] rounded-md absolute right-0.5 bottom-0.5">
            {item.duration}
          </span>
        </ItemMedia>
        <ItemContent className="flex flex-col gap-3">
          <ItemTitle className="text-xs line-clamp-1">{item.title}</ItemTitle>
          <ItemDescription className="flex gap-2 items-center text-xs">
            <Anchor href={item.uploader_url}>
              <Badge variant={'outline'} className="text-[10px]">
                {item.uploader}
              </Badge>
            </Anchor>
            <Badge variant={'outline'} className="text-[10px]">
              {formatDate(item.created_at)}
            </Badge>
          </ItemDescription>
        </ItemContent>
        <ItemFooter className="url-history-item-footer w-full">
          <div className="url-history-item-footer-left flex items-center gap-3">
            <TooltipWrapper message={`Source: ${item.source}`}>
              <span>
                <img src={Logo(item.source)} alt={item.source} className="size-4" />
              </span>
            </TooltipWrapper>
            <TooltipWrapper message={`More Info`}>
              <span onClick={() => setIsMoreInfoModalOpen(true)} className="cursor-pointer">
                <IconInfoSquareRounded className="size-4" />
              </span>
            </TooltipWrapper>
            <TooltipWrapper message={`Open in browser`}>
              <span>
                <Anchor href={item.url}>
                  <IconExternalLink className="size-4" />
                </Anchor>
              </span>
            </TooltipWrapper>
            <TooltipWrapper message={`Open thumbnail in browser`}>
              <span>
                <Anchor href={item.thumbnail}>
                  <IconPhoto className="size-4" />
                </Anchor>
              </span>
            </TooltipWrapper>
          </div>
          <div className="url-history-item-footer-right">
            <TooltipWrapper message={`Delete from history`}>
              <Button
                onClick={() => handleUrlHistoryItemDelete(item.id)}
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

const UrlHistorySearch = () => {
  const searchInput = useSearchStore((state) => state.urlSearchInput);

  function handleSearchInput(input: string) {
    useSearchStore.setState({ urlSearchInput: input });
    if (input.length === 0) {
      useSearchStore.setState({ urlSearchResults: [] });
    }
  }

  function handleSearch() {
    if (searchInput.length === 0) return;
    window.api.urlHistorySearch(searchInput).then((searchResults) => {
      useSearchStore.setState({ urlSearchResults: searchResults });
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
        className="h-7 text-[10px] w-[260px]"
        type="search"
        placeholder="Search in url history"
      />
      <Button variant={'outline'} className="h-7" onClick={handleSearch}>
        <IconSearch />
      </Button>
    </ButtonGroup>
  );
};

const UrlHistory = () => {
  const [isConfirmDeleteAllModalOpen, setIsConfirmDeleteAllModalOpen] = useState(false);

  const urlHistory = useHistoryStore((state) => state.urlHistory);
  const searchResults = useSearchStore((state) => state.urlSearchResults);

  useEffect(() => {
    updateUrlHistoryInStore();
    useSearchStore.setState({ urlSearchResults: [] });
  }, []);

  function handleUrlHistoryDelete() {
    setIsConfirmDeleteAllModalOpen(true);
  }

  const UrlHistoryListComp = () => (
    <>
      {urlHistory?.map((item) => (
        <UrlHistoryItem key={item.id} item={item} />
      ))}
    </>
  );

  const UrlHistorySearchResultsComp = () => (
    <>
      {searchResults?.map((item) => (
        <UrlHistoryItem key={item.id} item={item} />
      ))}
    </>
  );

  return (
    <>
      <div className="w-full px-3 flex items-center justify-between h-10">
        <span className="text-xs">Url History ({urlHistory?.length})</span>
        <div className="flex items-center gap-4">
          <UrlHistorySearch />
          <TooltipWrapper message={`Delete url history`}>
            <Button
              disabled={urlHistory?.length === 0}
              onClick={() => handleUrlHistoryDelete()}
              variant={'destructive'}
              size={'icon-sm'}
              className="size-6"
            >
              <IconTrash className="size-4" />
            </Button>
          </TooltipWrapper>
        </div>
      </div>
      <div className="p-2 flex flex-col gap-2">
        {searchResults!.length > 0 ? <UrlHistorySearchResultsComp /> : <UrlHistoryListComp />}
      </div>

      <ConfirmDeleteAllModal
        open={isConfirmDeleteAllModalOpen}
        setOpen={setIsConfirmDeleteAllModalOpen}
      />
    </>
  );
};

export default UrlHistory;
