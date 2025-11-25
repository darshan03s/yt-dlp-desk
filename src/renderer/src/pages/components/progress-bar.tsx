type ProgressBarProps = {
  value: number;
  className?: string;
};

export function ProgressBar({ value, className }: ProgressBarProps) {
  return (
    <div className={`w-full bg-muted border rounded-full h-3 overflow-hidden ${className ?? ''}`}>
      <div
        className="h-full bg-primary transition-all duration-200 flex items-center justify-center"
        style={{ width: `${value}%` }}
      >
        <span className="text-primary-foreground text-[8px]">{value}%</span>
      </div>
    </div>
  );
}
