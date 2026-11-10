import { request } from '@/service/request';
import { blobValidate } from './ruoyi';

/** Save a blob as a local file. */
export function saveBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement('a');

  link.style.display = 'none';
  link.href = url;
  link.setAttribute('download', fileName);

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/** Read an error json out of a blob response. */
async function getBlobErrorMsg(blob: Blob) {
  try {
    const text = await blob.text();
    const result = JSON.parse(text);

    return result.msg || result.message || '下载文件出现错误，请联系管理员！';
  } catch {
    return '下载文件出现错误，请联系管理员！';
  }
}

/**
 * Download a file from the backend (e.g. `/system/user/export`, `/system/user/importTemplate`).
 *
 * @param url the backend url
 * @param params the form params
 * @param fileName the local file name
 */
export async function download(url: string, params: Record<string, any> = {}, fileName = 'download') {
  const { data, error } = await request<Blob, 'blob'>({
    url,
    method: 'post',
    data: new URLSearchParams(
      Object.entries(params).reduce<Record<string, string>>((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          acc[key] = String(value);
        }

        return acc;
      }, {})
    ),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    responseType: 'blob'
  });

  if (error || !data) {
    return;
  }

  if (blobValidate(data)) {
    saveBlob(data, fileName);

    return;
  }

  window.$message?.error(await getBlobErrorMsg(data));
}

/** Download a ruoyi OSS file by ossId. */
export async function downloadOss(ossId: string | number) {
  const { data, error } = await request<Blob, 'blob'>({
    url: `/resource/oss/download/${ossId}`,
    method: 'get',
    responseType: 'blob'
  });

  if (error || !data) {
    return;
  }

  if (blobValidate(data)) {
    saveBlob(data, `oss-${ossId}`);
  }
}
