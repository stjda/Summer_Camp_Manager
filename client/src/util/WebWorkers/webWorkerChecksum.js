// In your main file where you import computeChecksum
export const computeChecksum = (data) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL('./md5.worker.js', import.meta.url));
      worker.onmessage = function(e) {
        resolve(e.data);
        worker.terminate();
      };
      worker.onerror = reject;
      worker.postMessage(data);
    });
  };