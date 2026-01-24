import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, '../dist');
const indexHtml = path.resolve(distDir, 'index.html');
const notFoundHtml = path.resolve(distDir, '404.html');

console.log(`Copying ${indexHtml} to ${notFoundHtml}...`);

try {
    if (fs.existsSync(indexHtml)) {
        fs.copyFileSync(indexHtml, notFoundHtml);
        console.log('Successfully copied index.html to 404.html');
    } else {
        console.error('Error: index.html not found in dist directory. Make sure to run build first.');
        process.exit(1);
    }
} catch (error) {
    console.error('Error copying file:', error);
    process.exit(1);
}
