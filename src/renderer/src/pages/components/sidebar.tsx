import { buttonVariants } from '@renderer/components/ui/button';
import { cn } from '@renderer/lib/utils';
import { IconDownload, IconHome, IconSettings } from '@tabler/icons-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isDownloads = location.pathname === '/downloads';
  const isSettings = location.pathname === '/settings';

  return (
    <section className="sidebar bg-background w-12 overflow-hidden py-2 flex flex-col items-center justify-between">
      <div className="flex flex-col items-center gap-3">
        <Link
          to={'/'}
          title="Home"
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
            `${isHome ? 'bg-primary/20' : ''} hover:bg-primary/20 dark:hover:bg-primary/20`
          )}
        >
          <IconHome />
        </Link>
        <Link
          to={'/downloads'}
          title="Downloads"
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
            `${isDownloads ? 'bg-primary/20' : ''} hover:bg-primary/20 dark:hover:bg-primary/20`
          )}
        >
          <IconDownload />
        </Link>
      </div>

      <div>
        <Link
          to={'/settings'}
          title="Settings"
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon-sm' }),
            `${isSettings ? 'bg-primary/20' : ''} hover:bg-primary/20 dark:hover:bg-primary/20`
          )}
        >
          <IconSettings />
        </Link>
      </div>
    </section>
  );
};

export default Sidebar;
