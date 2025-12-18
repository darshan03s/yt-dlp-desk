export type LiveFromStartFormats = {
  format_id: string;
  format: string;
  ext: string;
  resolution: string;
  fps: number;
  vcodec: string;
  acodec: string;
};

interface Extra {
  created_at: string;
  expires_at?: string;
  thumbnail_local?: string;
  live_from_start_formats: LiveFromStartFormats[];
  modified_date: string;
  playlist_count: number;
  view_count: number;
  album: string;
  artist: string;
  artists: string[];
  creator: string;
  track: string;
  release_year: number;
  alt_title: string;
  repost_count: number;
  concurrent_view_count: number;
  dislike_count: number;
}

export interface MediaInfoJson extends Extra {
  id: string;
  title: string;
  formats: MediaFormat[];
  thumbnails: MediaThumbnail[];
  thumbnail: string;
  description: string;
  channel_id: string;
  channel_url: string;
  duration: number;
  view_count: number;
  age_limit: number;
  webpage_url: string;
  categories: string[];
  tags: string[];
  playable_in_embed: boolean;
  live_status: 'not_live' | 'live' | 'was_live' | string;
  media_type: 'video' | 'audio' | string;
  automatic_captions: MediaAutomaticCaptions;
  subtitles: MediaSubtitles;
  comment_count: number;
  like_count: number;
  channel: string;
  channel_follower_count: number;
  channel_is_verified: boolean;
  uploader: string;
  uploader_id: string;
  uploader_url: string;
  upload_date: string;
  timestamp: number;
  availability: 'public' | 'private' | 'unlisted' | string;
  webpage_url_basename: string;
  webpage_url_domain: string;
  extractor: string;
  extractor_key: string;
  display_id: string;
  fulltitle: string;
  duration_string: string;
  is_live: boolean;
  was_live: boolean;
  epoch: number;
  format: string;
  format_id: string;
  ext: string;
  protocol: string;
  language: string;
  format_note: string;
  filesize_approx: number;
  tbr: number;
  width: number;
  height: number;
  resolution: string;
  fps: number;
  dynamic_range: string;
  vcodec: string;
  vbr: number;
  aspect_ratio: number;
  acodec: string;
  abr: number;
  asr: number;
  audio_channels: number;
  chapters: MediaChapter[];
}

export interface MediaFormat {
  format: string;
  format_id: string;
  format_note: string;
  ext: string;
  acodec: string;
  vcodec: string;
  url: string;
  manifest_url: string;
  width: number;
  height: number;
  resolution: string;
  aspect_ratio: number;
  fps: number;
  vbr: number;
  abr: number;
  audio_ext: string;
  video_ext: string;
  asr: number;
  filesize: number;
  audio_channels: number;
  tbr: number;
  filesize_approx: number;
  has_drm: boolean;
  language: string;
  container: string;
  available_at: number;
  protocol: string;
}

export interface MediaThumbnail {
  id: string;
  url: string;
  width: number;
  height: number;
  resolution: string;
}

export interface MediaAutomaticCaption {
  ext: string;
  url: string;
  name: string;
}

export interface MediaSubtitle {
  ext: string;
  url: string;
  name: string;
}

export interface MediaAutomaticCaptions {
  [key: string]: MediaAutomaticCaption[];
}

export interface MediaSubtitles {
  [key: string]: MediaSubtitle[];
}

export interface MediaChapter {
  start_time: number;
  title: string;
  end_time: number;
}
