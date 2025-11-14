import { useEffect, useState } from 'react';
import YtdlpFfmpegConfirmModal from './components/ytdlp-ffmpeg-confirm-modal';
import { Spinner } from './components/ui/spinner';
import { type AppSettings } from '@/shared/types';
import { useSettingsStore } from './stores/settings-store';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import { Toaster } from './components/ui/sonner';
import Titlebar from './components/titlebar';
import DisplayMediaInfo from './pages/DisplayMediaInfo';
import logger from '@shared/logger';
import { toast } from 'sonner';

const App = () => {
  const [loadingFromSettings, setLoadingFromSettings] = useState(true);
  const [isYtdlpFmpegConfirmModalVisible, setIsYtdlpFfmpegConfirmModalVisible] = useState(false);
  const setSettings = useSettingsStore((state) => state.setSettings);

  useEffect(() => {
    window.api.rendererInit().then((settings: AppSettings | null) => {
      setLoadingFromSettings(false);

      if (settings) {
        setSettings(settings);
        const isYtdlpMissing = !settings.ytdlpPath || !settings.ytdlpVersion;
        const isFfmpegMissing = !settings.ffmpegPath || !settings.ffmpegVersion;

        if (isYtdlpMissing || isFfmpegMissing) {
          setIsYtdlpFfmpegConfirmModalVisible(true);
        }
      } else {
        logger.error('Could not get settings');
        toast.error('Could not get settings');
      }
    });
  }, [setSettings]);

  const handleCloseModal = () => {
    setIsYtdlpFfmpegConfirmModalVisible(false);
  };

  if (loadingFromSettings) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <>
      <Titlebar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/display-media-info" element={<DisplayMediaInfo />} />
      </Routes>
      {isYtdlpFmpegConfirmModalVisible ? (
        <YtdlpFfmpegConfirmModal
          open={isYtdlpFmpegConfirmModalVisible}
          onOpenChange={handleCloseModal}
        />
      ) : null}
      <Toaster />
    </>
  );
};

export default App;
