import { ChildProcess, spawn } from 'node:child_process';
import { NewDownloadsHistoryItem } from './types/db';
import { downloadsHistoryOperations } from './utils/dbUtils';
import { mainWindow } from '.';
import { ProgressDetails } from '@shared/types/download';

type RunningDownload = {
  downloadingItem: NewDownloadsHistoryItem;
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
    newDownload: NewDownloadsHistoryItem,
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

    child.stdout.on('data', (data) => {
      const text = data.toString();
      console.log(`stdout: ${text}`);
      downloadingItem.download_progress_string = text;
      downloadingItem.download_progress =
        getProgressPercent(text) ?? downloadingItem.download_progress;
      mainWindow.webContents.send(`download-progress:${newDownload.id}`, {
        progressString: text,
        progressPercentage: getProgressPercent(text) ?? downloadingItem.download_progress
      } as ProgressDetails);
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      console.log(`stderr: ${text}`);
      downloadingItem.download_progress_string = text;
      mainWindow.webContents.send(`download-progress:${newDownload.id}`, {
        progressString: text
      } as ProgressDetails);
    });

    child.on('close', (code) => {
      if (code === 0) {
        downloadingItem.download_status = 'completed';
        downloadingItem.download_completed_at = new Date().toISOString();
        downloadingItem.download_progress_string = 'Download Completed';
        downloadingItem.download_progress = 100;
      } else {
        downloadingItem.download_status = 'failed';
        downloadingItem.download_completed_at = 'Not Completed';
        downloadingItem.download_progress_string = 'Download Failed';
      }
      downloadsHistoryOperations.addNew(downloadingItem);
      this.currentlyRunningDownloads = this.currentlyRunningDownloads.filter(
        (d) => d.downloadingItem.id != downloadingItem.id
      );
      mainWindow.webContents.send('refresh-downloads');
    });

    this.currentlyRunningDownloads.unshift(runningDownload);
    mainWindow.webContents.send('download-begin');
  }
}
