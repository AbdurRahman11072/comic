import JSZip from 'jszip';

const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'];

const getMimeType = (filename: string): string => {
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.avif':
      return 'image/avif';
    case '.gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
};

/**
 * Natural numerical string comparison.
 * Ensures "1.jpg", "2.jpg", "10.jpg" are sorted in true mathematical order
 * instead of alphabetical order ("1.jpg", "10.jpg", "2.jpg").
 */
export const naturalNumericalSort = (a: string, b: string): number => {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
};

export interface ZipExtractionProgress {
  current: number;
  total: number;
  percent: number;
  currentFileName: string;
}

/**
 * Extracts and sorts images from a .zip or .cbz file in natural numerical order.
 * 
 * @param zipFile - The .zip or .cbz File object from input
 * @param onProgress - Optional callback with real-time extraction progress and percentage
 * @returns Array of standard File objects sorted in sequential order
 */
export const extractImagesFromZip = async (
  zipFile: File,
  onProgress?: (progress: ZipExtractionProgress) => void
): Promise<File[]> => {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(zipFile);

  // 1. Identify all valid image entries (ignoring OS metadata, hidden files, and directories)
  const imageEntries: Array<{ name: string; zipObject: JSZip.JSZipObject }> = [];

  loadedZip.forEach((relativePath, zipObject) => {
    if (zipObject.dir) return;

    const baseName = relativePath.split('/').pop() || '';
    
    // Ignore macOS resource forks, hidden files, and Windows thumbnails
    if (
      relativePath.includes('__MACOSX') ||
      baseName.startsWith('.') ||
      baseName.toLowerCase() === 'thumbs.db'
    ) {
      return;
    }

    const ext = baseName.slice(baseName.lastIndexOf('.')).toLowerCase();
    if (ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
      imageEntries.push({ name: relativePath, zipObject });
    }
  });

  if (imageEntries.length === 0) {
    throw new Error('No valid image files (.jpg, .png, .webp, .avif, .gif) found inside the ZIP archive.');
  }

  // 2. Sort image entries naturally by their relative file path / name
  imageEntries.sort((a, b) => naturalNumericalSort(a.name, b.name));

  const total = imageEntries.length;
  const extractedFiles: File[] = [];

  // 3. Extract each image sequentially with real-time percentage progress
  for (let i = 0; i < total; i++) {
    const entry = imageEntries[i];
    const current = i + 1;
    const percent = Math.round((current / total) * 100);

    if (onProgress) {
      onProgress({
        current,
        total,
        percent,
        currentFileName: entry.name.split('/').pop() || entry.name,
      });
    }

    const blob = await entry.zipObject.async('blob');
    const mimeType = getMimeType(entry.name);
    const fileName = entry.name.split('/').pop() || `page_${current}.jpg`;

    const file = new File([blob], fileName, { type: mimeType });
    extractedFiles.push(file);
  }

  return extractedFiles;
};
