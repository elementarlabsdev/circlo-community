import uniqueHash from 'unique-hash';

export function generateFallbackEmail(id: string, domain: string): string {
  const hash = uniqueHash(id, {
    format: 'string',
  }).toLowerCase();

  return `${hash}@${domain}`;
}
