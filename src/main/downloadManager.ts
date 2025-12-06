import { ChildProcess, spawn } from 'node:child_process';
import { NewDownloadHistoryItem } from './types/db';
import { downloadHistoryOperations } from './utils/dbUtils';
import { mainWindow } from '.';
import { ProgressDetails } from '@shared/types/download';

type RunningDownload = {
  downloadingItem: NewDownloadHistoryItem;
  downloadProcess: ChildProcess;
};

export class DownloadManager {
  private static instance: DownloadManager | null = null;
  currentlyRunningDownloads: RunningDownload[];

  private constructor() {
    this.currentlyRunningDownloads = [];
  }

  static getInstance() {
    if (DownloadManager.instance === null) {
      throw Error('Initialize the download manager first');
    }
    return DownloadManager.instance;
  }

  static initDownloadManager() {
    DownloadManager.instance = new DownloadManager();
  }

  addDownload(
    newDownload: NewDownloadHistoryItem,
    downloadCommandBase: string,
    downloadCommandArgs: string[]
  ) {
    function getProgressPercent(text) {
      const match = text.match(/(\d+(?:\.\d+)?)%/);
      if (!match) return null;

      return parseFloat(match[1]);
    }

    const child = spawn(downloadCommandBase, downloadCommandArgs);

    const runningDownload: RunningDownload = {
      downloadingItem: newDownload,
      downloadProcess: child
    };

    const { downloadingItem } = runningDownload;

    downloadingItem.download_progress_string = 'Downloading...';
    downloadingItem.download_progress = 0;

    child.stdout.on('data', (data) => {
      const text = data.toString();
      console.log(`[${child.pid}] stdout: ${text}`);
      downloadingItem.download_progress_string = text;
      downloadingItem.download_progress =
        getProgressPercent(text) ?? downloadingItem.download_progress;
      downloadingItem.complete_output += text;
      mainWindow.webContents.send(`download-progress:${newDownload.id}`, {
        progressString: text,
        progressPercentage: getProgressPercent(text) ?? downloadingItem.download_progress
      } as ProgressDetails);
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      console.log(`[${child.pid}] stderr: ${text}`);
      downloadingItem.download_progress_string = text;
      downloadingItem.complete_output += text;
      mainWindow.webContents.send(`download-progress:${newDownload.id}`, {
        progressString: text
      } as ProgressDetails);
    });

    child.on('close', (code, signal) => {
      console.log('Exit -> ', { code, signal });
      if (code === 0) {
        downloadingItem.download_status = 'completed';
        downloadingItem.download_completed_at = new Date().toISOString();
        downloadingItem.download_progress_string = 'Download Completed';
        downloadingItem.download_progress = 100;
        const lines = downloadingItem.complete_output
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);

        const filepath = lines.at(-1);
        downloadingItem.download_path = filepath ?? '';
      } else {
        downloadingItem.download_status = 'failed';
        downloadingItem.download_completed_at = 'Not Completed';
        downloadingItem.download_progress_string = 'Download Failed';
        downloadingItem.download_path = '';
        mainWindow.webContents.send(
          'yt-dlp:download-failed',
          `Download failed for ${downloadingItem.title}`
        );
      }
      downloadingItem.complete_output += '\nProcess complete';
      downloadHistoryOperations.addNew(downloadingItem);
      this.currentlyRunningDownloads = this.currentlyRunningDownloads.filter(
        (d) => d.downloadingItem.id != downloadingItem.id
      );
      mainWindow.webContents.send('refresh-downloads');
    });

    this.currentlyRunningDownloads.unshift(runningDownload);
    mainWindow.webContents.send('download-begin');
  }
}
