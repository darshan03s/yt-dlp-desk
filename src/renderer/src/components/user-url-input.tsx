import { Button } from './ui/button';
import { ButtonGroup } from './ui/button-group';
import { Input } from './ui/input';
import { IconCloudDown, IconReload } from '@tabler/icons-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useState } from 'react';
import { useMediaInfoStore } from '@renderer/stores/media-info-store';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import logger from '@shared/logger';

type UserUrlInputProps = {
  showRefetch: boolean;
};

const UserUrlInput = ({ showRefetch }: UserUrlInputProps) => {
  const [userEnteredUrl, setUserEnteredUrl] = useState('');
  const navigate = useNavigate();

  function handleRefetchMediaInfo() {
    // TODO
    console.log(userEnteredUrl);
  }

  async function handleFetchMediaInfo() {
    const { source, url, isMediaDisplayAvailable } = await window.api.checkUrl(userEnteredUrl);
    logger.info({ source, url, isMediaDisplayAvailable });
    if (isMediaDisplayAvailable) {
      useMediaInfoStore.setState({ source: source, url: url });
      navigate('/display-media-info');
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
      {showRefetch ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={handleRefetchMediaInfo}>
              <IconReload />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refetch</TooltipContent>
        </Tooltip>
      ) : null}
      <Input
        placeholder="Enter a URL"
        className="placeholder:text-sm"
        type="url"
        onChange={handleUrlInput}
        onKeyDown={handleUrlInputEnter}
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={handleFetchMediaInfo}>
            <IconCloudDown />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Fetch</TooltipContent>
      </Tooltip>
    </ButtonGroup>
  );
};

export default UserUrlInput;
