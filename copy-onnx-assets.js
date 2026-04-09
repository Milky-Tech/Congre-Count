import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sourceDir = path.join(__dirname, 'node_modules', 'onnxruntime-web', 'dist');
const targetDir = path.join(__dirname, 'public', 'ort-assets');

console.log('📦 Copying ONNX Runtime assets...');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`  📁 Created directory: ${targetDir}`);
}

try {
  const files = fs.readdirSync(sourceDir);
  let count = 0;

  files.forEach(file => {
    if (file.endsWith('.wasm') || file.endsWith('.mjs')) {
      const srcPath = path.join(sourceDir, file);
      let destName = file;
      
      // Rename .mjs to .js for server compatibility
      if (file.endsWith('.mjs')) {
        destName = file.replace(/\.mjs$/, '.js');
      }
      
      const destPath = path.join(targetDir, destName);
      fs.copyFileSync(srcPath, destPath);
      count++;
    }
  });

  console.log(`✅ Successfully copied ${count} assets to public/ort-assets/`);
} catch (err) {
  console.error('❌ Failed to copy ONNX assets:', err);
  process.exit(1);
}
