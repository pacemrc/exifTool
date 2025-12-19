import { exittoolConfig } from '../core/config.js';
import { getApiBaseUrl } from '../core/appConfig.js';

export async function browseDirectory(directoryPath) {
  const response = await fetch(`${getApiBaseUrl()}/file-system/browse?directoryPath=${encodeURIComponent(directoryPath)}`);
  return response.json();
}

export async function preCountFiles(path) {
  try {
    const pre = await browseDirectory(path);
    if (pre && pre.success && Array.isArray(pre.data)) {
      const filesOnly = pre.data.filter(i => !i.isDirectory);
      return filesOnly.length > 0 ? filesOnly.length : 1;
    }
  } catch (_) {}
  return 1;
}

export async function queryPath(path) {
  const response = await fetch(`${getApiBaseUrl()}/exif/query-path`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-ExifTool-Path': exittoolConfig.path || ''
    },
    body: JSON.stringify({ path })
  });
  return response.json();
}
