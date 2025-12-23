import { Button } from '@renderer/components/ui/button';
import { Input } from '@renderer/components/ui/input';
import { useSelectedOptionsStore } from '@renderer/stores/selected-options-store';
import { useSettingsStore } from '@renderer/stores/settings-store';
import { IconFolder } from '@tabler/icons-react';
import { useEffect } from 'react';

const DownloadLocation = ({ loading }: { loading: boolean }) => {
  const downloadsFolderFromSettings = useSettingsStore((state) => state.settings.downloadsFolder);
  const selectedDownloadFolder = useSelectedOptionsStore((state) => state.selectedDownloadFolder);

  useEffect(() => {
    useSelectedOptionsStore.setState({ selectedDownloadFolder: downloadsFolderFromSettings });
  }, []);

  async function pickFolder() {
    const path = await window.api.selectFolder();
    if (path) {
      useSelectedOptionsStore.setState({ selectedDownloadFolder: path });
    }
  }

  return (
    <div className="flex items-center gap-2 font-satoshi">
      <Input disabled type="text" className="text-xs h-8" value={selectedDownloadFolder} />
      <Button
        variant={'outline'}
        onClick={pickFolder}
        disabled={loading}
        title="Select download folder"
        size={'icon-sm'}
      >
        <IconFolder />
      </Button>
    </div>
  );
};

export default DownloadLocation;
