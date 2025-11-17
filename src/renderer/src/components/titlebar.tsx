import { IconArrowLeft, IconArrowRight, IconX } from '@tabler/icons-react';
import { Minus } from 'lucide-react';
import appIcon from '../../../../build/icon.png';
import { useNavigate } from 'react-router-dom';
import ModeToggle from './mode-toggle';

const Titlebar = () => {
  const navigate = useNavigate();
  function goBack() {
    navigate(-1);
  }

  function goForward() {
    navigate(1);
  }

  function minimize() {
    window.electron.ipcRenderer.send('win:min');
  }

  function close() {
    window.electron.ipcRenderer.send('win:close');
  }

  return (
    <div className="titlebar h-(--titlebar-height) w-full bg-black text-white flex items-center select-none sticky top-0 left-0 z-9999 pointer-events-auto">
      <div className="titlebar-left px-2 flex items-center gap-2">
        <img src={appIcon} alt="icon" width={18} height={18} />
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
      <div className="titlebar-center flex-1 text-center opacity-60 text-xs font-mono">
        ytdlp-ui
      </div>
      <div className="titlebar-right flex items-center">
        <button
          title="Minimize"
          onClick={minimize}
          className="w-10 hover:bg-white/20 flex items-center justify-center h-10"
        >
          <Minus className="size-4 text-white/80" />
        </button>
        <button
          title="Close"
          onClick={close}
          className="w-10 hover:bg-red-600/80 flex items-center justify-center h-10 rounded-tr-lg"
        >
          <IconX className="size-4 text-white/80" />
        </button>
      </div>
    </div>
  );
};

export default Titlebar;
