export function formatDate(input: string): string {
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
