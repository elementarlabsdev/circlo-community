export enum FileCategory {
  Image = 'image',
  Archive = 'archive',
  PDF = 'pdf',
  Document = 'document',
  Spreadsheet = 'spreadsheet',
  Presentation = 'presentation',
  Audio = 'audio',
  Video = 'video',
  Text = 'text',
  Code = 'code_markup',
  Other = 'other',
}

const mimeTypeMapping: Map<FileCategory, (string | RegExp)[]> = new Map([
  [FileCategory.Image, [/^image\//]],
  [FileCategory.Audio, [/^audio\//]],
  [FileCategory.Video, [/^video\//]],
  [FileCategory.PDF, ['application/pdf']],
  [
    FileCategory.Archive,
    [
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'application/x-tar',
      'application/gzip',
    ],
  ],
  [
    FileCategory.Document,
    [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.oasis.opendocument.text',
    ],
  ],
  [
    FileCategory.Spreadsheet,
    [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.oasis.opendocument.spreadsheet',
      'text/csv',
    ],
  ],
  [
    FileCategory.Presentation,
    [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.oasis.opendocument.presentation',
    ],
  ],
  [FileCategory.Text, ['text/plain']],
  [
    FileCategory.Code,
    [
      'text/html',
      'text/css',
      'application/json',
      'application/javascript',
      'application/xml',
      'text/xml',
    ],
  ],
]);

export function getFileCategoryByMimeType(mimeType: string): FileCategory {
  if (!mimeType) {
    return FileCategory.Other;
  }

  const lowercasedMimeType = mimeType.toLowerCase();

  for (const [category, patterns] of mimeTypeMapping.entries()) {
    for (const pattern of patterns) {
      if (typeof pattern === 'string' && pattern === lowercasedMimeType) {
        return category;
      }
      if (pattern instanceof RegExp && pattern.test(lowercasedMimeType)) {
        return category;
      }
    }
  }

  return FileCategory.Other;
}
