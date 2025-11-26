type ProgressBarProps = {
  value: number;
  className?: string;
};

export function ProgressBar({ value, className }: ProgressBarProps) {
  return (
    <div className={`w-full bg-muted border rounded-full h-3 overflow-hidden ${className ?? ''}`}>
      {value === 0 ? (
        <div className="h-full bg-primary transition-all flex items-center justify-center animate-pulse">
          <span className="text-primary-foreground text-[8px]">Downloading...</span>
        </div>
      ) : (
        <div
          className="h-full bg-primary transition-all duration-100 flex items-center justify-center"
          style={{ width: `${value}%` }}
        >
          <span className="text-primary-foreground text-[8px]">{value}%</span>
        </div>
      )}
    </div>
  );
}
