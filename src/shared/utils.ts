export function getYouTubeVideoId(url: string): string | null {
  let videoId: string | null = null;
  try {
    const parsed = new URL(url);
    // shortened url
    if (parsed.hostname === 'youtu.be') {
      videoId = parsed.pathname.slice(1);
    }
    if (parsed.hostname === 'www.youtube.com' || parsed.hostname === 'youtube.com') {
      // url with watch?v
      if (parsed.pathname.includes('watch')) videoId = parsed.searchParams.get('v');
      // shorts and embed url
      if (parsed.pathname.includes('shorts') || parsed.pathname.includes('embed'))
        videoId = parsed.pathname.split('/')[2];
    }
    return videoId;
  } catch {
    return null;
  }
}

export function getYoutubePlaylistId(url: string): string | null {
  let playlistId: string | null = null;
  try {
    const parsed = new URL(url);
    playlistId = parsed.searchParams.get('list');
    return playlistId;
  } catch {
    return null;
  }
}
