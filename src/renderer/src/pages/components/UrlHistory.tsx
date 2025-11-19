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
import { useEffect } from 'react';
import { useHistoryStore } from '@renderer/stores/history-store';
import { useMediaInfoStore } from '@renderer/stores/media-info-store';
import { useNavigate } from 'react-router-dom';
import { IconTrash } from '@tabler/icons-react';
import { Button } from '@renderer/components/ui/button';
import { Logo } from '@renderer/data/logo';
import { Tooltip, TooltipContent, TooltipTrigger } from '@renderer/components/ui/tooltip';

export function updateUrlHistoryInStore() {
  window.api.getUrlHistory().then((urlHistory: UrlHistoryList) => {
    useHistoryStore.setState({ urlHistory: urlHistory ?? [] });
  });
}

const UrlHistoryItem = ({ item }: { item: UrlHistoryItem }) => {
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
    <Item size={'sm'} variant={'outline'} className="hover:bg-muted">
      <ItemMedia className="aspect-video w-32 cursor-pointer" onClick={handleNavigateToDisplayInfo}>
        <img
          src={
            item.thumbnail_local.length === 0 ? item.thumbnail : `media:///${item.thumbnail_local}`
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
        <div className="url-history-item-footer-left">
          <Tooltip>
            <TooltipTrigger>
              <Button variant={'outline'} size={'icon-sm'}>
                <img src={Logo(item.source)} alt={item.source} className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Source: {item.source}</TooltipContent>
          </Tooltip>
        </div>
        <div className="url-history-item-footer-right">
          <Tooltip>
            <TooltipTrigger>
              <Button
                onClick={() => handleUrlHistoryItemDelete(item.id)}
                variant={'outline'}
                size={'icon-sm'}
                className="text-destructive hover:text-destructive/70"
              >
                <IconTrash />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete from history</TooltipContent>
          </Tooltip>
        </div>
      </ItemFooter>
    </Item>
  );
};

const UrlHistory = () => {
  const urlHistory = useHistoryStore((state) => state.urlHistory);
  useEffect(() => {
    if (urlHistory && urlHistory.length > 0) return;
    updateUrlHistoryInStore();
  }, []);
  return (
    <div className="p-2 flex flex-col gap-2">
      {urlHistory?.map((item) => {
        return <UrlHistoryItem key={item.id} item={item} />;
      })}
    </div>
  );
};

export default UrlHistory;
