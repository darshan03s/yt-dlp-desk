import { ChildProcess, spawn } from 'node:child_process';
import { NewDownloadHistoryItem } from './types/db';
import { downloadHistoryOperations } from './utils/dbUtils';
import { mainWindow } from '.';
import { ProgressDetails } from '@shared/types/download';
import { getFileExtension } from './utils/fsUtils';

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

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');

    child.stdout.on('data', (data) => {
      const text = data.toString();
      const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
      for (const line of lines) {
        console.log(`[${child.pid}] stdout: ${line}`);
        downloadingItem.download_progress_string = line;
        downloadingItem.download_progress =
          getProgressPercent(line) ?? downloadingItem.download_progress;
        downloadingItem.complete_output += `\n${line}`;
        mainWindow.webContents.send(`download-progress:${newDownload.id}`, {
          progressString: line,
          progressPercentage: getProgressPercent(line) ?? downloadingItem.download_progress
        } as ProgressDetails);
      }
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
      for (const line of lines) {
        console.log(`[${child.pid}] stderr: ${line}`);
        downloadingItem.download_progress_string = line;
        downloadingItem.complete_output += `\n${line}`;
        mainWindow.webContents.send(`download-progress:${newDownload.id}`, {
          progressString: line
        } as ProgressDetails);
        if (line.includes('ERROR')) {
          mainWindow.webContents.send('yt-dlp:error', line);
        }
      }
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
        const ext = getFileExtension(filepath);
        downloadingItem.download_path = downloadingItem.download_path + `.${ext}`;
      } else {
        if (downloadingItem.download_status === 'paused') {
          downloadingItem.download_completed_at = new Date().toISOString();
          downloadingItem.download_progress_string = 'Download Paused';
          // downloadingItem.download_path = '';
          downloadingItem.complete_output += '\nDownload Paused';
        } else {
          downloadingItem.download_status = 'failed';
          downloadingItem.download_completed_at = new Date().toISOString();
          downloadingItem.download_progress_string = 'Download Failed';
          // downloadingItem.download_path = '';
          downloadingItem.complete_output += '\nDownload Failed';
          mainWindow.webContents.send(
            'yt-dlp:download-failed',
            `Download failed for ${downloadingItem.title}`
          );
        }
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
