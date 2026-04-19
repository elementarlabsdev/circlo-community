import uniqueHash from 'unique-hash';
const makeSlug = require('slugify');

export function slugify(text: string): string {
  return makeSlug(text, {
    lower: true,
    trim: true,
  }).toLowerCase();
}

export function slugifyWithHash(text: string, uniqId = ''): string {
  text = makeSlug(text, {
    lower: true,
    trim: true,
  });
  return text
    ? text +
        '-' +
        uniqueHash(text + uniqId, {
          format: 'string',
        }).toLowerCase()
    : '';
}
