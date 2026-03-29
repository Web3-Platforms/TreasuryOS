import fs from 'fs';
import path from 'path';

const docsDir = path.resolve('./docs');
const dirs = {
  assets: path.join(docsDir, 'assets'),
  history: path.join(docsDir, 'history'),
  architecture: path.join(docsDir, 'architecture'),
  deployment: path.join(docsDir, 'deployment'),
};

// Ensure target directories exist to prevent ENOENT errors
Object.values(dirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const files = fs.readdirSync(docsDir);

function moveFile(filename, targetFolder) {
  const oldPath = path.join(docsDir, filename);
  const newPath = path.join(targetFolder, filename);
  
  try {
    console.log(`Moving ${filename} to ${path.basename(targetFolder)}`);
    fs.renameSync(oldPath, newPath);
  } catch (err) {
    console.error(`Failed to move ${filename}:`, err.message);
  }
}

const historyKeywords = [
  'walkthrough', 'implementation', 'task', 'mvp-execution', 
  'replace', 'transaction'
];

const assetExtensions = new Set(['.png', '.pdf', '.csv', '.dmg', '.jpg', '.jpeg']);

files.forEach(file => {
  const oldPath = path.join(docsDir, file);
  const stat = fs.statSync(oldPath);
  
  if (!stat.isFile()) return;

  const ext = path.extname(file).toLowerCase();
  const lowerFile = file.toLowerCase();

  if (assetExtensions.has(ext)) {
    moveFile(file, dirs.assets);
  } else if (
    historyKeywords.some(kw => lowerFile.includes(kw)) ||
    lowerFile === 'mvp-scope.md' ||
    lowerFile === 'project_report.md'
  ) {
    // Avoid classifying the new root plans as history unless they are the old ones
    if (file !== 'implementation_plan.md') {
      moveFile(file, dirs.history);
    }
  } else if (file === 'runtime-hardening-report.md' || file === 'workflow-model.md') {
    moveFile(file, dirs.architecture);
  } else if (file === 'CLOUDFLARE_SECURITY_HARDENING.md' || file === 'setup-notes.md') {
    moveFile(file, dirs.deployment);
  }
});
