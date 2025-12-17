import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { cn } from '@renderer/lib/utils';

interface TooltipWrapper {
  children: React.ReactNode;
  message: string;
  side?: 'top' | 'right' | 'bottom' | 'left' | undefined;
  className?: string;
}

export const TooltipWrapper = ({ message, children, side, className }: TooltipWrapper) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild className="flex items-center">
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} className={cn('', className)}>
        {message}
      </TooltipContent>
    </Tooltip>
  );
};

interface AnchorProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const Anchor = ({ href, className, children }: AnchorProps) => {
  return (
    <a href={href} target="__blank" rel="noreferrer" className={cn('underline', className)}>
      {children}
    </a>
  );
};
