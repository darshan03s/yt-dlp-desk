import { Button } from './ui/button';
import { ButtonGroup } from './ui/button-group';
import { Input } from './ui/input';
import { IconCloudDown, IconReload } from '@tabler/icons-react';
import { useState } from 'react';
import { useMediaInfoStore } from '@renderer/stores/media-info-store';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import logger from '@shared/logger';
import { TooltipWrapper } from './wrappers';

type UserUrlInputProps = {
  showRefetch: boolean;
  url?: string;
};

const UserUrlInput = ({ showRefetch, url = '' }: UserUrlInputProps) => {
  const [userEnteredUrl, setUserEnteredUrl] = useState('');
  const navigate = useNavigate();

  function isUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  function handleRefetchMediaInfo() {
    // TODO
    console.log(userEnteredUrl);
  }

  async function handleFetchMediaInfo() {
    if (!isUrl(userEnteredUrl)) return;
    const { source, url, isMediaDisplayAvailable } = await window.api.checkUrl(userEnteredUrl);
    logger.info({ source, url, isMediaDisplayAvailable });
    if (isMediaDisplayAvailable) {
      useMediaInfoStore.setState({ source: source, url: url, mediaInfo: {} });
      navigate('/display-media-info?updateUrlHistory=1');
    } else {
      toast.error('This url is currently not supported for displaying info');
    }
  }

  function handleUrlInput(e: React.ChangeEvent<HTMLInputElement>) {
    setUserEnteredUrl(e.target.value);
  }

  function handleUrlInputEnter(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleFetchMediaInfo();
    }
  }
  return (
    <ButtonGroup className="w-full">
      <Input
        placeholder="Enter a URL"
        className="placeholder:text-xs text-xs font-mono select-text h-8"
        type="url"
        onChange={handleUrlInput}
        onKeyDown={handleUrlInputEnter}
        defaultValue={url}
        disabled={!!url}
      />
      {showRefetch ? (
        <TooltipWrapper message="Refetch" side="bottom">
          <Button onClick={handleRefetchMediaInfo} variant={'default'} className="h-8">
            <IconReload />
          </Button>
        </TooltipWrapper>
      ) : (
        <TooltipWrapper message="Fetch" side="bottom">
          <Button onClick={handleFetchMediaInfo} variant={'default'} className="h-8">
            <IconCloudDown />
          </Button>
        </TooltipWrapper>
      )}
    </ButtonGroup>
  );
};

export default UserUrlInput;
