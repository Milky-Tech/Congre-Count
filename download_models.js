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

    await download("https://github.com/ibaiGorordo/ONNX-YOLOv8-Object-Detection/raw/main/models/yolov8n.onnx", "./public/yolov8n.onnx");
    await download("https://github.com/onnx/models/raw/main/vision/body_analysis/arcface/model/arcfaceresnet100-8.onnx", "./public/mobilefacenet.onnx");
    console.log("Downloads complete!");
  } catch (err) {
    console.error("Error downloading:", err);
  }
}

main();
