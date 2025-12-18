import { Source } from '@shared/types';
import { ExtraOptions as ExtraOptionsType } from '@/shared/types/download';
import { MediaInfoJson } from '@/shared/types/info-json';
import { Toggle } from '@renderer/components/ui/toggle';
import { useMediaInfoStore } from '@renderer/stores/media-info-store';
import { useSelectedOptionsStore } from '@renderer/stores/selected-options-store';
import {
  IconArrowBackUp,
  IconBadgeCc,
  IconFileDescription,
  IconFileStack,
  IconMessage,
  IconPhotoEdit,
  IconPhotoVideo,
  IconSection
} from '@tabler/icons-react';
import { Captions, FilePen } from 'lucide-react';
import { useEffect } from 'react';

const ExtraOptions = () => {
  const extraOptions = useSelectedOptionsStore((state) => state.extraOptions);
  const setExtraOptions = useSelectedOptionsStore((state) => state.setExtraOptions);
  const resetExtraOptions = useSelectedOptionsStore((state) => state.resetExtraOptions);
  const infoJson = useMediaInfoStore((state) => state.mediaInfo) as MediaInfoJson;
  const source = useMediaInfoStore((state) => state.source) as Source;

  useEffect(() => {
    resetExtraOptions();
  }, []);

  function handleOptionToggle(option: keyof ExtraOptionsType, pressed: boolean) {
    setExtraOptions({ [option]: pressed });
  }

  const EmbedThumbnail = () => {
    return (
      <Toggle
        title="Embed thumbnail"
        pressed={extraOptions.embedThumbnail}
        onPressedChange={(pressed) => handleOptionToggle('embedThumbnail', pressed)}
        size="sm"
        variant="outline"
        className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:stroke-primary data-[state=on]:*:[span]:text-primary text-xs"
      >
        <IconPhotoVideo /> <span>Embed Thumbnail</span>
      </Toggle>
    );
  };

  const EmbedChapters = () => {
    return (
      <Toggle
        title="Embed chapters"
        pressed={extraOptions.embedChapters}
        onPressedChange={(pressed) => handleOptionToggle('embedChapters', pressed)}
        size="sm"
        variant="outline"
        className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:stroke-primary data-[state=on]:*:[span]:text-primary text-xs"
      >
        <IconSection /> <span>Embed Chapters</span>
      </Toggle>
    );
  };

  const EmbedSubs = () => {
    return (
      <Toggle
        title="Embed Subtitle"
        pressed={extraOptions.embedSubs}
        onPressedChange={(pressed) => handleOptionToggle('embedSubs', pressed)}
        size="sm"
        variant="outline"
        className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:stroke-primary data-[state=on]:*:[span]:text-primary text-xs"
      >
        <IconBadgeCc /> <span>Embed Subs</span>
      </Toggle>
    );
  };

  const EmbedMetadata = () => {
    return (
      <Toggle
        title="Embed Metadata"
        pressed={extraOptions.embedMetadata}
        onPressedChange={(pressed) => handleOptionToggle('embedMetadata', pressed)}
        size="sm"
        variant="outline"
        className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:stroke-primary data-[state=on]:*:[span]:text-primary text-xs"
      >
        <IconFileStack /> <span>Embed Metadata</span>
      </Toggle>
    );
  };

  const WriteDescription = () => {
    return (
      <Toggle
        title="Write Description"
        pressed={extraOptions.writeDescription}
        onPressedChange={(pressed) => handleOptionToggle('writeDescription', pressed)}
        size="sm"
        variant="outline"
        className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:stroke-primary data-[state=on]:*:[span]:text-primary text-xs"
      >
        <IconFileDescription /> <span>Write Description</span>
      </Toggle>
    );
  };

  const WriteComments = () => {
    return (
      <Toggle
        title="Write Comments"
        pressed={extraOptions.writeComments}
        onPressedChange={(pressed) => handleOptionToggle('writeComments', pressed)}
        size="sm"
        variant="outline"
        className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:stroke-primary data-[state=on]:*:[span]:text-primary text-xs"
      >
        <IconMessage /> <span>Write Comments</span>
      </Toggle>
    );
  };

  const WriteThumbnail = () => {
    return (
      <Toggle
        title="Write Thumbnail"
        pressed={extraOptions.writeThumbnail}
        onPressedChange={(pressed) => handleOptionToggle('writeThumbnail', pressed)}
        size="sm"
        variant="outline"
        className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:stroke-primary data-[state=on]:*:[span]:text-primary text-xs"
      >
        <IconPhotoEdit /> <span>Write Thumbnail</span>
      </Toggle>
    );
  };

  const WriteSubs = () => {
    return (
      <Toggle
        title="Write Subtitle"
        pressed={extraOptions.writeSubs}
        onPressedChange={(pressed) => handleOptionToggle('writeSubs', pressed)}
        size="sm"
        variant="outline"
        className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:stroke-primary data-[state=on]:*:[span]:text-primary text-xs"
      >
        <FilePen /> <span>Write Subs</span>
      </Toggle>
    );
  };

  const WriteAutoSubs = () => {
    return (
      <Toggle
        title="Write Auto Subtitle"
        pressed={extraOptions.writeAutoSubs}
        onPressedChange={(pressed) => handleOptionToggle('writeAutoSubs', pressed)}
        size="sm"
        variant="outline"
        className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:stroke-primary data-[state=on]:*:[span]:text-primary text-xs"
      >
        <Captions /> <span>Write Auto Subs</span>
      </Toggle>
    );
  };

  const LiveFromStart = () => {
    return (
      <Toggle
        title="Download live from start"
        pressed={extraOptions.liveFromStart}
        onPressedChange={(pressed) => handleOptionToggle('liveFromStart', pressed)}
        size="sm"
        variant="outline"
        className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:stroke-primary data-[state=on]:*:[span]:text-primary text-xs"
      >
        <IconArrowBackUp /> <span>Live from start</span>
      </Toggle>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {infoJson.is_live && source === 'youtube-video' && (
        <div>
          <h1 className="text-xs border-border border-b mb-2 pb-1">Live options</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <LiveFromStart />
          </div>
        </div>
      )}
      <div>
        <h1 className="text-xs border-border border-b mb-2 pb-1">Embed options</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <EmbedThumbnail />
          <EmbedChapters />
          <EmbedSubs />
          <EmbedMetadata />
        </div>
      </div>
      <div className="">
        <h1 className="text-xs border-border border-b mb-2 pb-1">Write options</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <WriteDescription />
          <WriteComments />
          <WriteThumbnail />
          <WriteSubs />
          <WriteAutoSubs />
        </div>
      </div>
    </div>
  );
};

export default ExtraOptions;
