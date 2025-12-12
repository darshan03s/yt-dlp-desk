export function formatDate(input: string): string {
  if (input.length === 0) return '';
  const year = input.slice(0, 4);
  const monthNum = Number(input.slice(4, 6));
  const day = input.slice(6, 8);

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];

  const month = months[monthNum - 1];
  return `${year} ${month} ${day}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return '';
  }

  if (bytes < 0 || Number.isNaN(bytes)) {
    throw new Error('Invalid file size');
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let index = 0;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index++;
  }

  return `${value.toFixed(2)} ${units[index]}`;
}

export function vcodec(codec: string | undefined): string {
  if (codec === undefined) {
    return '';
  }
  if (codec.includes('av01')) {
    return 'av01';
  }
  if (codec.includes('avc1')) {
    return 'avc1';
  }
  if (codec.includes('vp09')) {
    return 'vp09';
  }
  return codec || '';
}

export function acodec(codec: string | undefined): string {
  if (codec === undefined) {
    return '';
  }
  if (codec.includes('m4a')) {
    return 'm4a';
  }
  if (codec.includes('mp4a')) {
    return 'mp4a';
  }
  return codec || '';
}

export function secondsToHMS(totalSeconds: number): string {
  if (typeof totalSeconds !== 'number' || Number.isNaN(totalSeconds) || totalSeconds < 0) {
    throw new Error('Input must be a non-negative number');
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');

  return `${hh}:${mm}:${ss}`;
}
