import { SupportedCookieBrowser, YtdlpCommandBuilder } from 'yt-dlp-command-builder';
import { YTDLP_EXE_PATH } from '..';
import Settings from '@main/settings';
import { pathExistsSync, removeEmoji } from './fsUtils';
import { Source } from '@shared/types';
import { DownloadOptions } from '@shared/types/download';
import { getInfoJsonPath } from './ytdlpUtils';

function addCookiesToCommand(builder: YtdlpCommandBuilder) {
  const settings = Settings.getInstance();

  // cookies from file
  if (settings.get('cookiesFilePath').length > 0 && settings.get('cookiesBrowser').length === 0) {
    if (pathExistsSync(settings.get('cookiesFilePath'))) {
      builder.cookies(settings.get('cookiesFilePath'));
    }
  }

  // cookies from browser
  if (settings.get('cookiesBrowser').length > 0) {
    if (settings.get('cookiesBrowserProfile').length > 0) {
      builder.cookiesFromBrowser(settings.get('cookiesBrowser') as SupportedCookieBrowser, {
        profile: settings.get('cookiesBrowserProfile')
      });
    } else {
      builder.cookiesFromBrowser(settings.get('cookiesBrowser') as SupportedCookieBrowser);
    }
  }

  return builder;
}

export function getInfoJsonCommand(url: string, source: Source, infoJsonPath: string) {
  const settings = Settings.getInstance();

  let builder = new YtdlpCommandBuilder(YTDLP_EXE_PATH)
    .jsRuntime('deno')
    .jsRuntime('node')
    .jsRuntime('quickjs', settings.get('jsRuntimePath'))
    .skipDownload()
    .writeInfoJson()
    .output(infoJsonPath.split('.info.json')[0])
    .url(url);

  builder = addCookiesToCommand(builder);

  if (source === 'youtube-playlist' || source === 'youtube-music-playlist') {
    builder.flatPlaylist();
  }

  return builder;
}

export function getLiveFromStartFormatsCommand(url: string) {
  const settings = Settings.getInstance();
  let builder = new YtdlpCommandBuilder(YTDLP_EXE_PATH)
    .jsRuntime('deno')
    .jsRuntime('node')
    .jsRuntime('quickjs', settings.get('jsRuntimePath'))
    .listFormats()
    .url(url)
    .liveFromStart();

  builder = addCookiesToCommand(builder);

  return builder;
}

export function getDownloadCommand(downloadOptions: DownloadOptions) {
  const settings = Settings.getInstance();
  const { url, source, downloadSections, extraOptions, mediaInfo, selectedFormat } =
    downloadOptions;
  const infoJsonPath = getInfoJsonPath(url, source);
  let targetDownloadFileName = `${removeEmoji(mediaInfo.fulltitle ?? mediaInfo.title, '_')} [${selectedFormat.resolution}] [${selectedFormat.format_id}]`;
  const formatId = selectedFormat.format_id!;
  let builder = new YtdlpCommandBuilder(YTDLP_EXE_PATH)
    .jsRuntime('deno')
    .jsRuntime('node')
    .jsRuntime('quickjs', settings.get('jsRuntimePath'))
    .newline()
    .ffmpegLocation(settings.get('ffmpegPath'));

  builder = addCookiesToCommand(builder);

  const hasAudio = selectedFormat.acodec && selectedFormat.acodec !== 'none';

  if (hasAudio) {
    // format already has audio
    builder.format(formatId);
  } else {
    // no audio → append bestaudio
    builder.format(formatId + '+ba');
  }

  // force-keyframes-at-cuts
  if (downloadSections.forceKeyframesAtCuts) {
    builder.forceKeyframesAtCuts();
  }

  // start + end
  if (downloadSections.startTime && downloadSections.endTime) {
    builder.downloadSections({
      start: downloadSections.startTime,
      end: downloadSections.endTime
    });
    targetDownloadFileName =
      targetDownloadFileName + `[${downloadSections.startTime} - ${downloadSections.endTime}]`;
  }

  // only start
  if (downloadSections.startTime && !downloadSections.endTime) {
    builder.downloadSections({ start: downloadSections.startTime });
    targetDownloadFileName = targetDownloadFileName + `[${downloadSections.startTime} - ]`;
  }

  // only end
  if (!downloadSections.startTime && downloadSections.endTime) {
    builder.downloadSections({ end: downloadSections.endTime });
    targetDownloadFileName = targetDownloadFileName + `[00:00:00 - ${downloadSections.endTime}]`;
  }

  if (extraOptions.embedThumbnail) {
    builder.embedThumbnail();
  }

  if (extraOptions.embedChapters) {
    builder.embedChapters();
  }

  if (extraOptions.embedSubs) {
    builder.embedSubs();
  }

  if (extraOptions.embedMetadata) {
    builder.embedMetadata();
  }

  if (extraOptions.writeDescription) {
    builder.writeDescription();
  }

  if (extraOptions.writeComments) {
    builder.writeComments();
  }

  if (extraOptions.writeThumbnail) {
    builder.writeThumbnail();
  }

  if (extraOptions.writeSubs) {
    builder.writeSubs();
  }

  if (extraOptions.writeAutoSubs) {
    builder.writeAutoSubs();
  }

  if (extraOptions.liveFromStart) {
    builder.liveFromStart();
  }

  builder.noQuiet().progress().print('filepath', 'after_move');

  if (extraOptions.liveFromStart) {
    builder.url(url);
  } else {
    builder.loadInfoJson(infoJsonPath);
  }

  return { builder, targetDownloadFileName };
}
