// File: md5.worker.js
importScripts('https://cdnjs.cloudflare.com/ajax/libs/spark-md5/3.0.0/spark-md5.min.js');
self.addEventListener('message', function(e) {
  const data = e.data;
  const sortedData = JSON.stringify(data, Object.keys(data).sort());
  const checksum = SparkMD5.hash(sortedData);
  self.postMessage(checksum);
});




