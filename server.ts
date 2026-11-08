import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const ATTEMPTS_FILE = path.resolve(DATA_DIR, 'attempts.json');
const PRESENCE_TIMEOUT_MS = 60000; // 60 seconds

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory student presence tracker for Live Exam Room
// Key: studentId -> { studentId, studentCode, testId, currentQIndex, status, lastSeen }
interface StudentPresence {
  studentId: string;
  studentCode: string;
  currentTestId?: string;
  currentQIndex?: number;
  totalQuestions?: number;
  status: 'online' | 'taking_test' | 'submitted';
  lastSeen: number;
}

const presenceMap = new Map<string, StudentPresence>();

function readAttempts(): any[] {
  try {
    if (fs.existsSync(ATTEMPTS_FILE)) {
      const content = fs.readFileSync(ATTEMPTS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading attempts file:', err);
  }
  return [];
}

function writeAttempts(attempts: any[]): void {
  try {
    fs.writeFileSync(ATTEMPTS_FILE, JSON.stringify(attempts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing attempts file:', err);
  }
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));

  // Enable CORS for local network student tablets
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // ==================== REAL-TIME CLASSROOM CENTRALIZATION API ====================

  // 1. Health check & Server Info
  app.get('/api/status', (req, res) => {
    res.json({
      status: 'ok',
      serverTime: new Date().toISOString(),
      service: "Suivi-Pédagogique Teacher Central Server",
      activeStudentsCount: Array.from(presenceMap.values()).filter(
        p => Date.now() - p.lastSeen < PRESENCE_TIMEOUT_MS
      ).length,
      totalAttemptsStored: readAttempts().length,
    });
  });

  // 2. GET all centralized copies (for Teacher Dashboard & Student Sync)
  app.get('/api/attempts', (req, res) => {
    const attempts = readAttempts();
    res.json(attempts);
  });

  // 3. POST - Student tablet submits an exam copy
  app.post('/api/attempts', (req, res) => {
    const newAttempt = req.body;
    if (!newAttempt || !newAttempt.id || !newAttempt.studentId) {
      return res.status(400).json({ error: 'Attempt data missing id or studentId' });
    }

    const attempts = readAttempts();
    const existingIndex = attempts.findIndex(a => a.id === newAttempt.id || (a.evaluationId === newAttempt.evaluationId && a.studentId === newAttempt.studentId));

    if (existingIndex >= 0) {
      // Update existing attempt
      attempts[existingIndex] = { ...attempts[existingIndex], ...newAttempt };
    } else {
      // Add new copy
      attempts.unshift(newAttempt);
    }

    writeAttempts(attempts);

    // Update presence
    presenceMap.set(newAttempt.studentId, {
      studentId: newAttempt.studentId,
      studentCode: newAttempt.studentCode || '',
      currentTestId: newAttempt.evaluationId,
      status: 'submitted',
      lastSeen: Date.now(),
    });

    console.log(`[PC Prof] Nouvelle copie centralisée: Élève ${newAttempt.studentId} pour l'évaluation ${newAttempt.evaluationId}`);

    res.json({ success: true, attempt: newAttempt, totalStored: attempts.length });
  });

  // 4. PUT - Teacher grades or edits a copy in Correction Center
  app.put('/api/attempts/:id', (req, res) => {
    const { id } = req.params;
    const updatedAttempt = req.body;

    const attempts = readAttempts();
    const existingIndex = attempts.findIndex(a => a.id === id);

    if (existingIndex >= 0) {
      attempts[existingIndex] = { ...attempts[existingIndex], ...updatedAttempt };
      writeAttempts(attempts);
      return res.json({ success: true, attempt: attempts[existingIndex] });
    }

    // If not found, append
    attempts.unshift(updatedAttempt);
    writeAttempts(attempts);
    res.json({ success: true, attempt: updatedAttempt });
  });

  // 5. POST - Student Tablet Heartbeat / Live Exam Progress
  app.post('/api/presence', (req, res) => {
    const { studentId, studentCode, currentTestId, currentQIndex, totalQuestions, status } = req.body;
    if (!studentId) {
      return res.status(400).json({ error: 'studentId is required' });
    }

    presenceMap.set(studentId, {
      studentId,
      studentCode: studentCode || '',
      currentTestId,
      currentQIndex: currentQIndex ?? 0,
      totalQuestions: totalQuestions ?? 1,
      status: status || 'online',
      lastSeen: Date.now(),
    });

    res.json({ success: true });
  });

  // 6. GET - Teacher views Live Exam Room (connected tablets in real-time)
  app.get('/api/presence', (req, res) => {
    const now = Date.now();
    const active: StudentPresence[] = [];

    presenceMap.forEach((pres, id) => {
      if (now - pres.lastSeen < PRESENCE_TIMEOUT_MS) {
        active.push(pres);
      } else {
        presenceMap.delete(id);
      }
    });

    res.json(active);
  });

  // 7. Reset server attempts data to empty or initial
  app.post('/api/reset', (req, res) => {
    writeAttempts([]);
    presenceMap.clear();
    res.json({ success: true, message: 'Server data reset' });
  });

  // ==================== VITE SPA MIDDLEWARE / SERVE ====================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Suivi-Pédagogique] Serveur Central PC Prof actif sur http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
