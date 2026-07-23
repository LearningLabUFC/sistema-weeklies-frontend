export function formatName(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (['de', 'da', 'do', 'das', 'dos', 'e'].includes(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}
