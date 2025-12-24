import { useEffect, useState } from 'react';
import YtdlpFfmpegConfirmModal from './components/ytdlp-ffmpeg-confirm-modal';
import { Spinner } from './components/ui/spinner';
import { type AppSettings } from '@/shared/types';
import { useSettingsStore } from './stores/settings-store';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import { Toaster } from './components/ui/sonner';
import DisplayMediaInfo from './pages/DisplayMediaInfo';
import logger from '@shared/logger';
import { toast } from 'sonner';
import Sidebar from './pages/components/sidebar';
import Downloads from './pages/Downloads';
import Settings from './pages/Settings';
import { useHistoryStore } from './stores/history-store';
import { UrlHistoryItem } from '@shared/types/history';

const App = () => {
  const [loadingFromSettings, setLoadingFromSettings] = useState(true);
  const [isYtdlpFmpegConfirmModalVisible, setIsYtdlpFfmpegConfirmModalVisible] = useState(false);
  const setSettings = useSettingsStore((state) => state.setSettings);

  useEffect(() => {
    const unsubUpdatedSettings = window.api.on(
      'settings:updated',
      (updatedSettings, showToast = true) => {
        setSettings(updatedSettings as AppSettings);
        if (showToast) {
          toast.info('Settings Updated');
        }
      }
    );

    const unsubUpdatedUrlHistory = window.api.on('url-history:updated', (updatedUrlHistory) => {
      useHistoryStore.setState({ urlHistory: (updatedUrlHistory as UrlHistoryItem[]) ?? [] });
    });

    const unsubDownloadFailed = window.api.on('yt-dlp:download-failed', (message) => {
      toast.error(message as string);
    });

    const unsubYtdlpError = window.api.on('yt-dlp:error', (message) => {
      toast.error(message as string);
    });

    const unsubDeleteAllMetadata = window.api.on('app:delete-all-metadata', () => {
      toast.info('Deleted all media metadata');
    });

    const unsubStartedYtdlpUpdate = window.api.on('yt-dlp:started-update', () => {
      toast.info('Started yt-dlp Update');
    });

    const unsubYtdlpUpdateFailed = window.api.on('yt-dlp:update-failed', () => {
      toast.info('yt-dlp Update failed');
    });

    const unsubYtdlpUpdateSuccess = window.api.on('yt-dlp:update-success', () => {
      toast.info('yt-dlp Updated');
    });

    return () => {
      unsubUpdatedSettings();
      unsubUpdatedUrlHistory();
      unsubDownloadFailed();
      unsubYtdlpError();
      unsubDeleteAllMetadata();
      unsubStartedYtdlpUpdate();
      unsubYtdlpUpdateFailed();
      unsubYtdlpUpdateSuccess();
    };
  }, []);

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
  }, []);

  const handleCloseModal = () => {
    setIsYtdlpFfmpegConfirmModalVisible(false);
  };

  if (loadingFromSettings) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Spinner className="size-4" />
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="flex h-full">
        <Sidebar />

        <section className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/display-media-info" element={<DisplayMediaInfo />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </section>
      </div>

      {isYtdlpFmpegConfirmModalVisible && (
        <YtdlpFfmpegConfirmModal
          open={isYtdlpFmpegConfirmModalVisible}
          onOpenChange={handleCloseModal}
        />
      )}

      <Toaster />
    </div>
  );
};

export default App;
