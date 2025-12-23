import { IconArrowLeft, IconArrowRight, IconX } from '@tabler/icons-react';
import { Minus } from 'lucide-react';
import appIcon from '../../../../build/icon.png';
import { useNavigate } from 'react-router-dom';
import ModeToggle from './mode-toggle';
import { RunningDownloadsList } from '@/shared/types/history';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@renderer/components/ui/alert-dialog';
import { Button } from './ui/button';

const Titlebar = () => {
  const [isConfirmExitModalVisible, setIsConfirmExitModalVisible] = useState(false);

  const navigate = useNavigate();
  function goBack() {
    navigate(-1);
  }

  function goForward() {
    navigate(1);
  }

  function minimize() {
    window.api.minimize();
  }

  function close() {
    window.api.getRunningDownloads().then((runningDownloads: RunningDownloadsList) => {
      if (runningDownloads && runningDownloads?.length > 0) {
        setIsConfirmExitModalVisible(true);
        return;
      } else {
        window.api.close();
      }
    });
  }

  return (
    <div className="titlebar h-(--titlebar-height) w-full bg-background text-foreground flex items-center select-none relative z-9999 pointer-events-auto">
      <div className="titlebar-left px-2 flex items-center gap-2">
        <img src={appIcon} alt="icon" width={18} height={18} className="rounded-[4px]" />
        <div className="flex items-center gap-1">
          <button title="Go Back" onClick={goBack} className="opacity-60 hover:opacity-100">
            <IconArrowLeft className="size-4" />
          </button>
          <button title="Go Forward" onClick={goForward} className="opacity-60 hover:opacity-100">
            <IconArrowRight className="size-4" />
          </button>
          <ModeToggle />
        </div>
      </div>
      <div className="titlebar-center flex-1 text-center opacity-60 text-xs font-satoshi font-bold">
        VidArchive {import.meta.env.DEV ? '(DEV)' : null}
      </div>
      <div className="titlebar-right flex items-center">
        <button
          title="Minimize"
          onClick={minimize}
          className="w-10 hover:bg-secondary flex items-center justify-center h-10"
        >
          <Minus className="size-4 text-foreground" />
        </button>
        <button
          title="Close"
          onClick={close}
          className="w-10 hover:bg-red-600/80 flex items-center justify-center h-10 rounded-tr-lg"
        >
          <IconX className="size-4 text-foreground" />
        </button>
      </div>
      {isConfirmExitModalVisible && (
        <ConfirmExitModal open={isConfirmExitModalVisible} setOpen={setIsConfirmExitModalVisible} />
      )}
    </div>
  );
};

interface ConfirmExitModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const ConfirmExitModal = ({ open, setOpen }: ConfirmExitModalProps) => {
  function pauseAllRunningDownloadsAndExit() {
    window.api.pauseAllDownloads();
  }

  useEffect(() => {
    const unsubscribe = window.api.on('yt-dlp:paused-all-downloads', () => {
      setOpen(false);
      window.electron.ipcRenderer.send('win:close');
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm exit</AlertDialogTitle>
          <AlertDialogDescription>There are still downloads running</AlertDialogDescription>
        </AlertDialogHeader>
        <p className="text-sm">Pause all running downloads?</p>
        <AlertDialogFooter>
          <Button
            className="bg-red-600 text-white hover:bg-red-500 text-xs"
            onClick={pauseAllRunningDownloadsAndExit}
          >
            Pause all and exit
          </Button>
          <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Titlebar;
