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
