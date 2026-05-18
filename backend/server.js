import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  }
});

const PORT = 3001;

// Define the root workspace directory
const WORKSPACE_DIR = path.join(__dirname, '../workspace');

if (!fs.existsSync(WORKSPACE_DIR)) {
  fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());

// Helper to build a file tree recursively
function buildTree(dirPath, basePath = '') {
  const items = fs.readdirSync(dirPath);
  const tree = [];

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const relativePath = path.join(basePath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      tree.push({
        name: item,
        type: 'directory',
        path: relativePath,
        children: buildTree(fullPath, relativePath),
      });
    } else {
      tree.push({
        name: item,
        type: 'file',
        path: relativePath,
      });
    }
  }

  return tree;
}

app.get('/api/fs/tree', (req, res) => {
  try {
    const tree = buildTree(WORKSPACE_DIR);
    res.json(tree);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/fs/file', (req, res) => {
  const filePath = req.query.path;
  if (!filePath) return res.status(400).json({ error: 'Path is required' });

  const absolutePath = path.join(WORKSPACE_DIR, filePath);
  
  if (!absolutePath.startsWith(WORKSPACE_DIR)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    if (fs.existsSync(absolutePath)) {
      const content = fs.readFileSync(absolutePath, 'utf8');
      res.json({ content });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/fs/file', (req, res) => {
  const { path: filePath, content = '' } = req.body;
  if (!filePath) return res.status(400).json({ error: 'Path is required' });

  const absolutePath = path.join(WORKSPACE_DIR, filePath);
  
  if (!absolutePath.startsWith(WORKSPACE_DIR)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const dir = path.dirname(absolutePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(absolutePath, content, 'utf8');
    res.json({ success: true, path: filePath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/fs/file', (req, res) => {
  const { path: filePath, content } = req.body;
  if (!filePath) return res.status(400).json({ error: 'Path is required' });

  const absolutePath = path.join(WORKSPACE_DIR, filePath);
  
  if (!absolutePath.startsWith(WORKSPACE_DIR)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    fs.writeFileSync(absolutePath, content, 'utf8');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/fs/file', (req, res) => {
  const filePath = req.query.path;
  if (!filePath) return res.status(400).json({ error: 'Path is required' });

  const absolutePath = path.join(WORKSPACE_DIR, filePath);
  
  if (!absolutePath.startsWith(WORKSPACE_DIR)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    const stat = fs.statSync(absolutePath);
    if (stat.isDirectory()) {
      fs.rmSync(absolutePath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(absolutePath);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Execution Engine ---
const activeProcesses = new Map();

io.on('connection', (socket) => {
  console.log('Client connected to terminal socket');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.post('/api/run', (req, res) => {
  const { path: filePath } = req.body;
  if (!filePath) return res.status(400).json({ error: 'Path is required' });

  const absolutePath = path.join(WORKSPACE_DIR, filePath);
  if (!fs.existsSync(absolutePath)) return res.status(404).json({ error: 'File not found' });

  const ext = path.extname(absolutePath).toLowerCase();
  const dir = path.dirname(absolutePath);
  const processId = Date.now().toString();

  res.json({ processId });
  
  io.emit('output', { processId, data: `> Running ${filePath}...\n` });

  let child;
  
  if (ext === '.py') {
    // Determine python command depending on OS
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    child = spawn(pythonCmd, [absolutePath], { cwd: dir });
    handleProcess(child, processId);
  } else if (ext === '.java') {
    io.emit('output', { processId, data: `⏳ Compiling ${filePath}...\n` });
    const compile = spawn('javac', [absolutePath], { cwd: dir });
    
    compile.stdout.on('data', (data) => io.emit('output', { processId, data: data.toString() }));
    compile.stderr.on('data', (data) => io.emit('output', { processId, data: data.toString() }));
    
    compile.on('close', (code) => {
      if (code === 0) {
        io.emit('output', { processId, data: `✓ Compiled successfully. Executing...\n` });
        const className = path.basename(absolutePath, '.java');
        child = spawn('java', [className], { cwd: dir });
        handleProcess(child, processId);
      } else {
        io.emit('exit', { processId, code });
      }
    });
  } else {
    io.emit('output', { processId, data: `Execution not supported for ${ext} files.\n` });
    io.emit('exit', { processId, code: 1 });
  }
});

function handleProcess(child, processId) {
  activeProcesses.set(processId, child);

  child.stdout.on('data', (data) => {
    io.emit('output', { processId, data: data.toString() });
  });

  child.stderr.on('data', (data) => {
    io.emit('output', { processId, data: data.toString() });
  });

  child.on('close', (code) => {
    io.emit('exit', { processId, code });
    activeProcesses.delete(processId);
  });
  
  child.on('error', (err) => {
    io.emit('output', { processId, data: `Process error: ${err.message}\n` });
    io.emit('exit', { processId, code: 1 });
    activeProcesses.delete(processId);
  });
}

app.post('/api/stop', (req, res) => {
  const { processId } = req.body;
  const child = activeProcesses.get(processId);
  if (child) {
    child.kill(); // On Windows, might need taskkill for deeper process trees, but this is fine for now
    activeProcesses.delete(processId);
    io.emit('output', { processId, data: '\n> Process terminated by user.\n' });
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Process not found or already exited' });
  }
});

httpServer.listen(PORT, () => {
  console.log(`Backend FS API running on http://localhost:${PORT}`);
});
