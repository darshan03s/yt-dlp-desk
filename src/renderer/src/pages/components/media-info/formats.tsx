import { MediaInfoJson } from '@/shared/types/info-json';
import { SelectedFormat, useSelectedOptionsStore } from '@renderer/stores/selected-options-store';
import { acodec, formatFileSize, vcodec } from '@renderer/utils';
import { useEffect, useState } from 'react';
import AllFormatsModal from './all-formats-modal';

const Formats = ({ infoJson, loading }: { infoJson: MediaInfoJson; loading: boolean }) => {
  const [isAllFormatsModalOpen, setIsAllFormatsModalOpen] = useState(false);
  const setSelectedFormat = useSelectedOptionsStore((state) => state.setSelectedFormat);
  const selectedFormat = useSelectedOptionsStore((state) => state.selectedFormat);
  const defaultFormat: SelectedFormat = {
    vcodec: infoJson.vcodec ?? 'N/A',
    acodec: infoJson.acodec ?? 'N/A',
    ext: infoJson.ext ?? 'N/A',
    filesize_approx: infoJson.filesize_approx ?? 0,
    fps: infoJson.fps ?? 0,
    format: infoJson.format ?? 'N/A',
    format_id: infoJson.format_id ?? 'N/A',
    format_note: infoJson.format_note ?? 'N/A',
    height: infoJson.height ?? 0,
    width: infoJson.width ?? 0,
    resolution: infoJson.resolution ?? 'N/A'
  };
  useEffect(() => {
    setSelectedFormat(defaultFormat);
  }, [infoJson]);

  return (
    <>
      {loading ? (
        <div
          className={`relative border px-1 h-16 rounded-md w-full bg-secondary ${loading ? 'animate-fast' : ''}`}
        ></div>
      ) : (
        infoJson.formats && (
          <div
            onClick={() => setIsAllFormatsModalOpen(true)}
            className="selected-format relative border px-1 h-16 rounded-md w-full bg-secondary flex items-center gap-2 cursor-pointer"
          >
            <div className="selected-format-left p-1 flex items-center">
              <span className="bg-primary text-primary-foreground text-xs p-2 rounded-md">
                {selectedFormat.ext || defaultFormat.ext}
              </span>
            </div>
            <div className="selected-format-right flex flex-col">
              <span>{selectedFormat.resolution || defaultFormat.resolution}</span>
              <span className="text-[10px]">{selectedFormat.format || defaultFormat.format}</span>
              <div className="text-[10px] flex items-center gap-2">
                <span>fps: {selectedFormat.fps || defaultFormat.fps || 'N/A'}</span>
                <span>vcodec: {vcodec(selectedFormat.vcodec || defaultFormat.vcodec)}</span>
                <span>acodec: {acodec(selectedFormat.acodec || defaultFormat.acodec)}</span>
                <span>
                  Filesize≈{' '}
                  {formatFileSize(
                    selectedFormat.filesize_approx! || defaultFormat.filesize_approx!
                  ) || 'N/A'}
                </span>
              </div>
            </div>
            <span className="absolute right-0 top-0 text-[10px] bg-primary/30 px-2 py-0.5 rounded-tr-md rounded-bl-md">
              Selected Format
            </span>
          </div>
        )
      )}
      {!loading && infoJson.formats && infoJson.formats.length > 0 && (
        <AllFormatsModal
          open={isAllFormatsModalOpen}
          setOpen={setIsAllFormatsModalOpen}
          formats={infoJson.formats}
          liveFromStartFormats={infoJson.live_from_start_formats ?? []}
          defaultFormat={defaultFormat}
        />
      )}
    </>
  );
};

export default Formats;
