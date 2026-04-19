import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';

export interface MediaMetadata {
  width?: number;
  height?: number;
  orientation?: 'portrait' | 'landscape' | 'square';
  aspectRatio?: number;
  duration?: number;
  [key: string]: any;
}

function calculateExtraMetadata(width?: number, height?: number) {
  if (!width || !height) {
    return {};
  }
  const aspectRatio = width / height;
  let orientation: 'portrait' | 'landscape' | 'square' = 'square';
  if (aspectRatio > 1) {
    orientation = 'landscape';
  } else if (aspectRatio < 1) {
    orientation = 'portrait';
  }
  return {
    aspectRatio,
    orientation,
  };
}

export async function getMediaMetadata(
  buffer: Buffer,
  mimeType: string,
): Promise<MediaMetadata | null> {
  if (mimeType.startsWith('image/')) {
    try {
      const metadata = await sharp(buffer).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        ...calculateExtraMetadata(metadata.width, metadata.height),
      };
    } catch (e) {
      console.error('Error getting image metadata', e);
      return null;
    }
  }

  if (mimeType.startsWith('video/')) {
    return new Promise((resolve) => {
      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);

      ffmpeg(stream).ffprobe((err, data) => {
        if (err) {
          console.error('Error getting video metadata', err);
          return resolve(null);
        }

        const videoStream = data.streams.find((s) => s.codec_type === 'video');
        const width = videoStream?.width;
        const height = videoStream?.height;

        resolve({
          width,
          height,
          duration: data.format.duration,
          ...calculateExtraMetadata(width, height),
        });
      });
    });
  }

  return null;
}
