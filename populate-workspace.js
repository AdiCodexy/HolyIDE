import { SUBJECTS } from './src/components/snippets.js';
import fs from 'fs';
import path from 'path';

const WORKSPACE_DIR = path.join(process.cwd(), 'workspace');

if (!fs.existsSync(WORKSPACE_DIR)) {
  fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
}

for (const subject of SUBJECTS) {
  const subjectDir = path.join(WORKSPACE_DIR, subject.name);
  if (!fs.existsSync(subjectDir)) {
    fs.mkdirSync(subjectDir, { recursive: true });
  }

  for (const q of subject.questions) {
    // Add some metadata to the file, maybe as a comment if possible, but let's just write the code.
    const filePath = path.join(subjectDir, q.filename);
    fs.writeFileSync(filePath, q.code, 'utf8');
    console.log(`Created ${filePath}`);
  }
}
