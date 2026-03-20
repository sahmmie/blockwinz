// Nest Swagger plugin emits require("../../../../packages/shared/dist/index") in compiled JS.
// Resolved from dist/src/... that lands under blockwinz-api/packages/shared — symlink this dir to repo packages/.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const apiDir = path.join(root, 'blockwinz-api');
const linkPath = path.join(apiDir, 'packages');
const targetDir = path.join(root, 'packages');

if (!fs.existsSync(apiDir)) {
  process.exit(0);
}

try {
  const stat = fs.lstatSync(linkPath);
  if (stat.isSymbolicLink()) {
    const cur = fs.readlinkSync(linkPath);
    const expected = path.relative(apiDir, targetDir) || '..';
    if (path.resolve(apiDir, cur) === targetDir) {
      process.exit(0);
    }
    fs.unlinkSync(linkPath);
  } else if (stat.isDirectory()) {
    console.warn(
      '[ensure-blockwinz-api-packages-symlink] blockwinz-api/packages exists and is not a symlink; skip.',
    );
    process.exit(0);
  }
} catch {
  // does not exist
}

fs.symlinkSync(path.relative(apiDir, targetDir), linkPath);
console.log('[ensure-blockwinz-api-packages-symlink] linked blockwinz-api/packages -> ../packages');
