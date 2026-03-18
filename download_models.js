import fs from 'fs';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

async function download(url, dest) {
  console.log(`Downloading ${url} -> ${dest}`);
  const res = await fetch(url);
  
  if (!res.ok) {
    throw new Error(`Unexpected response ${res.statusText}`);
  }
  
  const fileStream = fs.createWriteStream(dest, { flags: 'wx' });
  await finished(Readable.fromWeb(res.body).pipe(fileStream));
}

async function main() {
  try {
    if (fs.existsSync('./public/yolov8n.onnx')) fs.unlinkSync('./public/yolov8n.onnx');
    if (fs.existsSync('./public/mobilefacenet.onnx')) fs.unlinkSync('./public/mobilefacenet.onnx');

    // Using float32 yolov8n model - matches the Float32Array preprocessing in onnxModel.ts
    const YOLO_URL = "https://huggingface.co/flightsnotights/yolov8n_onnx/resolve/main/yolov8n.onnx";
    const REID_URL = "https://huggingface.co/opencv/facial_expression_recognition/resolve/main/facial_expression_recognition_mobilefacenet_2022july.onnx"; 

    await download(YOLO_URL, "./public/yolov8n.onnx");
    await download(REID_URL, "./public/mobilefacenet.onnx");
    console.log("✅ Downloads complete!");
  } catch (err) {
    console.error("❌ Error downloading models:", err.message || err);
  }
}

main();
