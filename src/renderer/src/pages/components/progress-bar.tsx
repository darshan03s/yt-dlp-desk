import { DownloadStatus } from '@/shared/types/download';

type ProgressBarProps = {
  value: number;
  downloadStatus: DownloadStatus;
  className?: string;
};

export function ProgressBar({ value, downloadStatus, className }: ProgressBarProps) {
  return (
    <div className={`w-full bg-muted border rounded-full h-3 overflow-hidden ${className ?? ''}`}>
      {value === 0 && downloadStatus === 'downloading' ? (
        <div className="h-full bg-primary transition-all flex items-center justify-center animate-pulse">
          <span className="text-primary-foreground text-[8px]">Downloading...</span>
        </div>
      ) : (
        <div
          className="h-full bg-primary transition-all duration-100 flex items-center justify-center"
          style={{ width: `${value}%` }}
        >
          <span className="text-primary-foreground text-[8px]">{value > 0 ? value + '%' : ''}</span>
        </div>
      )}
    </div>
  );
}
