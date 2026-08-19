import JSZip from 'jszip';

interface ImageItemToZip {
  url?: string;
  file?: File;
  previewUrl?: string;
  existingUrl?: string;
  order: number;
}

export interface ZipDownloadProgress {
  percent: number;
  current: number;
  total: number;
  statusText: string;
}

const getImageBlob = async (item: ImageItemToZip): Promise<{ blob: Blob; ext: string }> => {
  // 1. Direct local File
  if (item.file) {
    const ext = item.file.name.slice(item.file.name.lastIndexOf('.')) || '.jpg';
    return { blob: item.file, ext };
  }

  // 2. Blob URL
  if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
    const res = await fetch(item.previewUrl);
    const blob = await res.blob();
    const ext = blob.type === 'image/png' ? '.png' : blob.type === 'image/webp' ? '.webp' : '.jpg';
    return { blob, ext };
  }

  // 3. Remote URL
  const targetUrl = item.existingUrl || item.url || item.previewUrl;
  if (!targetUrl) {
    throw new Error(`Invalid image source for page ${item.order}`);
  }

  try {
    // Try direct fetch first
    const res = await fetch(targetUrl);
    if (!res.ok) throw new Error('Direct fetch failed');
    const blob = await res.blob();
    const ext =
      blob.type === 'image/png'
        ? '.png'
        : blob.type === 'image/webp'
        ? '.webp'
        : blob.type === 'image/avif'
        ? '.avif'
        : '.jpg';
    return { blob, ext };
  } catch {
    // Fallback through backend image proxy to bypass CORS
    const proxyUrl = `/api/v1/upload/proxy-image?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) {
      throw new Error(`Failed to download image for page ${item.order}`);
    }
    const blob = await res.blob();
    const ext =
      blob.type === 'image/png'
        ? '.png'
        : blob.type === 'image/webp'
        ? '.webp'
        : blob.type === 'image/avif'
        ? '.avif'
        : '.jpg';
    return { blob, ext };
  }
};

/**
 * Downloads all chapter images in numbered sequence and packages them into a .zip file for direct client download.
 */
export const downloadChapterImagesAsZip = async (
  items: ImageItemToZip[],
  zipFilename: string = 'chapter_images.zip',
  onProgress?: (progress: ZipDownloadProgress) => void
): Promise<void> => {
  if (!items || items.length === 0) {
    throw new Error('No images available to download.');
  }

  const zip = new JSZip();
  const sortedItems = [...items].sort((a, b) => a.order - b.order);
  const total = sortedItems.length;

  for (let i = 0; i < total; i++) {
    const item = sortedItems[i];
    const current = i + 1;
    const percent = Math.round((current / total) * 90); // 0% - 90% for image fetching

    if (onProgress) {
      onProgress({
        percent,
        current,
        total,
        statusText: `Downloading page ${current} of ${total}...`,
      });
    }

    const { blob, ext } = await getImageBlob(item);
    const fileName = `${String(current).padStart(2, '0')}${ext.startsWith('.') ? ext : `.${ext}`}`;
    zip.file(fileName, blob);
  }

  if (onProgress) {
    onProgress({
      percent: 95,
      current: total,
      total,
      statusText: 'Compacting and packaging ZIP archive...',
    });
  }

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  if (onProgress) {
    onProgress({
      percent: 100,
      current: total,
      total,
      statusText: 'Download ready!',
    });
  }

  // Trigger browser download
  const downloadUrl = URL.createObjectURL(zipBlob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  setTimeout(() => {
    URL.revokeObjectURL(downloadUrl);
  }, 10000);
};
