export function slugify(source: string, maxLen = 120): string {
  if (!source) return '';
  let s = source
    .toLowerCase()
    .normalize('NFKD')
    // Remove diacritics marks
    .replace(/\p{Diacritic}+/gu, '')
    // Replace non-letter/number with dash
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    // Collapse dashes
    .replace(/-+/g, '-')
    // Trim dashes
    .replace(/^-|-$/g, '');
  if (s.length > maxLen) s = s.slice(0, maxLen).replace(/-+$/g, '');
  return s;
}

export function randomSuffix(len = 6): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < len; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}
