import { compressImageInBrowser } from "./client-compressor";

export interface UploadProgressInfo {
  percent: number;
  statusText: string;
  stage: "optimizing" | "uploading" | "processing" | "complete";
}

export function uploadFileWithProgress(
  file: File,
  onProgress: (info: UploadProgressInfo) => void
): Promise<{ success: boolean; url: string; filename?: string; error?: string }> {
  return new Promise(async (resolve) => {
    try {
      // Stage 1: Browser-side optimization/validation (0% -> 15%)
      onProgress({ percent: 5, statusText: "Preparing file...", stage: "optimizing" });
      
      const finalFile = await compressImageInBrowser(file);
      onProgress({ percent: 15, statusText: "Starting upload...", stage: "uploading" });

      const formData = new FormData();
      formData.append("file", finalFile);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/admin/upload", true);
      xhr.setRequestHeader("X-Filename", encodeURIComponent(finalFile.name));

      // Track byte upload progress (15% -> 85%)
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const rawPercent = event.loaded / event.total;
          const scaledPercent = Math.round(15 + rawPercent * 70);
          const uploadedMB = (event.loaded / (1024 * 1024)).toFixed(1);
          const totalMB = (event.total / (1024 * 1024)).toFixed(1);

          if (scaledPercent >= 84) {
            onProgress({ percent: 88, statusText: "Server processing & finalizing...", stage: "processing" });
          } else {
            onProgress({
              percent: scaledPercent,
              statusText: `Uploading ${uploadedMB}MB of ${totalMB}MB (${scaledPercent}%)...`,
              stage: "uploading",
            });
          }
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data?.success) {
              onProgress({ percent: 100, statusText: "Upload complete!", stage: "complete" });
              resolve({ success: true, url: data.url, filename: data.filename });
            } else {
              resolve({ success: false, url: "", error: data?.error || "Upload failed" });
            }
          } catch {
            resolve({ success: false, url: "", error: "Invalid server response" });
          }
        } else {
          let errorMsg = `Server Error (${xhr.status})`;
          try {
            const errData = JSON.parse(xhr.responseText);
            if (errData?.error) errorMsg = errData.error;
          } catch {}
          resolve({ success: false, url: "", error: errorMsg });
        }
      };

      xhr.onerror = () => {
        resolve({ success: false, url: "", error: "Network error during upload" });
      };

      xhr.ontimeout = () => {
        resolve({ success: false, url: "", error: "Upload timed out" });
      };

      xhr.send(formData);
    } catch (err: any) {
      resolve({ success: false, url: "", error: err?.message || "Upload failed" });
    }
  });
}
